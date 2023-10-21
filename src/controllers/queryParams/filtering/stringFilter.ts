import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";

import { splitOperatorAndValue } from "./splitOperatorAndValue";
import { ParameterError } from "../../customErrors";
import { safeParseNonEmptyString } from "../../../sharedUtils.ts/primitiveParsers";

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

const parseColonDelimitedStringFilter = (filterString: string) => {
  const [operator, value] = splitOperatorAndValue(filterString);
  const safeParams = {
    stringOperator: safeParseStringOperator(operator),
    predicateValue: safeParseNonEmptyString(value),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ stringOperator, predicateValue }) =>
      Effect.succeed({
        stringOperatorCallback: stringOperatorSqlMapping[stringOperator],
        predicateValue,
      })
    )
  );
};

export const parseStringFieldFilter = (maybeFilter: unknown) => {
  if (typeof maybeFilter === "string") {
    return Effect.all([
      pipe(
        parseColonDelimitedStringFilter(maybeFilter),
        Effect.orElseFail(
          () => new ParameterError({ message: "Invalid string filter" })
        )
      ),
    ]);
  }

  if (Array.isArray(maybeFilter)) {
    return pipe(
      Effect.all(maybeFilter.map(parseColonDelimitedStringFilter)),
      Effect.orElseFail(
        () => new ParameterError({ message: "Invalid string filter" })
      )
    );
  }

  return Effect.succeed([]);
};
