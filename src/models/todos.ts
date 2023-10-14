import * as Schema from "@effect/schema/Schema";
import * as Effect from "@effect/io/Effect";
import { pool } from "../db/connection";
import { SortOrder } from "../controllers/queryParams/sorting/order";
import { SortBy } from "../controllers/queryParams/sorting/sortBy";
import { ParameterError, PostgresError } from "../controllers/customErrors";
import {
  BooleanSQLFilter,
  DateSQLFilter,
  NumericalSQLFilter,
  StringSQLFilter,
  booleanFilterQuery,
  createFilterQuery,
  createSetQueriesAndParams,
  dateFilterQuery,
  numericalFilterQuery,
  stringFilterQuery,
} from "./sqlUtils";
import { isNotNil } from "../commonUtils/tsUtils";

// this is the /todos API _return_ type for a todo not the database schema type
export const ToDoSchema = Schema.struct({
  id: Schema.number,
  text: Schema.optional(Schema.string),
  updated_at: Schema.optional(Schema.DateFromSelf),
  completed: Schema.optional(Schema.boolean),
});

export type Todo = Schema.To<typeof ToDoSchema>;

export const parseTodo = Schema.parse(ToDoSchema);

export const parseTodoArray = Schema.parse(Schema.array(ToDoSchema));

type TODOSqlFilters = {
  id: NumericalSQLFilter[];
  text: StringSQLFilter[];
  updated_at: DateSQLFilter[];
  completed: BooleanSQLFilter[];
};

export const constructTODOWhereClause = (filters: TODOSqlFilters) => {
  const filterQueries = [
    createFilterQuery("id", filters.id, numericalFilterQuery),
    createFilterQuery("text", filters.text, stringFilterQuery),
    createFilterQuery("updated_at", filters.updated_at, dateFilterQuery),
    createFilterQuery("completed", filters.completed, booleanFilterQuery),
  ];

  const validFilterQueries = filterQueries.filter(isNotNil);

  return validFilterQueries.length > 0
    ? `WHERE ${validFilterQueries.join(" AND ")}`
    : "";
};

const logAndThrowError = (error: unknown) => {
  console.error(error);
  throw error;
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
      logAndThrowError(error);
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
  filters: TODOSqlFilters,
  definedFields: readonly string[],
  pagination: { limit: number; offset: number }
) => {
  const selectAll = async () => {
    const columns = definedFields.join(",");
    const whereClause = constructTODOWhereClause(filters);
    try {
      const result = await pool.query(
        `SELECT ${columns} FROM todos ${whereClause} ORDER BY ${sort_by} ${order} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`
      );
      return result.rows;
    } catch (error) {
      logAndThrowError(error);
    }
  };

  return Effect.tryPromise({
    try: () => selectAll(),
    catch: () => new PostgresError({ message: "postgres query error" }),
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
      logAndThrowError(error);
    }
  };

  return Effect.tryPromise({
    try: () => selectById(),
    catch: () => new PostgresError({ message: "postgres query error" }),
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
      logAndThrowError(error);
    }
  };

  return Effect.tryPromise({
    try: () => deleteById(),
    catch: () => new PostgresError({ message: "postgres query error" }),
  });
};

export const updateTodosQuery = (
  id: number,
  text: string | undefined,
  completed: boolean | undefined
) => {
  const newUpdates = {
    text,
    completed,
  };

  const { sqlSetQueries: sqlSetQuery, setParams } = createSetQueriesAndParams(
    newUpdates,
    1
  );

  if (sqlSetQuery.length === 0) {
    throw new ParameterError({ message: "No update field specified" });
  }

  const updateById = async () => {
    try {
      const result = await pool.query(
        `UPDATE todos
        SET ${sqlSetQuery.join(", ")}, updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [id, ...setParams]
      );

      return result.rows[0];
    } catch (error) {
      logAndThrowError(error);
    }
  };

  return Effect.tryPromise({
    try: () => updateById(),
    catch: () => new PostgresError({ message: "postgres query error" }),
  });
};
