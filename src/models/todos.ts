import * as Schema from "@effect/schema/Schema";

export const ToDoSchema = Schema.struct({
  id: Schema.number,
  text: Schema.optional(Schema.string),
  updated_at: Schema.optional(Schema.DateFromSelf),
});

export type Todo = Schema.To<typeof ToDoSchema>;

export const parseTodo = Schema.parse(ToDoSchema);

export const parseTodoArray = Schema.parse(Schema.array(ToDoSchema));

export const todoPrinter = (todo: Todo) => `id: ${todo.id} text: ${todo.text}`;
