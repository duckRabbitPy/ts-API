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
exports.parseDateFieldFilter = exports.safeParseDateOperator = exports.dateOperator = exports.dateOperatorMapSchema = exports.dateOperatorSqlMapping = void 0;
const Function_1 = require("@effect/data/Function");
const Effect = __importStar(require("@effect/io/Effect"));
const splitOperatorAndValue_1 = require("./splitOperatorAndValue");
const customErrors_1 = require("../../customErrors");
const Schema = __importStar(require("@effect/schema/Schema"));
const primitiveParsers_1 = require("../../../sharedUtils.ts/primitiveParsers");
exports.dateOperatorSqlMapping = {
    eq: "=",
    after: ">",
    before: "<",
};
exports.dateOperatorMapSchema = Schema.struct({
    eq: Schema.literal("="),
    after: Schema.literal(">"),
    before: Schema.literal("<"),
});
exports.dateOperator = Schema.keyof(exports.dateOperatorMapSchema);
exports.safeParseDateOperator = Schema.parse(exports.dateOperator);
const parseColonDelimitedDateFilterString = (filterString) => {
    const [operator, value] = (0, splitOperatorAndValue_1.splitOperatorAndValue)(filterString);
    const safeParams = {
        dateOperator: (0, exports.safeParseDateOperator)(operator),
        predicateValue: (0, primitiveParsers_1.safeParseDate)(value),
    };
    return (0, Function_1.pipe)(Effect.all(safeParams), Effect.flatMap(({ dateOperator, predicateValue }) => Effect.succeed({
        dateOperator: exports.dateOperatorSqlMapping[dateOperator],
        predicateValue: predicateValue.toISOString(),
    })));
};
const parseDateFieldFilter = (maybeFilter) => {
    if (typeof maybeFilter === "string") {
        return Effect.all([
            (0, Function_1.pipe)(parseColonDelimitedDateFilterString(maybeFilter), Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid date filter" }))),
        ]);
    }
    if (Array.isArray(maybeFilter)) {
        return (0, Function_1.pipe)(Effect.all(maybeFilter.map(parseColonDelimitedDateFilterString)), Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid date filter" })));
    }
    return Effect.succeed([]);
};
exports.parseDateFieldFilter = parseDateFieldFilter;
