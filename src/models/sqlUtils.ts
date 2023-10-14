export type NumericalSQLFilter = {
  numericalOperator: "=" | ">" | ">=" | "<=" | "<";
  predicateValue: number;
};

export type StringSQLFilter = {
  stringOperatorCallback: (a: string) => string;
  predicateValue: string;
};

export type DateSQLFilter = {
  dateOperator: "=" | ">" | "<";
  predicateValue: string;
};

export type BooleanSQLFilter = {
  booleanOperator: "=";
  predicateValue: boolean;
};

export const numericalFilterQuery = (
  paramName: string,
  filter: NumericalSQLFilter
) => `${paramName} ${filter.numericalOperator} ${filter.predicateValue}`;

export const stringFilterQuery = (paramName: string, filter: StringSQLFilter) =>
  `${paramName} ${filter.stringOperatorCallback(filter.predicateValue)}`;

export const dateFilterQuery = (paramName: string, filter: DateSQLFilter) =>
  `${paramName} ${filter.dateOperator} TIMESTAMP '${filter.predicateValue}'`;

export const booleanFilterQuery = (
  paramName: string,
  filter: BooleanSQLFilter
) => `${paramName} ${filter.booleanOperator} ${filter.predicateValue}`;

export const createFilterQuery = <T>(
  paramName: string,
  filters: T[],
  formatQuery: (paramName: string, filter: T) => string
): string | null => {
  if (filters.length > 0) {
    const filterQueries = filters.map((filter) =>
      formatQuery(paramName, filter)
    );
    return filterQueries.join(" AND ");
  }
  return null;
};

const addToSqlSetQueries = ({
  fieldName,
  fieldValue,
  paramIndexOffset,
  setQueriesAndParams,
}: {
  fieldName: string;
  fieldValue: string | number | boolean | undefined;
  paramIndexOffset: number;
  setQueriesAndParams: SetQueriesAndParams;
}): SetQueriesAndParams => {
  if (fieldValue !== undefined) {
    const paramIndex =
      setQueriesAndParams.setParams.length + paramIndexOffset + 1;

    const newSqlSetQuery = [
      ...setQueriesAndParams.sqlSetQueries,
      `${fieldName} = $${paramIndex}`,
    ];

    const newSetParams = [...setQueriesAndParams.setParams, fieldValue];

    return {
      ...setQueriesAndParams,
      sqlSetQueries: newSqlSetQuery,
      setParams: newSetParams,
    };
  }

  return setQueriesAndParams;
};

type UpdateValues = string | number | boolean | undefined;
type SetQueriesAndParams = {
  setParams: (string | number | boolean)[];
  sqlSetQueries: string[];
};

export const createSetQueriesAndParams = (
  newUpdates: Record<string, UpdateValues>,
  queryParamStartIndex: number
): SetQueriesAndParams => {
  return Object.entries(newUpdates).reduce(
    (acc, [fieldName, fieldValue]) =>
      addToSqlSetQueries({
        fieldName,
        fieldValue,
        paramIndexOffset: queryParamStartIndex,
        setQueriesAndParams: acc,
      }),
    { sqlSetQueries: [], setParams: [] } as SetQueriesAndParams
  );
};
