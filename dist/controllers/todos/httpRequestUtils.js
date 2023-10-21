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
exports.checkIfNoResult = exports.safeParseCreateToDoFieldsFromBody = exports.checkNoExcessFieldsForUpdate = exports.safeParseIDRequestParameter = exports.getFilterParamsFromRequest = void 0;
const Effect = __importStar(require("@effect/io/Effect"));
const Schema = __importStar(require("@effect/schema/Schema"));
const customErrors_1 = require("../customErrors");
const primitiveParsers_1 = require("../../sharedUtils.ts/primitiveParsers");
const numericalFilter_1 = require("../queryParams/filtering/numericalFilter");
const effect_1 = require("effect");
const booleanFilter_1 = require("../queryParams/filtering/booleanFilter");
const dateFilter_1 = require("../queryParams/filtering/dateFilter");
const stringFilter_1 = require("../queryParams/filtering/stringFilter");
const getFilterParamsFromRequest = (req) => {
    const idFilter = (0, numericalFilter_1.parseNumericalFieldFilter)(req.query.id);
    const textFilter = (0, stringFilter_1.parseStringFieldFilter)(req.query.text);
    const updatedAtFilter = (0, dateFilter_1.parseDateFieldFilter)(req.query.updated_at);
    const completedFilter = (0, booleanFilter_1.parseBooleanFieldFilter)(req.query.completed);
    return (0, effect_1.pipe)(Effect.all({ idFilter, textFilter, updatedAtFilter, completedFilter }));
};
exports.getFilterParamsFromRequest = getFilterParamsFromRequest;
const safeParseIDRequestParameter = (req) => {
    var _a;
    return (0, primitiveParsers_1.safeParseNumber)(Number((_a = req.params) === null || _a === void 0 ? void 0 : _a.id)).pipe(Effect.orElseFail(() => new customErrors_1.ParameterError({
        message: "Invalid input for request parameter /:id. Expected a number",
    })));
};
exports.safeParseIDRequestParameter = safeParseIDRequestParameter;
const checkNoExcessFieldsForUpdate = (body) => Schema.parse(Schema.struct({
    text: Schema.optional(Schema.string),
    completed: Schema.optional(Schema.boolean),
}))(body, {
    onExcessProperty: "error",
}).pipe(Effect.orElseFail(() => new customErrors_1.ParameterError({
    message: "Invalid parameter in request body. One of the fields specified is not allowed to be updated",
})), Effect.flatMap(() => Effect.succeed(Effect.unit)));
exports.checkNoExcessFieldsForUpdate = checkNoExcessFieldsForUpdate;
const safeParseCreateToDoFieldsFromBody = (body) => Schema.parse(Schema.struct({ text: Schema.string.pipe(Schema.minLength(1)) }))(body, {
    onExcessProperty: "error",
});
exports.safeParseCreateToDoFieldsFromBody = safeParseCreateToDoFieldsFromBody;
const checkIfNoResult = (result) => result
    ? Effect.succeed(result)
    : Effect.fail(new customErrors_1.ItemNotFoundError({ message: "Item not found" }));
exports.checkIfNoResult = checkIfNoResult;
