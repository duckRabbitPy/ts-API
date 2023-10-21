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
exports.parseBooleanFieldFilter = exports.safeParseBooleanString = exports.safeParseTrueFalseStr = void 0;
const Function_1 = require("@effect/data/Function");
const Effect = __importStar(require("@effect/io/Effect"));
const Schema = __importStar(require("@effect/schema/Schema"));
const customErrors_1 = require("../../customErrors");
exports.safeParseTrueFalseStr = Schema.parse(Schema.union(Schema.literal("true"), Schema.literal("false")));
const safeParseBooleanString = (maybeBool) => (0, Function_1.pipe)(maybeBool, exports.safeParseTrueFalseStr, Effect.flatMap((boolStr) => Effect.succeed(boolStr === "true")));
exports.safeParseBooleanString = safeParseBooleanString;
const parseBooleanFilter = (maybeBoolStr) => {
    const safeParams = {
        booleanOperator: Effect.succeed("="),
        predicateValue: (0, exports.safeParseBooleanString)(maybeBoolStr),
    };
    return (0, Function_1.pipe)(Effect.all(safeParams));
};
const parseBooleanFieldFilter = (maybeFilter) => {
    if (typeof maybeFilter === "string") {
        return Effect.all([
            (0, Function_1.pipe)(parseBooleanFilter(maybeFilter), Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid boolean filter" }))),
        ]);
    }
    if (Array.isArray(maybeFilter)) {
        return (0, Function_1.pipe)(Effect.all(maybeFilter.map(parseBooleanFilter)), Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid boolean filter" })));
    }
    return Effect.succeed([]);
};
exports.parseBooleanFieldFilter = parseBooleanFieldFilter;
