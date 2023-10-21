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
exports.getFilterParamsFromRequest = void 0;
const Effect = __importStar(require("@effect/io/Effect"));
const booleanFilter_1 = require("../queryParams/filtering/booleanFilter");
const dateFilter_1 = require("../queryParams/filtering/dateFilter");
const numericalFilter_1 = require("../queryParams/filtering/numericalFilter");
const effect_1 = require("effect");
const stringFilter_1 = require("../queryParams/filtering/stringFilter");
const getFilterParamsFromRequest = (req) => {
    const idFilter = (0, numericalFilter_1.parseNumericalFieldFilter)(req.query.id);
    const textFilter = (0, stringFilter_1.parseStringFieldFilter)(req.query.text);
    const updatedAtFilter = (0, dateFilter_1.parseDateFieldFilter)(req.query.updated_at);
    const completedFilter = (0, booleanFilter_1.parseBooleanFieldFilter)(req.query.completed);
    return (0, effect_1.pipe)(Effect.all({ idFilter, textFilter, updatedAtFilter, completedFilter }));
};
exports.getFilterParamsFromRequest = getFilterParamsFromRequest;
