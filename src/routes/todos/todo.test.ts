import { expect, test, describe, beforeEach } from "bun:test";
import { resetAndSeedDatabase, SEED_VALUES } from "../../db/seed";

describe("V1 Todo Database Tests", () => {
  const TODOS_ENDPOINT = "http://localhost:3000/api-v1/todos";
  const AUTH_HEADER = {
    "x-api-key": Bun.env.API_KEY || "",
  };

  async function checkContentType(response: Response) {
    expect(response.headers.get("content-type")).toEqual(
      "application/json; charset=utf-8"
    );
  }

  beforeEach(async () => {
    await resetAndSeedDatabase();
  });
  // with auth header
  test("get all todos", async () => {
    const res = await fetch(TODOS_ENDPOINT, {
      headers: AUTH_HEADER,
    });

    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject(
      SEED_VALUES.todos
    );
  });

  test("test page size and page number", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?page_size=2&page_number=2`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject(
      SEED_VALUES.todos.slice(2, 4)
    );
  });

  test("sort by id desc", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?sort_by=id&order=desc`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject(
      SEED_VALUES.todos.slice().reverse()
    );
  });

  test("id greater than number", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?id=gt%3A3`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject(
      SEED_VALUES.todos.slice(3)
    );
  });

  test("id less than or equal to number", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?id=lte%3A3`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject(
      SEED_VALUES.todos.slice(0, 3)
    );
  });

  test("return if starts with string", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?text=startsWith%3AWalk`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject([
      SEED_VALUES.todos[1],
    ]);
  });

  test("return if ends with string", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?text=endsWith%3Arun`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject([
      SEED_VALUES.todos[3],
    ]);
  });

  test("return if contains string", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?text=contains%3Athe`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject([
      SEED_VALUES.todos[1],
      SEED_VALUES.todos[2],
      SEED_VALUES.todos[4],
    ]);
  });

  test("return if equals string", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?text=eq%3AWalk%20the%20dog`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject([
      SEED_VALUES.todos[1],
    ]);
  });

  test("return if before date", async () => {
    const res = await fetch(
      `${TODOS_ENDPOINT}?updated_at=before%3A2023-09-30T16%3A26%3A51.044Z`,
      {
        headers: AUTH_HEADER,
      }
    );
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject([
      SEED_VALUES.todos[0],
    ]);
  });

  test("return if after date", async () => {
    const res = await fetch(
      `${TODOS_ENDPOINT}?updated_at=after%3A2023-09-30T16%3A26%3A51.044Z`,
      {
        headers: AUTH_HEADER,
      }
    );
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject([
      SEED_VALUES.todos[3],
      SEED_VALUES.todos[4],
    ]);
  });

  test("return if equals date", async () => {
    const res = await fetch(
      `${TODOS_ENDPOINT}?updated_at=eq%3A2023-09-30T16%3A26%3A51.041Z`,
      {
        headers: AUTH_HEADER,
      }
    );

    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject([
      SEED_VALUES.todos[0],
    ]);
  });

  test("return error if invalid date", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?updated_at=eq%3Anot_a_date`, {
      headers: AUTH_HEADER,
    });

    expect(res.status).toEqual(400);
    await checkContentType(res);

    expect(await res.json().then((res) => res.message)).toBe(
      "Fail: ParameterError"
    );
  });

  test("get todo by id", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}/1`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    checkContentType(res);

    expect(await res.json().then((res) => res.id)).toBe(1);
  });

  test("get todo by id not found", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}/100`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(404);
    checkContentType(res);
    expect(
      await res.json().then((res) => {
        return res.message;
      })
    ).toBe("Fail: ItemNotFoundError");
  });

  test("create todo", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}`, {
      method: "POST",
      body: JSON.stringify({ text: "hello" }),
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    });

    expect(res.status).toEqual(201);
    checkContentType(res);
    expect(await res.json().then((res) => res.text)).toBe("hello");
  });

  test("create todo with empty text", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}`, {
      method: "POST",
      body: JSON.stringify({ text: "" }),
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    });

    expect(res.status).toEqual(400);
    checkContentType(res);
    expect(
      await res.json().then((res) => {
        return res.message;
      })
    ).toBe("Fail: ParameterError");
  });

  test("update todo", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}/1`, {
      method: "PUT",
      body: JSON.stringify({ text: "updated with new text" }),
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    });

    expect(res.status).toEqual(200);
    checkContentType(res);
    expect(await res.json().then((res) => res.text)).toBe(
      "updated with new text"
    );

    const updatedRes = await fetch(`${TODOS_ENDPOINT}/1`, {
      headers: AUTH_HEADER,
    });
    expect(await updatedRes.json().then((res) => res.text)).toBe(
      "updated with new text"
    );
  });

  test("update todo not found", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}/111`, {
      method: "PUT",
      body: JSON.stringify({ text: "updated with new text" }),
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    });

    expect(res.status).toEqual(404);
    checkContentType(res);
    expect(
      await res.json().then((res) => {
        return res.message;
      })
    ).toBe("Fail: ItemNotFoundError");
  });

  test("delete todo", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}/1`, {
      method: "DELETE",
      headers: AUTH_HEADER,
    });

    expect(res.status).toEqual(204);
    expect(res.headers.get("content-type")).toBeNull();
    expect(await res.json().then((res) => res)).toBeNull();

    const deletedRes = await fetch(`${TODOS_ENDPOINT}/1`);
    expect(await deletedRes.json().then((res) => res.text)).toBeUndefined();
  });

  test("delete todo not found", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}/100`, {
      headers: AUTH_HEADER,
      method: "DELETE",
    });

    checkContentType(res);
    expect(
      await res.json().then((res) => {
        return res.message;
      })
    ).toBe("Fail: ItemNotFoundError");
  });

  test("getall returns newly created todo", async () => {
    const getallRes1 = await fetch(`${TODOS_ENDPOINT}`, {
      headers: AUTH_HEADER,
    });

    expect(await getallRes1.json().then((res) => res.length)).toBe(
      SEED_VALUES.todos.length
    );

    await fetch(`${TODOS_ENDPOINT}`, {
      method: "POST",
      body: JSON.stringify({ text: "hello" }),
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    });

    const getallRes2 = await fetch(`${TODOS_ENDPOINT}`, {
      headers: AUTH_HEADER,
    });
    expect(await getallRes2.json().then((res) => res.length)).toBe(
      SEED_VALUES.todos.length + 1
    );
  });

  test("getall only returns defined fields", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}?fields=%5Btext,%20id%5D`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res[0])).toMatchObject({
      id: SEED_VALUES.todos[0].id,
      text: SEED_VALUES.todos[0].text,
    });
  });

  test("get by id only returns defined fields", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}/2?fields=%5Btext,%20id%5D`, {
      headers: AUTH_HEADER,
    });
    expect(res.status).toEqual(200);
    await checkContentType(res);

    expect(await res.json().then((res) => res)).toMatchObject({
      id: SEED_VALUES.todos[1].id,
      text: SEED_VALUES.todos[1].text,
    });
  });

  test("unauthorised requests receive 401", async () => {
    const res = await fetch(`${TODOS_ENDPOINT}`, {
      headers: {
        "x-api-key": "not_a_valid_key",
      },
    });
    expect(res.status).toEqual(401);
    await checkContentType(res);

    expect(await res.json().then((res) => res.message)).toBe(
      "AuthorisationError"
    );
  });
});
