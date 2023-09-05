import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import {
  safeParseNonEmptyString,
  safeParseStringOperator,
  stringOperatorSqlMapping,
} from "../../models/queryParams";
import { parseColon } from "./filter";

const parseFilterString = (filterString: string) => {
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
    Effect.flatMap((filterString) => parseFilterString(filterString)),
    Effect.orElseSucceed(() => null),
    Effect.runSync
  );
};
