"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
console.log("NODE_ENV", process.env.NODE_ENV);
exports.pool = process.env.NODE_ENV === "development"
    ? new pg_1.Pool({
        user: "postgres",
        host: process.env.HOST,
        database: process.env.TEST_PG_NAME,
        password: process.env.TEST_PG_PASSWORD,
        port: 5432,
    })
    : process.env.NODE_ENV === "production"
        ? new pg_1.Pool({
            connectionString: process.env.PROD_DATABASE_URL,
            max: 40,
        })
        : new pg_1.Pool({});
