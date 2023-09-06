import { Response } from "express";
import * as Effect from "@effect/io/Effect";
import { ParseError } from "@effect/schema/ParseResult";
import { pipe } from "effect";

// todo type properly
type ResolveResponseInput = {
  finalEffect: Effect.Effect<
    never,
    ParseError | Error,
    | {
        readonly id: number;
        readonly text: string;
      }
    | readonly { readonly id: number; readonly text: string }[]
    | void
  >;
  response: Response;
  successStatus: number;
};

export const resolveResponse = ({
  finalEffect,
  response,
  successStatus,
}: ResolveResponseInput) => {
  return pipe(
    Effect.matchCauseEffect(finalEffect, {
      onFailure: (cause) => {
        switch (cause._tag) {
          case "Fail":
            return Effect.succeed(
              response.status(500).json(`Fail: ${JSON.stringify(cause.error)}`)
            );
          case "Die":
            return Effect.succeed(
              response.status(500).json(`Die: ${JSON.stringify(cause.defect)}`)
            );
          case "Interrupt":
            Effect.succeed(
              response
                .status(500)
                .json(`Interrupt: ${JSON.stringify(cause.fiberId)}`)
            );
        }
        return Effect.succeed(response.status(500).json(`Server error`));
      },
      onSuccess: (todo) =>
        Effect.succeed(response.status(successStatus).json({ todo })),
    }),
    Effect.runPromise
  );
};
