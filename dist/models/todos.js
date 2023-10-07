"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.updateTodosQuery = exports.deleteByIdQuery = exports.selectTodoByIdQuery = exports.selectAllTodosQuery = exports.createTodoQuery = exports.parseTodoArray = exports.parseTodo = exports.ToDoSchema = void 0;
const Schema = __importStar(require("@effect/schema/Schema"));
const Effect = __importStar(require("@effect/io/Effect"));
const connection_1 = require("../db/connection");
const customErrors_1 = require("../controllers/customErrors");
exports.ToDoSchema = Schema.struct({
    id: Schema.number,
    text: Schema.optional(Schema.string),
    updated_at: Schema.optional(Schema.DateFromSelf),
});
exports.parseTodo = Schema.parse(exports.ToDoSchema);
exports.parseTodoArray = Schema.parse(Schema.array(exports.ToDoSchema));
const logAndThrowError = (error) => {
    console.error(error);
    throw error;
};
const constructWhereClause = (filters) => {
    const idFilterQuery = !!filters.id
        ? filters.id
            .map((filter) => `id ${filter.numericalOperator} ${filter.predicateValue}`)
            .join(" AND ")
        : ``;
    const textFilterQuery = !!filters.text
        ? filters.text
            .map((filter) => `text ${filter.stringOperatorCallback(filter.predicateValue)}`)
            .join(" AND ")
        : ``;
    // microsecond interval added to account for postgres timestamp precision compared to javascript Date precision
    const dateFilterQuery = !!filters.updated_at
        ? filters.updated_at
            .map((filter) => `updated_at ${filter.dateOperator} TIMESTAMP '${filter.predicateValue}' ${filter.dateOperator === ">"
            ? "+ INTERVAL '100 microseconds'"
            : filter.dateOperator === "<"
                ? "- INTERVAL '100 microseconds'"
                : ""}`)
            .join(" AND ")
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
const createTodoQuery = (text) => {
    const create = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield connection_1.pool.query(`INSERT INTO todos (id, text)
        VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM todos), $1) RETURNING *`, [text]);
            return result.rows[0];
        }
        catch (error) {
            logAndThrowError(error);
        }
    });
    return Effect.tryPromise({
        try: () => create(),
        catch: (e) => new customErrors_1.PostgresError({ message: "postgres query error" }),
    }).pipe(Effect.retryN(1));
};
exports.createTodoQuery = createTodoQuery;
const selectAllTodosQuery = (sort_by, order, filters, definedFields, pagination) => {
    const selectAll = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield connection_1.pool.query(`SELECT ${definedFields.join(",")} FROM todos ${constructWhereClause(filters)} ORDER BY ${sort_by} ${order} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`);
            return result.rows;
        }
        catch (error) {
            logAndThrowError(error);
        }
    });
    return Effect.tryPromise({
        try: () => selectAll(),
        catch: () => new customErrors_1.PostgresError({ message: "postgres query error" }),
    });
};
exports.selectAllTodosQuery = selectAllTodosQuery;
const selectTodoByIdQuery = (id, definedFields) => {
    const selectById = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield connection_1.pool.query(`SELECT ${definedFields.join(",")} FROM todos WHERE id = $1`, [id]);
            return result.rows[0];
        }
        catch (error) {
            logAndThrowError(error);
        }
    });
    return Effect.tryPromise({
        try: () => selectById(),
        catch: () => new customErrors_1.PostgresError({ message: "postgres query error" }),
    });
};
exports.selectTodoByIdQuery = selectTodoByIdQuery;
const deleteByIdQuery = (id) => {
    const deleteById = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield connection_1.pool.query(`DELETE FROM todos WHERE id = $1 RETURNING id`, [id]);
            return result.rows[0];
        }
        catch (error) {
            logAndThrowError(error);
        }
    });
    return Effect.tryPromise({
        try: () => deleteById(),
        catch: () => new customErrors_1.PostgresError({ message: "postgres query error" }),
    });
};
exports.deleteByIdQuery = deleteByIdQuery;
const updateTodosQuery = (id, text) => {
    const updateById = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield connection_1.pool.query(`UPDATE todos
        SET text = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *`, [id, text]);
            return result.rows[0];
        }
        catch (error) {
            logAndThrowError(error);
        }
    });
    return Effect.tryPromise({
        try: () => updateById(),
        catch: () => new customErrors_1.PostgresError({ message: "postgres query error" }),
    });
};
exports.updateTodosQuery = updateTodosQuery;
