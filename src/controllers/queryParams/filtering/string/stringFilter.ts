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
import { ParameterError } from "../../../../models/todos";

const parseStringFilterString = (filterString: string) => {
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

export const parseStringFilter = (maybeFilterString: unknown) => {
  return pipe(
    safeParseNonEmptyString(maybeFilterString),
    Effect.flatMap((filterString) => parseStringFilterString(filterString)),
    Effect.orElseFail(
      () => new ParameterError({ message: "Invalid string filter" })
    )
  );
};
