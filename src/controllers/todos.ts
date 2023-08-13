import { RequestHandler } from "express";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Pg from "@sqlfx/pg";

import ToDo, { parseTodo } from "../models/todos";
import { Config } from "effect";

const TODOs: ToDo[] = [];

export const createToDo: RequestHandler = (req, res, next) => {
  const text = (req.body as { text: string }).text;
  const newToDo = new ToDo(Math.random().toString().slice(0, 3), text);
  TODOs.push(newToDo);
  res.status(201).json({ message: "created Todo", newToDo: newToDo });
};

export const getToDo: RequestHandler = (req, res, next) => {
  const PgLive = Pg.makeLayer({
    database: Config.succeed("effect_pg_dev"),
  });

  const selectAllTodos = pipe(
    Pg.tag,
    Effect.flatMap(
      (sql) =>
        sql<{
          readonly id: number;
          readonly text: string;
        }>`SELECT id, text FROM todos`
    ),
    Effect.map((todos) => todos.map((todo) => parseTodo(todo))),
    Effect.flatMap((effectArr) => Effect.all(effectArr)),
    Effect.flatMap((todos) => Effect.succeed(res.json({ todos: todos })))
  );

  pipe(selectAllTodos, Effect.provideLayer(PgLive), Effect.runPromise);
};

export const updateToDo: RequestHandler<{ id: string }> = (req, res, next) => {
  const todoID = req.params.id;
  const updatedText = (req.body as { text: string }).text;
  const todoIndex = TODOs.findIndex((elem) => todoID === elem.id);

  if (todoIndex < 0) {
    throw new Error("Could not foind todo");
  }

  TODOs[todoIndex] = new ToDo(TODOs[todoIndex].id, updatedText);

  res.json({ message: "Updated todo!", updatedToDo: TODOs[todoIndex] });
};

export const deleteToDo: RequestHandler<{ id: string }> = (req, res, next) => {
  const todoID = req.params.id;
  const todoIndex = TODOs.findIndex((elem) => todoID === elem.id);

  if (todoIndex < 0) {
    throw new Error("Could not foind todo");
  }

  TODOs.slice(todoIndex, 1);

  res.json({ message: "Deleted todo!", TODOs });
};
