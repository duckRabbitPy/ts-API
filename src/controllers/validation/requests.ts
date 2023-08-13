import { Request } from "express";
import * as Effect from "@effect/io/Effect";

export const getIdFromRequest = (
  req: Request
): Effect.Effect<never, Error, number> =>
  Number.isInteger(Number(req.params?.id))
    ? Effect.succeed(Number(req.params?.id))
    : Effect.fail(new Error("Id cannot be converted to number"));

export const getBodyTextFromRequest = (
  req: Request
): Effect.Effect<never, Error, string> => {
  const maybeText = req.body?.text;
  return typeof maybeText === "string" && maybeText.length
    ? Effect.succeed(maybeText)
    : Effect.fail(
        new Error("Invalid text parameter, check is not empty string")
      );
};
