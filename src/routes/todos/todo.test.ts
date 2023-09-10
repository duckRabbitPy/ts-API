import { expect, test } from "bun:test";

test("get todos", async () => {
  const res = await fetch(
    "http://localhost:3000/api-v1/todos?order=asc&sortBy=id&text=startsWith:hello&id=gt%3A50&updated_at=2023-09-09T08%3A07%3A12.310Z&fields=%5Bid,%20text%5D"
  );

  expect(res.status).toEqual(200);
  expect(res.headers.get("content-type")).toEqual(
    "application/json; charset=utf-8"
  );
  expect(await res.json().then((res) => res)).toMatchObject({
    todo: [
      {
        id: 57,
        text: "hello",
      },
      {
        id: 58,
        text: "hello-goodbye",
      },
      {
        id: 66,
        text: "hello",
      },
      {
        id: 91,
        text: "hello",
      },
    ],
  });
});
