"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParseDefinedFields = void 0;
const effect_1 = require("effect");
const Function_1 = require("@effect/data/Function");
const parseHelpers_1 = require("../utils/parseHelpers");
const safeParseDefinedFields = (maybeDefinedFieldsString) => {
    return (0, Function_1.pipe)((0, parseHelpers_1.safeParseNonEmptyString)(maybeDefinedFieldsString), effect_1.Effect.flatMap((definedFieldsString) => (0, parseHelpers_1.safeParseStringArray)(definedFieldsString
        .slice(1, -1) // remove brackets
        .split(",")
        .map((element) => element.trim()))));
};
exports.safeParseDefinedFields = safeParseDefinedFields;
