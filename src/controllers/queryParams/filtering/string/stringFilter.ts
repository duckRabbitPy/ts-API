import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  safeParseStringOperator,
  stringOperatorSqlMapping,
} from "./stringComparison";

import {
  parseColon,
  safeParseNonEmptyString,
} from "../../../utils/parseHelpers";
import { ParameterError } from "../../../customErrors";

const parseColonDelimitedStringFilter = (filterString: string) => {
  const [a, b] = parseColon(filterString);
  const safeParams = {
    stringOperator: safeParseStringOperator(a),
    predicateValue: safeParseNonEmptyString(b),
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

export const parseStringFilter = (maybeFilter: unknown) => {
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
        () => new ParameterError({ message: "Invalid numerical filter" })
      )
    );
  }

  return Effect.succeed(null);
};
