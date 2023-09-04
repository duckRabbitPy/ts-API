import * as Effect from "@effect/io/Effect";
import { SortBy, SortOrder } from "../../models/queryParams";
import { pool } from "../../db/connection";
import QueryString from "qs";

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
    predicateOperator: "=" | ">" | ">=" | "<=";
    predicateValue: number;
  } | null;
  text:
    | string
    | string[]
    | QueryString.ParsedQs
    | QueryString.ParsedQs[]
    | undefined;
};

export const selectAllTodosQuery = (
  sortBy: SortBy,
  order: SortOrder,
  filters: tempTypeFilters
) => {
  const selectAll = async () => {
    const idFilterQuery = !!filters.id
      ? `WHERE id ${filters.id?.predicateOperator} ${filters.id?.predicateValue}`
      : ``;

    try {
      const result = await pool.query(
        `SELECT id, text FROM todos ${idFilterQuery} ORDER BY ${sortBy} ${order}`
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
        `SELECT id, text FROM todos WHERE id = $1`,
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
        `INSERT INTO todos (id, text) VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text
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
