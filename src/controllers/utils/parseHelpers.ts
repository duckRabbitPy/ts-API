import { Effect } from "effect";
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";
import { ItemNotFoundError } from "../customErrors";

export const splitOperatorAndValue = (
  filterString: string
): [string, string] => {
  if (filterString.includes(":")) {
    const splitIndex = filterString.indexOf(":");
    const leftPart = filterString.substring(0, splitIndex);
    const rightPart = filterString.substring(splitIndex + 1);

    return [leftPart, rightPart];
  }
  return ["eq", filterString];
};

export const parseDefinedFields = (maybeDefinedFieldsString: unknown) => {
  return pipe(
    safeParseNonEmptyString(maybeDefinedFieldsString),
    Effect.flatMap((definedFieldsString) =>
      safeParseStringArray(
        definedFieldsString
          .slice(1, -1) // remove brackets
          .split(",")
          .map((element) => element.trim())
      )
    )
  );
};

export const safeParseNumber = Schema.parse(
  Schema.number.pipe(Schema.nonNaN())
);
export const safeParseNonEmptyString = Schema.parse(
  Schema.string.pipe(Schema.minLength(1))
);
export const safeParseDate = Schema.parse(Schema.Date);
export const safeParseStringArray = Schema.parse(Schema.array(Schema.string));

export const safeParseBoolean = Schema.parse(Schema.boolean);

export const checkIfNoResult = <T>(result: T) =>
  !!result
    ? Effect.succeed(result)
    : Effect.fail(new ItemNotFoundError({ message: "Item not found" }));
