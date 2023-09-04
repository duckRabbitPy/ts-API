import { Request } from "express";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import {
  safeParseNumber,
  safeParsePredicateOperator,
  safeParseNonEmptyString,
  predicateOperatorSqlMapping,
} from "../../models/queryParams";

const parseColon = (filterString: string): [string, string] => {
  if (filterString.includes(":")) {
    return [filterString.split(":")[0], filterString.split(":")[1]];
  }
  return ["eq", filterString];
};

const parseFilterString = (filterString: string) => {
  const [a, b] = parseColon(filterString);
  const safeParams = {
    predicateOperator: safeParsePredicateOperator(a),
    predicateValue: safeParseNumber(Number(b)),
  };

  return pipe(
    Effect.all(safeParams),
    Effect.flatMap(({ predicateOperator, predicateValue }) =>
      Effect.succeed({
        predicateOperator: predicateOperatorSqlMapping[predicateOperator],
        predicateValue,
      })
    )
  );
};

const parsePredicate = (maybeFilterString: unknown) => {
  return pipe(
    safeParseNonEmptyString(maybeFilterString),
    Effect.flatMap((filterString) => parseFilterString(filterString)),
    Effect.orElseSucceed(() => null),
    Effect.runSync
  );
};

export const getFilterParamsFromRequest = (req: Request) => {
  return {
    id: parsePredicate(req.query?.id),
    text: req.query?.text,
  };
};
