import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  dateOperatorSqlMapping,
  safeParseDateOperator,
} from "./dateComparison";
import {
  safeParseDate,
  splitOperatorAndValue,
} from "../../../utils/parseHelpers";
import { ParameterError } from "../../../customErrors";

const parseColonDelimitedDateFilterString = (filterString: string) => {
  const [operator, value] = splitOperatorAndValue(filterString);

  const safeParams = {
    dateOperator: safeParseDateOperator(operator),
    predicateValue: safeParseDate(value),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ dateOperator, predicateValue }) =>
      Effect.succeed({
        dateOperator: dateOperatorSqlMapping[dateOperator],
        predicateValue: predicateValue.toISOString(),
      })
    )
  );
};

export const parseDateFilter = (maybeFilter: unknown) => {
  if (typeof maybeFilter === "string") {
    return Effect.all([
      pipe(
        parseColonDelimitedDateFilterString(maybeFilter),
        Effect.orElseFail(
          () => new ParameterError({ message: "Invalid date filter" })
        )
      ),
    ]);
  }

  if (Array.isArray(maybeFilter)) {
    return pipe(
      Effect.all(maybeFilter.map(parseColonDelimitedDateFilterString)),
      Effect.orElseFail(
        () => new ParameterError({ message: "Invalid date filter" })
      )
    );
  }

  return Effect.succeed([]);
};
