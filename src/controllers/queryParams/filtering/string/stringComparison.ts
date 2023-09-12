import * as Schema from "@effect/schema/Schema";

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
