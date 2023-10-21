import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";

import { splitOperatorAndValue } from "./splitOperatorAndValue";
import { ParameterError } from "../../customErrors";
import { safeParseNumber } from "../../../sharedUtils.ts/primitiveParsers";

export const numericalOperatorSqlMapping = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
} as NumericalOperatorMap;

export const numericalOperatorMapSchema = Schema.struct({
  eq: Schema.literal("="),
  gt: Schema.literal(">"),
  gte: Schema.literal(">="),
  lt: Schema.literal("<"),
  lte: Schema.literal("<="),
});

export const numericalOperator = Schema.keyof(numericalOperatorMapSchema);

export type NumericalOperatorMap = Schema.To<typeof numericalOperatorMapSchema>;
export const safeParseNumericalOperator = Schema.parse(numericalOperator);

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

export const parseNumericalFieldFilter = (maybeFilter: unknown) => {
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
