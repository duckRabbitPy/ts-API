import * as Schema from "@effect/schema/Schema";

export default class TodoClass {
  constructor(public id: string, public text: string) {}
}

export const ToDoSchema = Schema.struct({
  id: Schema.number,
  text: Schema.string,
});

export type Todo = Schema.To<typeof ToDoSchema>;

export const parseTodo = Schema.parse(ToDoSchema);

export const todoPrinter = (todo: Todo) => `id: ${todo.id} text: ${todo.text}`;
