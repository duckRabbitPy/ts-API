import * as Schema from "@effect/schema/Schema";
import { Row } from "@sqlfx/sql/Connection";
import { Effect, pipe } from "effect";

export const ToDoSchema = Schema.struct({
  id: Schema.number,
  text: Schema.string,
});

export type Todo = Schema.To<typeof ToDoSchema>;

export const parseTodo = Schema.parse(ToDoSchema);

export const parseTodosFromPG = (rows: Row[]) =>
  pipe(
    Effect.succeed(rows),
    Effect.map((row) => row.map((row) => parseTodo(row))),
    Effect.flatMap((effectArr) => Effect.all(effectArr))
  );

export const todoPrinter = (todo: Todo) => `id: ${todo.id} text: ${todo.text}`;
