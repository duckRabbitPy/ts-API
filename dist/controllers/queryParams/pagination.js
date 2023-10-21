"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParsePagination = void 0;
const effect_1 = require("effect");
const primitiveParsers_1 = require("../../sharedUtils.ts/primitiveParsers");
const safeParsePagination = (queryParams) => {
    return (0, effect_1.pipe)(effect_1.Effect.all({
        limit: (0, primitiveParsers_1.safeParseNumber)(Number(queryParams.query.page_size)),
        pageNumber: (0, primitiveParsers_1.safeParseNumber)(Number(queryParams.query.page_number)),
    }), effect_1.Effect.flatMap(({ limit, pageNumber }) => effect_1.Effect.succeed({
        limit: limit,
        offset: (pageNumber - 1) * limit,
    })));
};
exports.safeParsePagination = safeParsePagination;
