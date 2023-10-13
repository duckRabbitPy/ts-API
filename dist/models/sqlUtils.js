"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFilterQuery = exports.booleanFilterQuery = exports.dateFilterQuery = exports.stringFilterQuery = exports.numericalFilterQuery = void 0;
const numericalFilterQuery = (paramName, filter) => `${paramName} ${filter.numericalOperator} ${filter.predicateValue}`;
exports.numericalFilterQuery = numericalFilterQuery;
const stringFilterQuery = (paramName, filter) => `${paramName} ${filter.stringOperatorCallback(filter.predicateValue)}`;
exports.stringFilterQuery = stringFilterQuery;
const dateFilterQuery = (paramName, filter) => `${paramName} ${filter.dateOperator} TIMESTAMP '${filter.predicateValue}'`;
exports.dateFilterQuery = dateFilterQuery;
const booleanFilterQuery = (paramName, filter) => `${paramName} ${filter.booleanOperator} ${filter.predicateValue}`;
exports.booleanFilterQuery = booleanFilterQuery;
const createFilterQuery = (paramName, filters, formatQuery) => {
    if (filters.length > 0) {
        const filterQueries = filters.map((filter) => formatQuery(paramName, filter));
        return filterQueries.join(" AND ");
    }
    return null;
};
exports.createFilterQuery = createFilterQuery;
