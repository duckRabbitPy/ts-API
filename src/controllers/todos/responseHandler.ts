import * as Effect from "@effect/io/Effect";
import { ParseError } from "@effect/schema/ParseResult";
import { Response } from "express";

import {
  ItemNotFoundError,
  ParameterError,
  PostgresError,
} from "../customErrors";
import { Todo } from "../../models/todos";
import { pipe } from "effect";

type ResolveTodoResponseInput = {
  getDataEffect: Effect.Effect<
    never,
    ParseError | PostgresError | ParameterError | ItemNotFoundError,
    Todo | readonly Todo[] | void
  >;
  response: Response;
  successStatus: number;
};

const respondWithError = (
  response: Response,
  status: number,
  message: string,
  additionalInfo?: string
) =>
  pipe(
    Effect.succeed(
      response.status(status).json({
        message: `Fail: ${message}`,
        info: additionalInfo,
      })
    )
  );

export function sendResponse({
  getDataEffect,
  response,
  successStatus,
}: ResolveTodoResponseInput) {
  return pipe(
    Effect.matchCauseEffect(getDataEffect, {
      onFailure: (cause) => {
        switch (cause._tag) {
          case "Fail":
            if (cause.error._tag === "ItemNotFoundError") {
              return respondWithError(
                response,
                404,
                cause.error._tag,
                cause.error.message
              );
            }
            if (cause.error._tag === "ParameterError") {
              return respondWithError(
                response,
                400,
                cause.error._tag,
                cause.error.message
              );
            }
            return respondWithError(response, 500, cause.error._tag);
          case "Die":
          case "Interrupt":
            respondWithError(response, 500, "Internal server error");
        }
        return Effect.succeed(
          response.status(500).json("Internal Server error")
        );
      },
      onSuccess: (todos) =>
        Effect.succeed(response.status(successStatus).json(todos)),
    }),
    Effect.runPromise
  );
}
