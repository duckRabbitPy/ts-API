import * as Schema from "@effect/schema/Schema";

export const dateOperatorSqlMapping = {
  eq: "=",
  after: ">",
  before: "<",
} as DateOperatorOperatorMap;

export const dateOperatorMapSchema = Schema.struct({
  eq: Schema.literal("="),
  after: Schema.literal(">"),
  before: Schema.literal("<"),
});

export const dateOperator = Schema.keyof(dateOperatorMapSchema);
export type DateOperatorOperatorMap = Schema.To<typeof dateOperatorMapSchema>;

export const safeParseDateOperator = Schema.parse(dateOperator);
