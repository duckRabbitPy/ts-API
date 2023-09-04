import { RequestHandler } from "express";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import {
  getBodyTextFromRequest,
  getIdFromRequest,
} from "../validation/requests";
import {
  createTodoQuery,
  deleteByIdQuery,
  selectAllTodosQuery,
  selectTodoByIdQuery,
  updateTodosQuery,
} from "./sqlQueries";
import {
  safeParseOrderParam,
  safeParseSortByParam,
} from "../../models/queryParams";
import { parseTodo, parseTodoArray } from "../../models/todos";

export const createToDo: RequestHandler = (req, res) => {
  const createItem = pipe(
    getBodyTextFromRequest(req),
    Effect.flatMap((text) => createTodoQuery(text)),
    Effect.flatMap((res) => parseTodo(res)),
    Effect.flatMap((todo) => Effect.succeed(res.status(201).json({ todo })))
  );

  return pipe(createItem, Effect.runPromise);
};

export const getAllToDos: RequestHandler = (req, res) => {
  const safeParams = {
    sortBy: safeParseSortByParam(req.query.sortBy).pipe(
      Effect.orElseSucceed(() => "id" as const)
    ),
    order: safeParseOrderParam(req.query.order).pipe(
      Effect.orElseSucceed(() => "asc" as const)
    ),
  };

  const selectAllItems = pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ sortBy, order }) => selectAllTodosQuery(sortBy, order)),
    Effect.flatMap((res) => parseTodoArray(res)),
    Effect.flatMap((todos) => Effect.succeed(res.status(200).json({ todos })))
  );

  return pipe(selectAllItems, Effect.runPromise);
};

export const getToDo: RequestHandler = (req, res) => {
  const selectItem = pipe(
    getIdFromRequest(req),
    Effect.flatMap((id) => selectTodoByIdQuery(id)),
    Effect.flatMap((res) => parseTodo(res)),
    Effect.flatMap((todo) => Effect.succeed(res.status(200).json({ todo })))
  );

  return pipe(selectItem, Effect.runPromise);
};

export const deleteToDo: RequestHandler = (req, res) => {
  const deleteItem = pipe(
    getIdFromRequest(req),
    Effect.flatMap((id) => deleteByIdQuery(id)),
    Effect.flatMap(() => Effect.succeed(res.status(204).json({})))
  );

  return pipe(deleteItem, Effect.runPromise);
};

export const updateToDo: RequestHandler = (req, res) => {
  const safeParams = {
    id: getIdFromRequest(req),
    text: getBodyTextFromRequest(req),
  };

  const updateItem = pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ id, text }) => updateTodosQuery(id, text)),
    Effect.flatMap((res) => parseTodo(res)),
    Effect.flatMap((todo) => Effect.succeed(res.status(200).json({ todo })))
  );

  return pipe(updateItem, Effect.runPromise);
};
