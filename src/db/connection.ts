import { Pool } from "pg";

export const pool = new Pool({
  user: Bun.env.PG_USERNAME,
  host: Bun.env.HOST,
  database: Bun.env.PG_NAME,
  password: Bun.env.PG_PASSWORD,
  port: 5432,
});
