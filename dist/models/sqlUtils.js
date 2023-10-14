"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSetQueriesAndParams = exports.createFilterQuery = exports.booleanFilterQuery = exports.dateFilterQuery = exports.stringFilterQuery = exports.numericalFilterQuery = void 0;
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
const addToSqlSetQueries = ({ fieldName, fieldValue, paramIndexOffset, setQueriesAndParams, }) => {
    if (fieldValue !== undefined) {
        const paramIndex = setQueriesAndParams.setParams.length + paramIndexOffset + 1;
        const newSqlSetQuery = [
            ...setQueriesAndParams.sqlSetQueries,
            `${fieldName} = $${paramIndex}`,
        ];
        const newSetParams = [...setQueriesAndParams.setParams, fieldValue];
        return Object.assign(Object.assign({}, setQueriesAndParams), { sqlSetQueries: newSqlSetQuery, setParams: newSetParams });
    }
    return setQueriesAndParams;
};
const createSetQueriesAndParams = (newUpdates, queryParamStartIndex) => {
    return Object.entries(newUpdates).reduce((acc, [fieldName, fieldValue]) => addToSqlSetQueries({
        fieldName,
        fieldValue,
        paramIndexOffset: queryParamStartIndex,
        setQueriesAndParams: acc,
    }), { sqlSetQueries: [], setParams: [] });
};
exports.createSetQueriesAndParams = createSetQueriesAndParams;
