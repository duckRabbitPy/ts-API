import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  dateOperatorSqlMapping,
  safeParseDateOperator,
} from "./dateComparison";
import {
  parseColon,
  safeParseDate,
  safeParseNonEmptyString,
} from "../../../utils/parseHelpers";
import { ParameterError } from "../../../customErrors";

const parseCommaDelimitedDateFilterString = (filterString: string) => {
  const [a, b] = parseColon(filterString);

  const safeParams = {
    dateOperator: safeParseDateOperator(a),
    predicateValue: safeParseDate(b),
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
        parseCommaDelimitedDateFilterString(maybeFilter),
        Effect.orElseFail(
          () => new ParameterError({ message: "Invalid string filter" })
        )
      ),
    ]);
  }

  if (Array.isArray(maybeFilter)) {
    return pipe(
      Effect.all(maybeFilter.map(parseCommaDelimitedDateFilterString)),
      Effect.orElseFail(
        () => new ParameterError({ message: "Invalid numerical filter" })
      )
    );
  }

  return Effect.succeed(null);
};
