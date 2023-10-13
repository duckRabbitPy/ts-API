import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  safeParseStringOperator,
  stringOperatorSqlMapping,
} from "./stringComparison";

import {
  splitOperatorAndValue,
  safeParseNonEmptyString,
} from "../../../utils/parseHelpers";
import { ParameterError } from "../../../customErrors";

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
        () => new ParameterError({ message: "Invalid string filter" })
      )
    );
  }

  return Effect.succeed([]);
};
