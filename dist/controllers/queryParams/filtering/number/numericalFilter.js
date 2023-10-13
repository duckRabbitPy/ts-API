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
exports.parseNumericalQueryFilter = void 0;
const Function_1 = require("@effect/data/Function");
const Effect = __importStar(require("@effect/io/Effect"));
const numberComparison_1 = require("./numberComparison");
const parseHelpers_1 = require("../../../utils/parseHelpers");
const customErrors_1 = require("../../../customErrors");
const parseColonDelimitedNumberFilter = (filterString) => {
    const [a, b] = (0, parseHelpers_1.splitPredicateAndValue)(filterString);
    const safeParams = {
        numericalOperator: (0, numberComparison_1.safeParseNumericalOperator)(a),
        predicateValue: (0, parseHelpers_1.safeParseNumber)(Number(b)),
    };
    return (0, Function_1.pipe)(Effect.all(safeParams), Effect.flatMap(({ numericalOperator, predicateValue }) => Effect.succeed({
        numericalOperator: numberComparison_1.numericalOperatorSqlMapping[numericalOperator],
        predicateValue,
    })));
};
const parseNumericalQueryFilter = (maybeFilter) => {
    if (typeof maybeFilter === "string") {
        return Effect.all([
            (0, Function_1.pipe)(parseColonDelimitedNumberFilter(maybeFilter), Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid numerical filter" }))),
        ]);
    }
    if (Array.isArray(maybeFilter)) {
        return (0, Function_1.pipe)(Effect.all(maybeFilter.map(parseColonDelimitedNumberFilter)), Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid numerical filter" })));
    }
    return Effect.succeed(null);
};
exports.parseNumericalQueryFilter = parseNumericalQueryFilter;
