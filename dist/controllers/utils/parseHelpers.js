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
exports.checkIfNoResult = exports.safeParseStringArray = exports.safeParseDate = exports.safeParseNonEmptyString = exports.safeParseNumber = exports.parseDefinedFields = exports.splitOperatorAndValue = void 0;
const effect_1 = require("effect");
const Function_1 = require("@effect/data/Function");
const Schema = __importStar(require("@effect/schema/Schema"));
const customErrors_1 = require("../customErrors");
const splitOperatorAndValue = (filterString) => {
    if (filterString.includes(":")) {
        const splitIndex = filterString.indexOf(":");
        const leftPart = filterString.substring(0, splitIndex);
        const rightPart = filterString.substring(splitIndex + 1);
        return [leftPart, rightPart];
    }
    return ["eq", filterString];
};
exports.splitOperatorAndValue = splitOperatorAndValue;
const parseDefinedFields = (maybeDefinedFieldsString) => {
    return (0, Function_1.pipe)((0, exports.safeParseNonEmptyString)(maybeDefinedFieldsString), effect_1.Effect.flatMap((definedFieldsString) => (0, exports.safeParseStringArray)(definedFieldsString
        .slice(1, -1) // remove brackets
        .split(",")
        .map((element) => element.trim()))));
};
exports.parseDefinedFields = parseDefinedFields;
exports.safeParseNumber = Schema.parse(Schema.number.pipe(Schema.nonNaN()));
exports.safeParseNonEmptyString = Schema.parse(Schema.string.pipe(Schema.minLength(1)));
exports.safeParseDate = Schema.parse(Schema.Date);
exports.safeParseStringArray = Schema.parse(Schema.array(Schema.string));
const checkIfNoResult = (result) => !!result
    ? effect_1.Effect.succeed(result)
    : effect_1.Effect.fail(new customErrors_1.ItemNotFoundError({ message: "Item not found" }));
exports.checkIfNoResult = checkIfNoResult;
