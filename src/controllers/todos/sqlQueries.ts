import * as Effect from "@effect/io/Effect";

import { pool } from "../../db/connection";
import { SortOrder } from "../../models/queryParams/order";
import { SortBy } from "../../models/queryParams/sortBy";

export const createTodoQuery = (text: string) => {
  const create = async () => {
    try {
      // todo: in case of concurrent insert and unique constraint error, retry query
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
    catch: (unknown) => new Error(`something went wrong ${unknown}`),
  });
};

type tempTypeFilters = {
  id: {
    numericalOperator: "=" | ">" | ">=" | "<=";
    predicateValue: number;
  } | null;
  text: {
    stringOperatorCallback:
      | ((a: string) => `LIKE '%${string}%'`)
      | ((a: string) => `LIKE '${string}%'`)
      | ((a: string) => `LIKE '%${string}'`)
      | ((a: string) => `= '${string}'`);
    predicateValue: string;
  } | null;
  updated_at: {
    dateOperator: "=" | ">" | "<";
    predicateValue: string;
  } | null;
};
const constructWhereClause = (filters: tempTypeFilters) => {
  const idFilterQuery = !!filters.id
    ? `id ${filters.id?.numericalOperator} ${filters.id?.predicateValue}`
    : ``;

  const textFilterQuery = !!filters.text
    ? `text ${filters.text.stringOperatorCallback(filters.text.predicateValue)}`
    : ``;

  const dateFilterQuery = !!filters.updated_at
    ? `updated_at ${filters.updated_at.dateOperator} '${filters.updated_at.predicateValue}'`
    : ``;

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

export const selectAllTodosQuery = (
  sortBy: SortBy,
  order: SortOrder,
  filters: tempTypeFilters,
  definedFields: readonly string[]
) => {
  const selectAll = async () => {
    try {
      const result = await pool.query(
        `SELECT ${definedFields.join(",")} FROM todos ${constructWhereClause(
          filters
        )} ORDER BY ${sortBy} ${order}`
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => selectAll(),
    catch: (unknown) => new Error(`something went wrong ${unknown}`),
  });
};

export const selectTodoByIdQuery = (id: number) => {
  const selectById = async () => {
    try {
      const result = await pool.query(
        `SELECT id, text, updated_at FROM todos WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => selectById(),
    catch: (unknown) => new Error(`something went wrong ${unknown}`),
  });
};

export const deleteByIdQuery = (id: number) => {
  const deleteById = async () => {
    try {
      await pool.query(`DELETE FROM todos WHERE id = $1 RETURNING id`, [id]);
    } catch (error) {
      throw error;
    }
  };

  return Effect.tryPromise({
    try: () => deleteById(),
    catch: (unknown) => new Error(`something went wrong ${unknown}`),
  });
};

export const updateTodosQuery = (id: number, text: string) => {
  const updateById = async () => {
    try {
      const result = await pool.query(
        `INSERT INTO todos (id, text, updated_at) VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, updated_at = NOW()
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
    catch: (unknown) => new Error(`something went wrong ${unknown}`),
  });
};
