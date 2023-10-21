import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { ParameterError } from "../../customErrors";

export const safeParseTrueFalseStr = Schema.parse(
  Schema.union(Schema.literal("true"), Schema.literal("false"))
);

export const safeParseBooleanString = (maybeBool: string) =>
  pipe(
    maybeBool,
    safeParseTrueFalseStr,
    Effect.flatMap((boolStr) => Effect.succeed(boolStr === "true"))
  );

const parseBooleanFilter = (maybeBoolStr: string) => {
  const safeParams = {
    booleanOperator: Effect.succeed("=" as const),
    predicateValue: safeParseBooleanString(maybeBoolStr),
  };

  return pipe(Effect.all(safeParams));
};

export const parseBooleanFieldFilter = (maybeFilter: unknown) => {
  if (typeof maybeFilter === "string") {
    return Effect.all([
      pipe(
        parseBooleanFilter(maybeFilter),
        Effect.orElseFail(
          () => new ParameterError({ message: "Invalid boolean filter" })
        )
      ),
    ]);
  }

  if (Array.isArray(maybeFilter)) {
    return pipe(
      Effect.all(maybeFilter.map(parseBooleanFilter)),
      Effect.orElseFail(
        () => new ParameterError({ message: "Invalid boolean filter" })
      )
    );
  }

  return Effect.succeed([]);
};
