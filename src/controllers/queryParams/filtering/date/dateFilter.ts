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
import { ParameterError } from "../../../../models/todos";

const parseDateFilterString = (filterString: string) => {
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

export const parseDateFilter = (maybeFilterString: unknown) => {
  return pipe(
    safeParseNonEmptyString(maybeFilterString),
    Effect.flatMap((filterString) => parseDateFilterString(filterString)),
    Effect.orElseFail(
      () => new ParameterError({ message: "Invalid date filter" })
    )
  );
};
