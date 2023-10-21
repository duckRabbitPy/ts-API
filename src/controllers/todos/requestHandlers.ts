import { RequestHandler } from "express";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  createTodoQuery,
  deleteByIdQuery,
  parseTodo,
  parseTodoArray,
  selectAllTodosQuery,
  selectTodoByIdQuery,
  updateTodosQuery,
} from "../../models/todos";

import { safeParseSortByParam } from "../queryParams/sorting/sortBy";
import { safeParseOrderParam } from "../queryParams/sorting/order";
import { safeParseDefinedFields } from "../queryParams/definedFields";
import { safeParsePagination } from "../queryParams/pagination";

import { ParameterError } from "../customErrors";
import { sendResponse } from "./responseHandler";

import {
  checkIfNoResult,
  checkNoExcessFieldsForUpdate,
  getFilterParamsFromRequest,
  safeParseCreateToDoFieldsFromBody,
  safeParseIDRequestParameter,
} from "./httpRequestUtils";
import {
  safeParseNonEmptyString,
  safeParseBoolean,
} from "../../sharedUtils.ts/primitiveParsers";

export const createToDoItem: RequestHandler = (req, res) => {
  return pipe(
    req.body,
    safeParseCreateToDoFieldsFromBody,
    Effect.orElseFail(
      () =>
        new ParameterError({
          message:
            "Invalid input in request body. Expected {text: string} (non-empty)",
        })
    ),
    Effect.flatMap((body) => createTodoQuery(body.text)),
    Effect.flatMap(parseTodo),
    (getDataEffect) =>
      sendResponse({
        getDataEffect,
        response: res,
        successStatus: 201,
      })
  );
};

export const getAllToDoItems: RequestHandler = (req, res) => {
  const maybeSafeArgs = {
    sort_by: safeParseSortByParam(req.query.sortBy).pipe(
      Effect.orElseSucceed(() => "id" as const)
    ),
    order: safeParseOrderParam(req.query.order).pipe(
      Effect.orElseSucceed(() => "asc" as const)
    ),
    filters: getFilterParamsFromRequest(req),
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
    Effect.all(maybeSafeArgs),
    Effect.flatMap((safeArgs) => selectAllTodosQuery(safeArgs)),
    Effect.flatMap(parseTodoArray),
    (getDataEffect) =>
      sendResponse({
        getDataEffect,
        response: res,
        successStatus: 200,
      })
  );
};

export const getToDoItem: RequestHandler = (req, res) => {
  const maybeSafeArgs = {
    id: safeParseIDRequestParameter(req),
    definedFields: safeParseDefinedFields(req.query.fields).pipe(
      Effect.orElseSucceed(
        () => ["id", "text", "updated_at"] as readonly string[]
      )
    ),
  };

  return pipe(
    Effect.all(maybeSafeArgs),
    Effect.flatMap((safeArgs) => selectTodoByIdQuery(safeArgs)),
    Effect.flatMap(checkIfNoResult),
    Effect.flatMap(parseTodo),
    (getDataEffect) =>
      sendResponse({
        getDataEffect,
        response: res,
        successStatus: 200,
      })
  );
};

export const deleteToDoItem: RequestHandler = (req, res) => {
  return pipe(
    safeParseIDRequestParameter(req),
    Effect.flatMap((id) => deleteByIdQuery(id)),
    Effect.flatMap(checkIfNoResult),
    (getDataEffect) =>
      sendResponse({
        getDataEffect,
        response: res,
        successStatus: 204,
      })
  );
};

export const updateToDoItem: RequestHandler = (req, res) => {
  const maybeSafeArgs = {
    id: safeParseIDRequestParameter(req),
    text: safeParseNonEmptyString(req.body?.text).pipe(
      Effect.orElseSucceed(() => undefined)
    ),
    completed: safeParseBoolean(req.body?.completed).pipe(
      Effect.orElseSucceed(() => undefined)
    ),
  };

  return pipe(
    checkNoExcessFieldsForUpdate(req.body),
    Effect.flatMap(() => Effect.all(maybeSafeArgs)),
    Effect.flatMap((safeArgs) => updateTodosQuery(safeArgs)),
    Effect.flatMap(checkIfNoResult),
    Effect.flatMap(parseTodo),
    (getDataEffect) =>
      sendResponse({
        getDataEffect,
        response: res,
        successStatus: 200,
      })
  );
};
