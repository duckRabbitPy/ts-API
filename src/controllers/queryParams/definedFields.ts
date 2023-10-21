import { Effect } from "effect";
import { pipe } from "@effect/data/Function";

import { ParameterError } from "../customErrors";
import {
  safeParseNonEmptyString,
  safeParseStringArray,
} from "../../sharedUtils.ts/primitiveParsers";

export const safeParseDefinedFields = (maybeDefinedFieldsString: unknown) => {
  return pipe(
    safeParseNonEmptyString(maybeDefinedFieldsString),
    Effect.flatMap((definedFieldsString) =>
      safeParseStringArray(
        definedFieldsString
          .slice(1, -1) // remove brackets from array [ field1, field2, field3 ]
          .split(",")
          .map((element) => element.trim())
      )
    ),
    Effect.flatMap((definedFields) => {
      if (!definedFields.includes("id")) {
        return Effect.succeed(["id", ...definedFields]);
      }
      return Effect.succeed(definedFields);
    }),
    Effect.orElseFail(
      () => new ParameterError({ message: "Invalid defined fields" })
    )
  );
};
