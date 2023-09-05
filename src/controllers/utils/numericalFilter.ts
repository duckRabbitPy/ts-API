import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  safeParseNumber,
  safeParseNumericalOperator,
  safeParseNonEmptyString,
  numericalOperatorSqlMapping,
} from "../../models/queryParams";
import { parseColon } from "./filter";

const parseFilterString = (filterString: string) => {
  const [a, b] = parseColon(filterString);
  const safeParams = {
    numericalOperator: safeParseNumericalOperator(a),
    predicateValue: safeParseNumber(Number(b)),
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

export const parseNumericalFilter = (maybeFilterString: unknown) => {
  return pipe(
    safeParseNonEmptyString(maybeFilterString),
    Effect.flatMap((filterString) => parseFilterString(filterString)),
    Effect.orElseSucceed(() => null),
    Effect.runSync
  );
};
