"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParseDefinedFields = void 0;
const effect_1 = require("effect");
const Function_1 = require("@effect/data/Function");
const customErrors_1 = require("../customErrors");
const primitiveParsers_1 = require("../../sharedUtils.ts/primitiveParsers");
const safeParseDefinedFields = (maybeDefinedFieldsString) => {
    return (0, Function_1.pipe)((0, primitiveParsers_1.safeParseNonEmptyString)(maybeDefinedFieldsString), effect_1.Effect.flatMap((definedFieldsString) => (0, primitiveParsers_1.safeParseStringArray)(definedFieldsString
        .slice(1, -1) // remove brackets from array [ field1, field2, field3 ]
        .split(",")
        .map((element) => element.trim()))), effect_1.Effect.flatMap((definedFields) => {
        if (!definedFields.includes("id")) {
            return effect_1.Effect.succeed(["id", ...definedFields]);
        }
        return effect_1.Effect.succeed(definedFields);
    }), effect_1.Effect.orElseFail(() => new customErrors_1.ParameterError({ message: "Invalid defined fields" })));
};
exports.safeParseDefinedFields = safeParseDefinedFields;
