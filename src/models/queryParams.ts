import * as Schema from "@effect/schema/Schema";

export const sortOrderSchema = Schema.union(
  Schema.literal("asc"),
  Schema.literal("desc")
);
export type sortOrder = Schema.To<typeof sortOrderSchema>;
export const safeParseOrderParam = Schema.parse(sortOrderSchema);

export const sortBySchema = Schema.union(
  Schema.literal("id"),
  Schema.literal("text")
);
export type sortBy = Schema.To<typeof sortBySchema>;
export const safeParseSortByParam = Schema.parse(sortBySchema);
