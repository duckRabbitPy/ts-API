import { Pool } from "pg";

console.log("NODE_ENV", process.env.NODE_ENV);
export const pool =
  process.env.NODE_ENV === "development"
    ? new Pool({
        user: "postgres",
        host: process.env.HOST,
        database: process.env.TEST_PG_NAME,
        password: process.env.TEST_PG_PASSWORD,
        port: 5432,
      })
    : process.env.NODE_ENV === "production"
    ? new Pool({
        connectionString: process.env.PROD_DATABASE_URL,
        max: 40,
      })
    : new Pool({});
