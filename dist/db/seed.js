"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAndSeedDatabase = exports.TODO_SEED_VALUES = void 0;
const connection_1 = require("./connection");
exports.TODO_SEED_VALUES = {
    todos: [
        {
            id: 1,
            text: "Buy groceries",
            updated_at: "2023-09-30T16:26:51.041Z",
        },
        {
            id: 2,
            text: "Walk the dog",
            updated_at: "2023-09-30T16:26:51.044Z",
        },
        {
            id: 3,
            text: "Complete the task",
            updated_at: "2023-09-30T16:26:51.044Z",
        },
        {
            id: 4,
            text: "Go for run",
            updated_at: "2023-09-30T16:26:57.956Z",
        },
        {
            id: 5,
            text: "Do the laundry",
            updated_at: "2023-09-30T16:26:57.956Z",
        },
    ],
};
const resetAndSeedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield connection_1.pool.connect();
    try {
        yield client.query("DROP TABLE IF EXISTS todos");
        yield client.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id serial PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
        for (const item of exports.TODO_SEED_VALUES.todos) {
            const { id, text, updated_at } = item;
            yield client.query(`INSERT INTO todos (id, text, updated_at)
          VALUES ($1, $2, $3)
          `, [id, text, updated_at]);
        }
    }
    catch (error) {
        console.error("Error resetting and seeding the database:", error);
    }
    finally {
        client.release();
    }
});
exports.resetAndSeedDatabase = resetAndSeedDatabase;
