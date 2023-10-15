import { RequestHandler } from "express";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import {} from "./queryParams/filtering/number/numberComparison";
import {
  createTodoQuery,
  deleteByIdQuery,
  parseTodo,
  parseTodoArray,
  selectAllTodosQuery,
  selectTodoByIdQuery,
  Todo,
  updateTodosQuery,
} from "../models/todos";
import { Request, Response } from "express";
import { safeParseSortByParam } from "./queryParams/sorting/sortBy";
import { safeParseOrderParam } from "./queryParams/sorting/order";
import { parseDateQueryFilter } from "./queryParams/filtering/date/dateFilter";
import { parseNumericalQueryFilter } from "./queryParams/filtering/number/numericalFilter";
import { parseStringFilter as parseStringQueryFilter } from "./queryParams/filtering/string/stringFilter";
import { safeParseDefinedFields } from "./queryParams/definedFields";
import { safeParsePagination } from "./queryParams/pagination";
import {
  checkIfNoResult,
  checkNoExcessFieldsForUpdate,
  safeParseBoolean,
  safeParseInitFieldsFromBody,
  safeParseNonEmptyString,
  safeParseNumber,
} from "./utils/parseHelpers";
import { ParseError } from "@effect/schema/ParseResult";
import {
  ItemNotFoundError,
  ParameterError,
  PostgresError,
} from "./customErrors";
import { parseBooleanQueryFilter } from "./queryParams/filtering/boolean/booleanFilter";

export const getFilterParamsFromRequest = (req: Request) => {
  const idFilter = parseNumericalQueryFilter(req.query.id);

  const textFilter = parseStringQueryFilter(req.query.text);

  const updatedAtFilter = parseDateQueryFilter(req.query.updated_at);

  const completedFilter = parseBooleanQueryFilter(req.query.completed);

  return pipe(
    Effect.all({ idFilter, textFilter, updatedAtFilter, completedFilter })
  );
};

export const createToDoItem: RequestHandler = (req, res) => {
  return pipe(
    req.body,
    safeParseInitFieldsFromBody,
    Effect.orElseFail(
      () => new ParameterError({ message: "Invalid creat todo input" })
    ),
    Effect.flatMap((body) => createTodoQuery(body.text)),
    Effect.flatMap(parseTodo),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 201,
      })
  );
};

export const getAllToDoItems: RequestHandler = (req, res) => {
  const filters = getFilterParamsFromRequest(req);

  const getSafeParams = {
    sort_by: safeParseSortByParam(req.query.sortBy).pipe(
      Effect.orElseSucceed(() => "id" as const)
    ),
    order: safeParseOrderParam(req.query.order).pipe(
      Effect.orElseSucceed(() => "asc" as const)
    ),
    filters: filters,
    definedFields: safeParseDefinedFields(req.query.fields).pipe(
      Effect.orElseSucceed(() => ["*"] as readonly string[])
    ),
    pagination: safeParsePagination(req).pipe(
      Effect.orElseSucceed(() => ({
        limit: 20,
        offset: 0,
      }))
    ),
  };

  return pipe(
    Effect.all(getSafeParams),
    Effect.flatMap((safeParams) => selectAllTodosQuery(safeParams)),
    Effect.flatMap(parseTodoArray),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
      })
  );
};

export const getToDoItem: RequestHandler = (req, res) => {
  const getSafeParams = {
    id: safeParseNumber(Number(req.params?.id)).pipe(
      Effect.orElseFail(() => new ParameterError({ message: "Invalid id" }))
    ),
    definedFields: safeParseDefinedFields(req.query.fields).pipe(
      Effect.orElseSucceed(
        () => ["id", "text", "updated_at"] as readonly string[]
      )
    ),
  };

  return pipe(
    Effect.all(getSafeParams),
    Effect.flatMap(({ id, definedFields }) =>
      selectTodoByIdQuery(id, definedFields)
    ),
    Effect.flatMap(checkIfNoResult),
    Effect.flatMap(parseTodo),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
      })
  );
};

export const deleteToDoItem: RequestHandler = (req, res) => {
  return pipe(
    safeParseNumber(Number(req.params?.id)),
    Effect.flatMap((id) => deleteByIdQuery(id)),
    Effect.flatMap(checkIfNoResult),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 204,
      })
  );
};

export const updateToDoItem: RequestHandler = (req, res) => {
  const getSafeParams = {
    id: safeParseNumber(Number(req.params?.id)).pipe(
      Effect.orElseFail(
        () => new ParameterError({ message: "Invalid id parameter" })
      )
    ),
    text: safeParseNonEmptyString(req.body?.text).pipe(
      Effect.orElseSucceed(() => undefined)
    ),
    completed: safeParseBoolean(req.body?.completed).pipe(
      Effect.orElseSucceed(() => undefined)
    ),
  };

  return pipe(
    checkNoExcessFieldsForUpdate(req.body),
    Effect.flatMap(() => Effect.all(getSafeParams)),
    Effect.flatMap((safeParams) => updateTodosQuery(safeParams)),
    Effect.flatMap(checkIfNoResult),
    Effect.flatMap(parseTodo),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
      })
  );
};

type ResolveResponseInput = {
  finalEffect: Effect.Effect<
    never,
    ParseError | PostgresError | ParameterError | ItemNotFoundError,
    Todo | readonly Todo[] | void
  >;
  response: Response;
  successStatus: number;
};

const respondWithError = (
  response: Response,
  status: number,
  message: string
) =>
  pipe(
    Effect.succeed(
      response.status(status).json({
        message: `Fail: ${message}`,
      })
    )
  );

function resolveResponse({
  finalEffect,
  response,
  successStatus,
}: ResolveResponseInput) {
  return pipe(
    Effect.matchCauseEffect(finalEffect, {
      onFailure: (cause) => {
        switch (cause._tag) {
          case "Fail":
            if (cause.error._tag === "ItemNotFoundError") {
              return respondWithError(response, 404, cause.error._tag);
            }
            if (cause.error._tag === "ParameterError") {
              return respondWithError(response, 400, cause.error._tag);
            }
            return respondWithError(response, 500, cause.error._tag);
          case "Die":
          case "Interrupt":
            respondWithError(response, 500, "Internal server error");
        }
        return Effect.succeed(
          response.status(500).json("Internal Server error")
        );
      },
      onSuccess: (todos) =>
        Effect.succeed(response.status(successStatus).json(todos)),
    }),
    Effect.runPromise
  );
}
