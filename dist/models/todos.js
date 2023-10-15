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
exports.updateTodosQuery = exports.deleteByIdQuery = exports.selectTodoByIdQuery = exports.selectAllTodosQuery = exports.createTodoQuery = exports.constructTODOWhereClause = exports.parseTodoArray = exports.parseTodo = exports.ToDoSchema = void 0;
const Schema = __importStar(require("@effect/schema/Schema"));
const Effect = __importStar(require("@effect/io/Effect"));
const connection_1 = require("../db/connection");
const customErrors_1 = require("../controllers/customErrors");
const sqlUtils_1 = require("./sqlUtils");
const tsUtils_1 = require("../commonUtils/tsUtils");
// this is the /todos API _return_ type for a todo not the database schema type
exports.ToDoSchema = Schema.struct({
    id: Schema.number,
    text: Schema.optional(Schema.string),
    updated_at: Schema.optional(Schema.DateFromSelf),
    completed: Schema.optional(Schema.boolean),
});
exports.parseTodo = Schema.parse(exports.ToDoSchema);
exports.parseTodoArray = Schema.parse(Schema.array(exports.ToDoSchema));
const constructTODOWhereClause = (filters) => {
    const { idFilter, textFilter, updatedAtFilter, completedFilter } = filters;
    const filterQueries = [
        (0, sqlUtils_1.createFilterQuery)("id", idFilter, sqlUtils_1.numericalFilterQuery),
        (0, sqlUtils_1.createFilterQuery)("text", textFilter, sqlUtils_1.stringFilterQuery),
        (0, sqlUtils_1.createFilterQuery)("updated_at", updatedAtFilter, sqlUtils_1.dateFilterQuery),
        (0, sqlUtils_1.createFilterQuery)("completed", completedFilter, sqlUtils_1.booleanFilterQuery),
    ];
    const validFilterQueries = filterQueries.filter(tsUtils_1.isNotNil);
    return validFilterQueries.length > 0
        ? `WHERE ${validFilterQueries.join(" AND ")}`
        : "";
};
exports.constructTODOWhereClause = constructTODOWhereClause;
const logAndThrowError = (error) => {
    console.error(error);
    throw error;
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
        catch: () => new customErrors_1.PostgresError({ message: "postgres query error" }),
    }).pipe(Effect.retryN(1));
};
exports.createTodoQuery = createTodoQuery;
const selectAllTodosQuery = ({ sort_by, order, filters, definedFields, pagination, }) => {
    const selectAll = () => __awaiter(void 0, void 0, void 0, function* () {
        const columns = definedFields.join(",");
        const whereClause = (0, exports.constructTODOWhereClause)(filters);
        try {
            const result = yield connection_1.pool.query(`SELECT ${columns} FROM todos ${whereClause} ORDER BY ${sort_by} ${order} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`);
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
            const result = yield connection_1.pool.query("DELETE FROM todos WHERE id = $1 RETURNING id", [id]);
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
const updateTodosQuery = ({ id, text, completed, }) => {
    const newUpdates = {
        text,
        completed,
    };
    const { sqlSetQueries: sqlSetQuery, setParams } = (0, sqlUtils_1.createSetQueriesAndParams)(newUpdates, 1);
    if (sqlSetQuery.length === 0) {
        throw new customErrors_1.ParameterError({ message: "No update field specified" });
    }
    const updateById = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield connection_1.pool.query(`UPDATE todos
        SET ${sqlSetQuery.join(", ")}, updated_at = NOW()
        WHERE id = $1
        RETURNING *`, [id, ...setParams]);
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
