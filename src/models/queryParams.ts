import * as Schema from "@effect/schema/Schema";

export const sortOrderSchema = Schema.union(
  Schema.literal("asc"),
  Schema.literal("desc")
);
export type SortOrder = Schema.To<typeof sortOrderSchema>;
export const safeParseOrderParam = Schema.parse(sortOrderSchema);

export const sortBySchema = Schema.union(
  Schema.literal("id"),
  Schema.literal("text")
);
export type SortBy = Schema.To<typeof sortBySchema>;
export const safeParseSortByParam = Schema.parse(sortBySchema);

export const safeParseNumber = Schema.parse(Schema.number);
export const safeParseNonEmptyString = Schema.parse(
  Schema.string.pipe(Schema.minLength(1))
);

export const numericalOperatorSqlMapping = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: ">",
  lte: "<=",
} as NumericalOperatorMap;

export const numericalOperatorMapSchema = Schema.struct({
  eq: Schema.literal("="),
  gt: Schema.literal(">"),
  gte: Schema.literal(">="),
  lt: Schema.literal(">"),
  lte: Schema.literal("<="),
});

export const numericalOperator = Schema.keyof(numericalOperatorMapSchema);

export type NumericalOperatorMap = Schema.To<typeof numericalOperatorMapSchema>;
export const safeParseNumericalOperator = Schema.parse(numericalOperator);

export const stringOperatorSqlMapping = {
  contains: (a: string) => `LIKE '%${a}%'` as const,
  startsWith: (a: string) => `LIKE '${a}%'` as const,
  endsWith: (a: string) => `LIKE '%${a}'` as const,
  eq: (a: string) => `= '${a}'` as const,
} as const;

const stringOperatorSchema = Schema.union(
  Schema.literal("contains"),
  Schema.literal("startsWith"),
  Schema.literal("endsWith"),
  Schema.literal("eq")
);

export const safeParseStringOperator = Schema.parse(stringOperatorSchema);
