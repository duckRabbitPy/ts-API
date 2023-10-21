import * as Effect from "@effect/io/Effect";
import { Request } from "express";

import * as Schema from "@effect/schema/Schema";
import { ItemNotFoundError, ParameterError } from "../customErrors";
import { safeParseNumber } from "../../sharedUtils.ts/primitiveParsers";
import { parseNumericalFieldFilter } from "../queryParams/filtering/numericalFilter";
import { pipe } from "effect";
import { parseBooleanFieldFilter } from "../queryParams/filtering/booleanFilter";
import { parseDateFieldFilter } from "../queryParams/filtering/dateFilter";
import { parseStringFieldFilter } from "../queryParams/filtering/stringFilter";

export const getFilterParamsFromRequest = (req: Request) => {
  const idFilter = parseNumericalFieldFilter(req.query.id);

  const textFilter = parseStringFieldFilter(req.query.text);

  const updatedAtFilter = parseDateFieldFilter(req.query.updated_at);

  const completedFilter = parseBooleanFieldFilter(req.query.completed);

  return pipe(
    Effect.all({ idFilter, textFilter, updatedAtFilter, completedFilter })
  );
};

export const safeParseIDRequestParameter = (req: Request) =>
  safeParseNumber(Number(req.params?.id)).pipe(
    Effect.orElseFail(
      () =>
        new ParameterError({
          message:
            "Invalid input for request parameter /:id. Expected a number",
        })
    )
  );

export const checkNoExcessFieldsForUpdate = (body: unknown) =>
  Schema.parse(
    Schema.struct({
      text: Schema.optional(Schema.string),
      completed: Schema.optional(Schema.boolean),
    })
  )(body, {
    onExcessProperty: "error",
  }).pipe(
    Effect.orElseFail(
      () =>
        new ParameterError({
          message:
            "Invalid parameter in request body. One of the fields specified is not allowed to be updated",
        })
    ),
    Effect.flatMap(() => Effect.succeed(Effect.unit))
  );

export const safeParseCreateToDoFieldsFromBody = (body: unknown) =>
  Schema.parse(
    Schema.struct({ text: Schema.string.pipe(Schema.minLength(1)) })
  )(body, {
    onExcessProperty: "error",
  });

export const checkIfNoResult = <T>(result: T) =>
  result
    ? Effect.succeed(result)
    : Effect.fail(new ItemNotFoundError({ message: "Item not found" }));
