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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToDoItem = exports.deleteToDoItem = exports.getToDoItem = exports.getAllToDoItems = exports.createToDoItem = void 0;
const Function_1 = require("@effect/data/Function");
const Effect = __importStar(require("@effect/io/Effect"));
const todos_1 = require("../../models/todos");
const sortBy_1 = require("../queryParams/sorting/sortBy");
const order_1 = require("../queryParams/sorting/order");
const definedFields_1 = require("../queryParams/definedFields");
const pagination_1 = require("../queryParams/pagination");
const customErrors_1 = require("../customErrors");
const responseHandler_1 = require("./responseHandler");
const httpRequestUtils_1 = require("./httpRequestUtils");
const primitiveParsers_1 = require("../../sharedUtils.ts/primitiveParsers");
const createToDoItem = (req, res) => {
    return (0, Function_1.pipe)(req.body, httpRequestUtils_1.safeParseCreateToDoFieldsFromBody, Effect.orElseFail(() => new customErrors_1.ParameterError({
        message: "Invalid input in request body. Expected {text: string} (non-empty)",
    })), Effect.flatMap((body) => (0, todos_1.createTodoQuery)(body.text)), Effect.flatMap(todos_1.parseTodo), (getDataEffect) => (0, responseHandler_1.sendResponse)({
        getDataEffect,
        response: res,
        successStatus: 201,
    }));
};
exports.createToDoItem = createToDoItem;
const getAllToDoItems = (req, res) => {
    const maybeSafeArgs = {
        sort_by: (0, sortBy_1.safeParseSortByParam)(req.query.sortBy).pipe(Effect.orElseSucceed(() => "id")),
        order: (0, order_1.safeParseOrderParam)(req.query.order).pipe(Effect.orElseSucceed(() => "asc")),
        filters: (0, httpRequestUtils_1.getFilterParamsFromRequest)(req),
        definedFields: (0, definedFields_1.safeParseDefinedFields)(req.query.fields).pipe(Effect.orElseSucceed(() => ["*"])),
        pagination: (0, pagination_1.safeParsePagination)(req).pipe(Effect.orElseSucceed(() => ({
            limit: 20,
            offset: 0,
        }))),
    };
    return (0, Function_1.pipe)(Effect.all(maybeSafeArgs), Effect.flatMap((safeArgs) => (0, todos_1.selectAllTodosQuery)(safeArgs)), Effect.flatMap(todos_1.parseTodoArray), (getDataEffect) => (0, responseHandler_1.sendResponse)({
        getDataEffect,
        response: res,
        successStatus: 200,
    }));
};
exports.getAllToDoItems = getAllToDoItems;
const getToDoItem = (req, res) => {
    const maybeSafeArgs = {
        id: (0, httpRequestUtils_1.safeParseIDRequestParameter)(req),
        definedFields: (0, definedFields_1.safeParseDefinedFields)(req.query.fields).pipe(Effect.orElseSucceed(() => ["id", "text", "updated_at"])),
    };
    return (0, Function_1.pipe)(Effect.all(maybeSafeArgs), Effect.flatMap((safeArgs) => (0, todos_1.selectTodoByIdQuery)(safeArgs)), Effect.flatMap(httpRequestUtils_1.checkIfNoResult), Effect.flatMap(todos_1.parseTodo), (getDataEffect) => (0, responseHandler_1.sendResponse)({
        getDataEffect,
        response: res,
        successStatus: 200,
    }));
};
exports.getToDoItem = getToDoItem;
const deleteToDoItem = (req, res) => {
    return (0, Function_1.pipe)((0, httpRequestUtils_1.safeParseIDRequestParameter)(req), Effect.flatMap((id) => (0, todos_1.deleteByIdQuery)(id)), Effect.flatMap(httpRequestUtils_1.checkIfNoResult), (getDataEffect) => (0, responseHandler_1.sendResponse)({
        getDataEffect,
        response: res,
        successStatus: 204,
    }));
};
exports.deleteToDoItem = deleteToDoItem;
const updateToDoItem = (req, res) => {
    var _a, _b;
    const maybeSafeArgs = {
        id: (0, httpRequestUtils_1.safeParseIDRequestParameter)(req),
        text: (0, primitiveParsers_1.safeParseNonEmptyString)((_a = req.body) === null || _a === void 0 ? void 0 : _a.text).pipe(Effect.orElseSucceed(() => undefined)),
        completed: (0, primitiveParsers_1.safeParseBoolean)((_b = req.body) === null || _b === void 0 ? void 0 : _b.completed).pipe(Effect.orElseSucceed(() => undefined)),
    };
    return (0, Function_1.pipe)((0, httpRequestUtils_1.checkNoExcessFieldsForUpdate)(req.body), Effect.flatMap(() => Effect.all(maybeSafeArgs)), Effect.flatMap((safeArgs) => (0, todos_1.updateTodosQuery)(safeArgs)), Effect.flatMap(httpRequestUtils_1.checkIfNoResult), Effect.flatMap(todos_1.parseTodo), (getDataEffect) => (0, responseHandler_1.sendResponse)({
        getDataEffect,
        response: res,
        successStatus: 200,
    }));
};
exports.updateToDoItem = updateToDoItem;
