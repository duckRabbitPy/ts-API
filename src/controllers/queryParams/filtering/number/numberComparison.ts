import * as Schema from "@effect/schema/Schema";

export const numericalOperatorSqlMapping = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
} as NumericalOperatorMap;

export const numericalOperatorMapSchema = Schema.struct({
  eq: Schema.literal("="),
  gt: Schema.literal(">"),
  gte: Schema.literal(">="),
  lt: Schema.literal("<"),
  lte: Schema.literal("<="),
});

export const numericalOperator = Schema.keyof(numericalOperatorMapSchema);

export type NumericalOperatorMap = Schema.To<typeof numericalOperatorMapSchema>;
export const safeParseNumericalOperator = Schema.parse(numericalOperator);
