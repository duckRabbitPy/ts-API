import { pipe, Effect } from "effect";

import { Request } from "express";
import { safeParseNumber } from "../utils/parseHelpers";

export const safeParsePagination = (queryParams: Request) => {
  return pipe(
    Effect.all({
      limit: safeParseNumber(Number(queryParams.query.page_size)),
      pageNumber: safeParseNumber(Number(queryParams.query.page_number)),
    }),
    Effect.tap(({ limit, pageNumber }) =>
      Effect.log(`limit: ${limit}, pageNumber: ${pageNumber}`)
    ),
    Effect.flatMap(({ limit, pageNumber }) =>
      Effect.succeed({
        limit: limit,
        offset: (pageNumber - 1) * limit,
      })
    )
  );
};
