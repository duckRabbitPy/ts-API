import { Pool } from "pg";

export const pool =
  Bun.env.NODE_ENV === "test"
    ? new Pool({
        user: Bun.env.PG_USERNAME,
        host: Bun.env.HOST,
        database: Bun.env.TEST_PG_NAME,
        password: Bun.env.TEST_PG_PASSWORD,
        port: 5432,
      })
    : new Pool({
        user: Bun.env.PG_USERNAME,
        host: Bun.env.HOST,
        database: Bun.env.PG_NAME,
        password: Bun.env.PG_PASSWORD,
        port: 5432,
      });
