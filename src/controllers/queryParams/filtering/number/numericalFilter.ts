import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  safeParseNumericalOperator,
  numericalOperatorSqlMapping,
} from "./numberComparison";
import {
  splitOperatorAndValue,
  safeParseNumber,
} from "../../../utils/parseHelpers";
import { ParameterError } from "../../../customErrors";

const parseColonDelimitedNumberFilter = (filterString: string) => {
  const [operator, value] = splitOperatorAndValue(filterString);
  const safeParams = {
    numericalOperator: safeParseNumericalOperator(operator),
    predicateValue: safeParseNumber(Number(value)),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ numericalOperator, predicateValue }) =>
      Effect.succeed({
        numericalOperator: numericalOperatorSqlMapping[numericalOperator],
        predicateValue,
      })
    )
  );
};

export const parseNumericalQueryFilter = (maybeFilter: unknown) => {
  if (typeof maybeFilter === "string") {
    return Effect.all([
      pipe(
        parseColonDelimitedNumberFilter(maybeFilter),
        Effect.orElseFail(
          () => new ParameterError({ message: "Invalid numerical filter" })
        )
      ),
    ]);
  }

  if (Array.isArray(maybeFilter)) {
    return pipe(
      Effect.all(maybeFilter.map(parseColonDelimitedNumberFilter)),
      Effect.orElseFail(
        () => new ParameterError({ message: "Invalid numerical filter" })
      )
    );
  }

  return Effect.succeed([]);
};
