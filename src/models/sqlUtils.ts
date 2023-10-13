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
