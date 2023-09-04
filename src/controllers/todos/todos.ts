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

export const createToDo: RequestHandler = (req, res) => {
  const createItem = pipe(
    safeParseNonEmptyString(req.body?.text),
    Effect.flatMap((text) => createTodoQuery(text)),
    Effect.flatMap((res) => parseTodo(res)),
    Effect.flatMap((todo) => Effect.succeed(res.status(201).json({ todo })))
  );

  return pipe(createItem, Effect.runPromise);
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

  const selectAllItems = pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ sortBy, order, filters }) =>
      selectAllTodosQuery(sortBy, order, filters)
    ),
    Effect.flatMap((res) => parseTodoArray(res)),
    Effect.flatMap((todos) => Effect.succeed(res.status(200).json({ todos })))
  );

  return pipe(selectAllItems, Effect.runPromise);
};

export const getToDo: RequestHandler = (req, res) => {
  const selectItem = pipe(
    safeParseNumber(req.params?.id),
    Effect.flatMap((id) => selectTodoByIdQuery(id)),
    Effect.flatMap((res) => parseTodo(res)),
    Effect.flatMap((todo) => Effect.succeed(res.status(200).json({ todo })))
  );

  return pipe(selectItem, Effect.runPromise);
};

export const deleteToDo: RequestHandler = (req, res) => {
  const deleteItem = pipe(
    safeParseNumber(req.params?.id),
    Effect.flatMap((id) => deleteByIdQuery(id)),
    Effect.flatMap(() => Effect.succeed(res.status(204).json({})))
  );

  return pipe(deleteItem, Effect.runPromise);
};

export const updateToDo: RequestHandler = (req, res) => {
  const safeParams = {
    id: safeParseNumber(req.params?.id),
    text: safeParseNonEmptyString(req.body?.text),
  };

  const updateItem = pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ id, text }) => updateTodosQuery(id, text)),
    Effect.flatMap((res) => parseTodo(res)),
    Effect.flatMap((todo) => Effect.succeed(res.status(200).json({ todo })))
  );

  return pipe(updateItem, Effect.runPromise);
};
