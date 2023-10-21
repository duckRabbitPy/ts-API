"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfNoResult = void 0;
const effect_1 = require("effect");
const customErrors_1 = require("../customErrors");
const checkIfNoResult = (result) => result
    ? effect_1.Effect.succeed(result)
    : effect_1.Effect.fail(new customErrors_1.ItemNotFoundError({ message: "Item not found" }));
exports.checkIfNoResult = checkIfNoResult;
