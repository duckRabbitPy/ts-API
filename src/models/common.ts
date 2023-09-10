import * as Schema from "@effect/schema/Schema";

export const safeParseNumber = Schema.parse(Schema.number);
export const safeParseNonEmptyString = Schema.parse(
  Schema.string.pipe(Schema.minLength(1))
);
export const safeParseDate = Schema.parse(Schema.Date);
export const safeParseStringArray = Schema.parse(Schema.array(Schema.string));
