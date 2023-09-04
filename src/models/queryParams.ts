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

export const predicateOperatorSqlMapping = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: ">",
  lte: "<=",
} as PredicateOperatorMap;

export const predicateOperatorMapSchema = Schema.struct({
  eq: Schema.literal("="),
  gt: Schema.literal(">"),
  gte: Schema.literal(">="),
  lt: Schema.literal(">"),
  lte: Schema.literal("<="),
});

export const predicateOperator = Schema.keyof(predicateOperatorMapSchema);
export type PredicateOperator = Schema.To<typeof predicateOperator>;

export type PredicateOperatorMap = Schema.To<typeof predicateOperatorMapSchema>;
export const safeParsePredicateOperator = Schema.parse(predicateOperator);
