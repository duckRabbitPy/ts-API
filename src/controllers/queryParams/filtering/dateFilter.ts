import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import { splitOperatorAndValue } from "./splitOperatorAndValue";
import { ParameterError } from "../../customErrors";
import * as Schema from "@effect/schema/Schema";
import { safeParseDate } from "../../../sharedUtils.ts/primitiveParsers";

export const dateOperatorSqlMapping = {
  eq: "=",
  after: ">",
  before: "<",
} as DateOperatorOperatorMap;

export const dateOperatorMapSchema = Schema.struct({
  eq: Schema.literal("="),
  after: Schema.literal(">"),
  before: Schema.literal("<"),
});

export const dateOperator = Schema.keyof(dateOperatorMapSchema);
export type DateOperatorOperatorMap = Schema.To<typeof dateOperatorMapSchema>;

export const safeParseDateOperator = Schema.parse(dateOperator);

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

export const parseDateFieldFilter = (maybeFilter: unknown) => {
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
