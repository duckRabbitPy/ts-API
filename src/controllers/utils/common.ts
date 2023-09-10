import { Effect } from "effect";
import { pipe } from "remeda";
import {
  safeParseNonEmptyString,
  safeParseStringArray,
} from "../../models/common";

export const parseColon = (filterString: string): [string, string] => {
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
