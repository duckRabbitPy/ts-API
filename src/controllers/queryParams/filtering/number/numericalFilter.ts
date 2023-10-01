import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  safeParseNumericalOperator,
  numericalOperatorSqlMapping,
} from "./numberComparison";
import {
  parseColon,
  safeParseNonEmptyString,
  safeParseNumber,
} from "../../../utils/parseHelpers";
import { ParameterError } from "../../../../models/todos";

const parseNumberFilterString = (filterString: string) => {
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
    Effect.flatMap((filterString) => parseNumberFilterString(filterString)),
    Effect.orElseFail(
      () => new ParameterError({ message: "Invalid numerical filter" })
    )
  );
};
