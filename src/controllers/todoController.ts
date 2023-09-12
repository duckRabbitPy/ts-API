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
import { parseDateFilter } from "./queryParams/filtering/date/dateFilter";
import { parseNumericalFilter } from "./queryParams/filtering/number/numericalFilter";
import { parseStringFilter } from "./queryParams/filtering/string/stringFilter";
import { safeParseDefinedFields } from "./queryParams/definedFields";
import { safeParsePagination } from "./queryParams/pagination";
import { safeParseNonEmptyString, safeParseNumber } from "./utils/parseHelpers";
import { ParseError } from "@effect/schema/ParseResult";

export const getFilterParamsFromRequest = (req: Request) => {
  return {
    id: parseNumericalFilter(req.query?.id),
    text: parseStringFilter(req.query?.text),
    updated_at: parseDateFilter(req.query?.updated_at),
  };
};

export const createToDoItem: RequestHandler = (req, res) => {
  return pipe(
    safeParseNonEmptyString(req.body?.text),
    Effect.flatMap((text) => createTodoQuery(text)),
    Effect.flatMap((result) => parseTodo(result)),
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

  const safeParams = {
    sortBy: safeParseSortByParam(req.query.sortBy).pipe(
      Effect.orElseSucceed(() => "id" as const)
    ),
    order: safeParseOrderParam(req.query.order).pipe(
      Effect.orElseSucceed(() => "asc" as const)
    ),
    filters: Effect.succeed(filters),
    definedFields: safeParseDefinedFields(req.query.fields).pipe(
      Effect.orElseSucceed(
        () => ["id", "text", "updated_at"] as readonly string[]
      )
    ),
    pagination: safeParsePagination(req).pipe(
      Effect.orElseSucceed(() => ({
        limit: 5,
        offset: 0,
      }))
    ),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ sortBy, order, filters, definedFields, pagination }) =>
      selectAllTodosQuery(sortBy, order, filters, definedFields, pagination)
    ),
    Effect.flatMap((result) => parseTodoArray(result)),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
      })
  );
};

export const getToDoItem: RequestHandler = (req, res) => {
  const safeParams = {
    id: safeParseNumber(Number(req.params?.id)),
    definedFields: safeParseDefinedFields(req.query.fields).pipe(
      Effect.orElseSucceed(
        () => ["id", "text", "updated_at"] as readonly string[]
      )
    ),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ id, definedFields }) =>
      selectTodoByIdQuery(id, definedFields)
    ),
    Effect.flatMap((result) => parseTodo(result)),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
      })
  );
};

// todo return more specific not found err
export const deleteToDoItem: RequestHandler = (req, res) => {
  return pipe(
    safeParseNumber(Number(req.params?.id)),
    Effect.flatMap((id) => deleteByIdQuery(id)),
    (finalEffect) =>
      resolveResponse({
        finalEffect,
        response: res,
        successStatus: 204,
      })
  );
};

export const updateToDoItem: RequestHandler = (req, res) => {
  const safeParams = {
    id: safeParseNumber(Number(req.params?.id)),
    text: safeParseNonEmptyString(req.body?.text),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ id, text }) => updateTodosQuery(id, text)),
    Effect.flatMap((res) => parseTodo(res)),
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
    ParseError | Error,
    Todo | readonly Todo[] | void
  >;
  response: Response;
  successStatus: number;
};

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
            return Effect.succeed(
              response.status(500).json({
                message: `Fail: ${JSON.stringify(cause.error)}`,
              })
            );
          case "Die":
            return Effect.succeed(
              response
                .status(500)
                .json({ message: `Die: ${JSON.stringify(cause.defect)}` })
            );
          case "Interrupt":
            Effect.succeed(
              response
                .status(500)
                .json({
                  message: `Interrupt: ${JSON.stringify(cause.fiberId)}`,
                })
            );
        }
        return Effect.succeed(response.status(500).json(`Server error`));
      },
      onSuccess: (todos) =>
        Effect.succeed(response.status(successStatus).json({ todos })),
    }),
    Effect.runPromise
  );
}
