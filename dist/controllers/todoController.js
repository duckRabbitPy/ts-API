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
exports.updateToDoItem = exports.deleteToDoItem = exports.getToDoItem = exports.getAllToDoItems = exports.createToDoItem = exports.getFilterParamsFromRequest = void 0;
const Function_1 = require("@effect/data/Function");
const Effect = __importStar(require("@effect/io/Effect"));
const todos_1 = require("../models/todos");
const sortBy_1 = require("./queryParams/sorting/sortBy");
const order_1 = require("./queryParams/sorting/order");
const dateFilter_1 = require("./queryParams/filtering/date/dateFilter");
const numericalFilter_1 = require("./queryParams/filtering/number/numericalFilter");
const stringFilter_1 = require("./queryParams/filtering/string/stringFilter");
const definedFields_1 = require("./queryParams/definedFields");
const pagination_1 = require("./queryParams/pagination");
const parseHelpers_1 = require("./utils/parseHelpers");
const customErrors_1 = require("./customErrors");
const booleanFilter_1 = require("./queryParams/filtering/boolean/booleanFilter");
const getFilterParamsFromRequest = (req) => {
    const idFilter = (0, numericalFilter_1.parseNumericalQueryFilter)(req.query.id);
    const textFilter = (0, stringFilter_1.parseStringFilter)(req.query.text);
    const updatedAtFilter = (0, dateFilter_1.parseDateQueryFilter)(req.query.updated_at);
    const completedFilter = (0, booleanFilter_1.parseBooleanQueryFilter)(req.query.completed);
    return (0, Function_1.pipe)(Effect.all({ idFilter, textFilter, updatedAtFilter, completedFilter }));
};
exports.getFilterParamsFromRequest = getFilterParamsFromRequest;
const createToDoItem = (req, res) => {
    return (0, Function_1.pipe)(req.body, parseHelpers_1.safeParseInitFieldsFromBody, Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid creat todo input" })), Effect.flatMap((body) => (0, todos_1.createTodoQuery)(body.text)), Effect.flatMap(todos_1.parseTodo), (finalEffect) => resolveResponse({
        finalEffect,
        response: res,
        successStatus: 201,
    }));
};
exports.createToDoItem = createToDoItem;
const getAllToDoItems = (req, res) => {
    const filters = (0, exports.getFilterParamsFromRequest)(req);
    const getSafeParams = {
        sort_by: (0, sortBy_1.safeParseSortByParam)(req.query.sortBy).pipe(Effect.orElseSucceed(() => "id")),
        order: (0, order_1.safeParseOrderParam)(req.query.order).pipe(Effect.orElseSucceed(() => "asc")),
        filters: filters,
        definedFields: (0, definedFields_1.safeParseDefinedFields)(req.query.fields).pipe(Effect.orElseSucceed(() => ["*"])),
        pagination: (0, pagination_1.safeParsePagination)(req).pipe(Effect.orElseSucceed(() => ({
            limit: 20,
            offset: 0,
        }))),
    };
    return (0, Function_1.pipe)(Effect.all(getSafeParams), Effect.flatMap((safeParams) => (0, todos_1.selectAllTodosQuery)(safeParams)), Effect.flatMap(todos_1.parseTodoArray), (finalEffect) => resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
    }));
};
exports.getAllToDoItems = getAllToDoItems;
const getToDoItem = (req, res) => {
    var _a;
    const getSafeParams = {
        id: (0, parseHelpers_1.safeParseNumber)(Number((_a = req.params) === null || _a === void 0 ? void 0 : _a.id)).pipe(Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid id" }))),
        definedFields: (0, definedFields_1.safeParseDefinedFields)(req.query.fields).pipe(Effect.orElseSucceed(() => ["id", "text", "updated_at"])),
    };
    return (0, Function_1.pipe)(Effect.all(getSafeParams), Effect.flatMap(({ id, definedFields }) => (0, todos_1.selectTodoByIdQuery)(id, definedFields)), Effect.flatMap(parseHelpers_1.checkIfNoResult), Effect.flatMap(todos_1.parseTodo), (finalEffect) => resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
    }));
};
exports.getToDoItem = getToDoItem;
const deleteToDoItem = (req, res) => {
    var _a;
    return (0, Function_1.pipe)((0, parseHelpers_1.safeParseNumber)(Number((_a = req.params) === null || _a === void 0 ? void 0 : _a.id)), Effect.flatMap((id) => (0, todos_1.deleteByIdQuery)(id)), Effect.flatMap(parseHelpers_1.checkIfNoResult), (finalEffect) => resolveResponse({
        finalEffect,
        response: res,
        successStatus: 204,
    }));
};
exports.deleteToDoItem = deleteToDoItem;
const updateToDoItem = (req, res) => {
    var _a, _b, _c;
    const getSafeParams = {
        id: (0, parseHelpers_1.safeParseNumber)(Number((_a = req.params) === null || _a === void 0 ? void 0 : _a.id)).pipe(Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid id parameter" }))),
        text: (0, parseHelpers_1.safeParseNonEmptyString)((_b = req.body) === null || _b === void 0 ? void 0 : _b.text).pipe(Effect.orElseSucceed(() => undefined)),
        completed: (0, parseHelpers_1.safeParseBoolean)((_c = req.body) === null || _c === void 0 ? void 0 : _c.completed).pipe(Effect.orElseSucceed(() => undefined)),
    };
    return (0, Function_1.pipe)((0, parseHelpers_1.checkNoExcessFieldsForUpdate)(req.body), Effect.flatMap(() => Effect.all(getSafeParams)), Effect.flatMap((safeParams) => (0, todos_1.updateTodosQuery)(safeParams)), Effect.flatMap(parseHelpers_1.checkIfNoResult), Effect.flatMap(todos_1.parseTodo), (finalEffect) => resolveResponse({
        finalEffect,
        response: res,
        successStatus: 200,
    }));
};
exports.updateToDoItem = updateToDoItem;
const respondWithError = (response, status, message) => (0, Function_1.pipe)(Effect.succeed(response.status(status).json({
    message: `Fail: ${message}`,
})));
function resolveResponse({ finalEffect, response, successStatus, }) {
    return (0, Function_1.pipe)(Effect.matchCauseEffect(finalEffect, {
        onFailure: (cause) => {
            switch (cause._tag) {
                case "Fail":
                    if (cause.error._tag === "ItemNotFoundError") {
                        return respondWithError(response, 404, cause.error._tag);
                    }
                    if (cause.error._tag === "ParameterError") {
                        return respondWithError(response, 400, cause.error._tag);
                    }
                    return respondWithError(response, 500, cause.error._tag);
                case "Die":
                case "Interrupt":
                    respondWithError(response, 500, "Internal server error");
            }
            return Effect.succeed(response.status(500).json("Internal Server error"));
        },
        onSuccess: (todos) => Effect.succeed(response.status(successStatus).json(todos)),
    }), Effect.runPromise);
}
