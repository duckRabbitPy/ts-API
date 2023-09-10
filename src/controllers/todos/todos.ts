import { RequestHandler } from "express";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import {
  createTodoQuery,
  deleteByIdQuery,
  selectAllTodosQuery,
  selectTodoByIdQuery,
  updateTodosQuery,
} from "./sqlQueries";
import {} from "../../models/queryParams/numberComparison";
import { parseTodo, parseTodoArray } from "../../models/todos";
import { Request } from "express";
import { resolveResponse } from "../utils/resolveResponse";
import { safeParseSortByParam } from "../../models/queryParams/sortBy";
import { safeParseOrderParam } from "../../models/queryParams/order";
import { safeParseNonEmptyString, safeParseNumber } from "../../models/common";
import { parseDateFilter } from "../utils/dateFilter";
import { parseNumericalFilter } from "../utils/numericalFilter";
import { parseStringFilter } from "../utils/stringFilter";
import { parseDefinedFields } from "../utils/common";

export const getFilterParamsFromRequest = (req: Request) => {
  return {
    id: parseNumericalFilter(req.query?.id),
    text: parseStringFilter(req.query?.text),
    updated_at: parseDateFilter(req.query?.updated_at),
  };
};

export const createToDo: RequestHandler = (req, res) => {
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

export const getAllToDos: RequestHandler = (req, res) => {
  const filters = getFilterParamsFromRequest(req);

  const safeParams = {
    sortBy: safeParseSortByParam(req.query.sortBy).pipe(
      Effect.orElseSucceed(() => "id" as const)
    ),
    order: safeParseOrderParam(req.query.order).pipe(
      Effect.orElseSucceed(() => "asc" as const)
    ),
    filters: Effect.succeed(filters),
    definedFields: parseDefinedFields(req.query.fields).pipe(
      Effect.orElseSucceed(
        () => ["id", "text", "updated_at"] as readonly string[]
      )
    ),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ sortBy, order, filters, definedFields }) =>
      selectAllTodosQuery(sortBy, order, filters, definedFields)
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

export const getToDo: RequestHandler = (req, res) => {
  return pipe(
    safeParseNumber(Number(req.params?.id)),
    Effect.flatMap((id) => selectTodoByIdQuery(id)),
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
export const deleteToDo: RequestHandler = (req, res) => {
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

export const updateToDo: RequestHandler = (req, res) => {
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
