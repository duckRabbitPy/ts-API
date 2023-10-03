import { Data } from "effect";

export class PostgresError extends Data.TaggedClass("PostgresError")<{
  message: string;
}> {}

export class ParameterError extends Data.TaggedClass("ParameterError")<{
  message: string;
}> {}

export class ItemNotFoundError extends Data.TaggedClass("ItemNotFoundError")<{
  message: string;
}> {}

export class AuthorisationError extends Data.TaggedClass("AuthorisationError")<{
  message: string;
}> {}
