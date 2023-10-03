import * as Schema from "@effect/schema/Schema";
import * as Effect from "@effect/io/Effect";
import { pool } from "../db/connection";
import { SortOrder } from "../controllers/queryParams/sorting/order";
import { SortBy } from "../controllers/queryParams/sorting/sortBy";
import { PostgresError } from "../controllers/customErrors";

export const ToDoSchema = Schema.struct({
  id: Schema.number,
  text: Schema.optional(Schema.string),
  updated_at: Schema.optional(Schema.DateFromSelf),
});

export type Todo = Schema.To<typeof ToDoSchema>;

export const parseTodo = Schema.parse(ToDoSchema);

export const parseTodoArray = Schema.parse(Schema.array(ToDoSchema));

type sqlPrimedFilters = {
  id: {
    numericalOperator: "=" | ">" | ">=" | "<=";
    predicateValue: number;
  } | null;
  text: {
    stringOperatorCallback: (a: string) => string;
    predicateValue: string;
  } | null;
  updated_at: {
    dateOperator: "=" | ">" | "<";
    predicateValue: string;
  } | null;
};
const constructWhereClause = (filters: sqlPrimedFilters) => {
  const idFilterQuery = !!filters.id
    ? `id ${filters.id?.numericalOperator} ${filters.id?.predicateValue}`
    : ``;

  const textFilterQuery = !!filters.text
    ? `text ${filters.text.stringOperatorCallback(filters.text.predicateValue)}`
    : ``;

  // microsecond interval added to account for postgres timestamp precision compared to javascript Date precision
  const dateFilterQuery = !!filters.updated_at
    ? `updated_at ${filters.updated_at.dateOperator} TIMESTAMP '${
        filters.updated_at.predicateValue
      }' ${
        filters.updated_at.dateOperator === ">"
          ? "+ INTERVAL '100 microseconds'"
          : filters.updated_at.dateOperator === "<"
          ? "- INTERVAL '100 microseconds'"
          : ""
      }`
    : "";

  const filterQueries = [
    idFilterQuery,
    textFilterQuery,
    dateFilterQuery,
  ].filter(Boolean);

  if (filterQueries.length === 0) {
    return ``;
  }

  return `WHERE ${filterQueries.join(" AND ")}`;
};

export const createTodoQuery = (text: string) => {
  const create = async () => {
    try {
      const result = await pool.query(
        `INSERT INTO todos (id, text)
        VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM todos), $1) RETURNING *`,
        [text]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => create(),
    catch: (e) => new PostgresError({ message: "postgres query error" }),
  }).pipe(Effect.retryN(1));
};

export const selectAllTodosQuery = (
  sort_by: SortBy,
  order: SortOrder,
  filters: sqlPrimedFilters,
  definedFields: readonly string[],
  pagination: { limit: number; offset: number }
) => {
  const selectAll = async () => {
    try {
      const result = await pool.query(
        `SELECT ${definedFields.join(",")} FROM todos ${constructWhereClause(
          filters
        )} ORDER BY ${sort_by} ${order} LIMIT ${pagination.limit} OFFSET ${
          pagination.offset
        }`
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => selectAll(),
    catch: (unknown) => new PostgresError({ message: "postgres query error" }),
  });
};

export const selectTodoByIdQuery = (
  id: number,
  definedFields: readonly string[]
) => {
  const selectById = async () => {
    try {
      const result = await pool.query(
        `SELECT ${definedFields.join(",")} FROM todos WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => selectById(),
    catch: (unknown) => new PostgresError({ message: "postgres query error" }),
  });
};

export const deleteByIdQuery = (id: number) => {
  const deleteById = async () => {
    try {
      const result = await pool.query(
        `DELETE FROM todos WHERE id = $1 RETURNING id`,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => deleteById(),
    catch: (unknown) => new PostgresError({ message: "postgres query error" }),
  });
};

export const updateTodosQuery = (id: number, text: string) => {
  const updateById = async () => {
    try {
      const result = await pool.query(
        `UPDATE todos
        SET text = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [id, text]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => updateById(),
    catch: (unknown) => new PostgresError({ message: "postgres query error" }),
  });
};
