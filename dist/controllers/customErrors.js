"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorisationError = exports.ItemNotFoundError = exports.ParameterError = exports.PostgresError = void 0;
const effect_1 = require("effect");
class PostgresError extends effect_1.Data.TaggedClass("PostgresError") {
}
exports.PostgresError = PostgresError;
class ParameterError extends effect_1.Data.TaggedClass("ParameterError") {
}
exports.ParameterError = ParameterError;
class ItemNotFoundError extends effect_1.Data.TaggedClass("ItemNotFoundError") {
}
exports.ItemNotFoundError = ItemNotFoundError;
class AuthorisationError extends effect_1.Data.TaggedClass("AuthorisationError") {
}
exports.AuthorisationError = AuthorisationError;
