import * as Schema from "@effect/schema/Schema";

export const sortOrderSchema = Schema.union(
  Schema.literal("asc"),
  Schema.literal("desc")
);
export type SortOrder = Schema.To<typeof sortOrderSchema>;
export const safeParseOrderParam = Schema.parse(sortOrderSchema);
