import * as Schema from "@effect/schema/Schema";
export const sortBySchema = Schema.union(
  Schema.literal("id"),
  Schema.literal("text"),
  Schema.literal("updated_at")
);
export type SortBy = Schema.To<typeof sortBySchema>;
export const safeParseSortByParam = Schema.parse(sortBySchema);
