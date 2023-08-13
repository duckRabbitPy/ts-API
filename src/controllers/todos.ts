import { RequestHandler, Request } from "express";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Pg from "@sqlfx/pg";
import { parseTodo, Todo, ToDoSchema } from "../models/todos";
import { Config } from "effect";
import * as Schema from "@effect/schema/Schema";
import { ParseError } from "@effect/schema/ParseResult";
import { ParseOptions } from "@effect/schema/AST";

const PgLive = Pg.makeLayer({
  database: Config.succeed("effect_pg_dev"),
});

export const createToDo: RequestHandler = (req, res, next) => {
  const text = (req.body as { text: string }).text;

  const insertTodo = (text: string) =>
    pipe(
      Pg.tag,
      Effect.flatMap(
        (sql) =>
          sql`INSERT INTO todos (id, text) VALUES (${
            Math.floor(Math.random() * 100) + 1
          }, ${text}) RETURNING *`
      ),
      Effect.map((todos) => todos.map((todo) => parseTodo(todo))),
      Effect.flatMap((effectArr) => Effect.all(effectArr)),
      Effect.flatMap((todos) => Effect.succeed(res.json({ todos: todos })))
    );

  pipe(insertTodo(text), Effect.provideLayer(PgLive), Effect.runPromise);
};

export const getToDo: RequestHandler = (req, res, next) => {
  const selectAllItems = pipe(
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

  pipe(selectAllItems, Effect.provideLayer(PgLive), Effect.runPromise);
};

export const updateToDo: RequestHandler<{ id: string }> = (req, res, next) => {
  const todoID = req.params.id;
  const updatedText = (req.body as { text: string }).text;

  const updateItem = (id: string, text: string) =>
    pipe(
      Pg.tag,
      Effect.flatMap(
        (sql) => sql`INSERT INTO todos (id, text)
        VALUES (${id}, ${text})
        ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text
        RETURNING *`
      ),
      Effect.map((todos) => todos.map((todo) => parseTodo(todo))),
      Effect.flatMap((effectArr) => Effect.all(effectArr)),
      Effect.flatMap((todos) => Effect.succeed(res.json({ todos: todos })))
    );

  pipe(
    updateItem(todoID, updatedText),
    Effect.provideLayer(PgLive),
    Effect.runPromise
  );
};

// export const deleteToDoOriginal: RequestHandler<{ id: string }> = (
//   req,
//   res,
//   next
// ) => {
//   const todoID = req.params.id;

//   const deleteItem = (id: string) =>
//     pipe(
//       Pg.tag,
//       Effect.flatMap(
//         (sql) => sql`DELETE FROM todos WHERE id=${id} RETURNING *`
//       ),
//       Effect.map((todos) => todos.map((todo) => parseTodo(todo))),
//       Effect.flatMap((effectArr) => Effect.all(effectArr)),
//       Effect.flatMap((todos) =>
//         Effect.succeed(res.json({ message: "todo deleted", todos: todos }))
//       )
//     );

//   pipe(deleteItem(todoID), Effect.provideLayer(PgLive), Effect.runPromise);
// };

export const deleteToDo: RequestHandler<{ id: string }> = (req, res, next) => {
  const todoID = Number(req.params.id);

  const getIdFromRequest = (
    req: Request
  ): Effect.Effect<never, Error, number> =>
    Number.isInteger(Number(req.params?.id))
      ? Effect.succeed(Number(req.params?.id))
      : Effect.fail(new Error("Id cannot be converted to number"));

  const deleteResolver = (sql: Pg.PgClient, id: number) =>
    sql
      .resolver("deleteItem", {
        request: Schema.number,
        result: ToDoSchema,
        run: (requests) =>
          sql`
        DELETE FROM todos WHERE id=${sql(requests)} RETURNING *
      `,
      })
      .execute(id);

  const deleteItem = (id: number) => {
    return pipe(
      Pg.tag,
      Effect.flatMap((sql) => deleteResolver(sql, id)),
      Effect.flatMap((todos) =>
        Effect.succeed(res.json({ message: "todo deleted", todos: todos }))
      )
    );
  };

  pipe(
    getIdFromRequest(req),
    Effect.flatMap((id) => deleteItem(id)),
    Effect.provideLayer(PgLive),
    Effect.runPromise
  );
};
