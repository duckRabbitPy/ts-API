import { Effect } from "effect";
import { pipe } from "@effect/data/Function";
import {
  safeParseNonEmptyString,
  safeParseStringArray,
} from "../utils/parseHelpers";

export const safeParseDefinedFields = (maybeDefinedFieldsString: unknown) => {
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
