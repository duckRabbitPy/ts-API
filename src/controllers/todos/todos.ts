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
import {
  safeParseNonEmptyString,
  safeParseNumber,
  safeParseOrderParam,
  safeParseSortByParam,
} from "../../models/queryParams";
import { parseTodo, parseTodoArray } from "../../models/todos";
import { getFilterParamsFromRequest } from "../utils/filter";
import { resolveResponse } from "../utils/resolveResponse";

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
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ sortBy, order, filters }) =>
      selectAllTodosQuery(sortBy, order, filters)
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
  console.log(req.params?.ids);
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
