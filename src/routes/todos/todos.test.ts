import { expect, test, describe, beforeEach } from "bun:test";
import { resetAndSeedDatabase, TODO_SEED_VALUES } from "../../db/seed";

const TODOS_ENDPOINT = "http://localhost:3000/api-v1/todos";
const AUTH_HEADER = {
  "x-api-key": process.env.API_KEY || "",
};

async function checkContentType(response: Response) {
  expect(response.headers.get("content-type")).toEqual(
    "application/json; charset=utf-8"
  );
}

describe("V1 Todo Database Tests", () => {
  beforeEach(async () => {
    await resetAndSeedDatabase();
  });

  describe("CRUD operations", () => {
    test("get all todos returns all todos", async () => {
      const res = await fetch(TODOS_ENDPOINT, {
        headers: AUTH_HEADER,
      });

      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos
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

      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe(
        "Invalid input in request body. Expected {text: string} (non-empty)"
      );
    });

    test("only text property can be set when creating a new todo", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}`, {
        method: "POST",
        body: JSON.stringify({ text: "hello", completed: true }),
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      });

      expect(res.status).toEqual(400);
      await checkContentType(res);

      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe(
        "Invalid input in request body. Expected {text: string} (non-empty)"
      );
    });

    test("create todo errors if sent to single todo endpoint", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/1`, {
        method: "POST",
        body: JSON.stringify({ text: "new text" }),
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      });

      expect(res.status).toEqual(406);
      checkContentType(res);
      expect(
        await res.json().then((res) => {
          return res.message;
        })
      ).toBe("Method Not Acceptable");
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

    test("errors if try to update id field", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/1`, {
        method: "PUT",
        body: JSON.stringify({ id: 2 }),
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      });

      expect(res.status).toEqual(400);
      checkContentType(res);

      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe(
        "Invalid parameter in request body. One of the fields specified is not allowed to be updated"
      );
    });

    test("set completed to true", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/1`, {
        method: "PUT",
        body: JSON.stringify({ completed: true }),
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      });

      expect(res.status).toEqual(200);
      checkContentType(res);
      expect(await res.json().then((res) => res.completed)).toBe(true);
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
        TODO_SEED_VALUES.todos.length
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
        TODO_SEED_VALUES.todos.length + 1
      );
    });

    test("getall only returns defined fields", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?fields=%5Btext,%20id%5D`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res[0])).toMatchObject({
        id: TODO_SEED_VALUES.todos[0].id,
        text: TODO_SEED_VALUES.todos[0].text,
      });
    });
  });

  describe("Sorting, pagination and defined fields", () => {
    test("page size and page number parameters limit and offset return values", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?page_size=2&page_number=2`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.slice(2, 4)
      );
    });

    test("sort by numerical field (id desc)", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?sort_by=id&order=desc`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.slice().reverse()
      );
    });

    test("get by id only returns defined fields", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/2?fields=%5Btext,%20id%5D`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject({
        id: TODO_SEED_VALUES.todos[1].id,
        text: TODO_SEED_VALUES.todos[1].text,
      });
    });

    test("if user forgets to add id to defined fields array it is implied because required arg", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/2?fields=%5Btext%5D`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject({
        id: TODO_SEED_VALUES.todos[1].id,
        text: TODO_SEED_VALUES.todos[1].text,
      });
    });
  });

  describe("Numerical filter tests", () => {
    test("id equal to parameter input number", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?id=3`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.filter((todo) => todo.id === 3)
      );
    });

    test("id greater than number", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?id=gt%3A3`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.slice(3)
      );
    });

    test("id less than or equal to number", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?id=lte%3A3`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.slice(0, 3)
      );
    });

    test("two filters for numerical filter id greater 2 and less than 5 ", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?id=lt%3A5&id=gt%3A2`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.filter((todo) => todo.id > 2 && todo.id < 5)
      );
    });
  });

  describe("String filter tests", () => {
    test("return if starts with string", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?text=startsWith%3AWalk`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject([
        TODO_SEED_VALUES.todos[1],
      ]);
    });

    test("return if ends with string", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?text=endsWith%3Arun`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject([
        TODO_SEED_VALUES.todos[3],
      ]);
    });

    test("return if contains string", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?text=contains%3Athe`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject([
        TODO_SEED_VALUES.todos[1],
        TODO_SEED_VALUES.todos[2],
        TODO_SEED_VALUES.todos[4],
      ]);
    });

    test("return if equals string", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?text=eq%3AWalk%20the%20dog`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject([
        TODO_SEED_VALUES.todos[1],
      ]);
    });

    test("two filters for string filter text contains 'the' and ends with 'k'", async () => {
      const res = await fetch(
        `${TODOS_ENDPOINT}?text=contains%3Athe&text=endsWith%3Ak`,
        {
          headers: AUTH_HEADER,
        }
      );
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject([
        TODO_SEED_VALUES.todos[2],
      ]);
    });
  });

  describe("Boolean filter tests", () => {
    test("return if true", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?completed=true`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.filter((todo) => todo.completed === true)
      );
    });

    test("Returns false if two conflicting boolean filters", async () => {
      const res = await fetch(
        `${TODOS_ENDPOINT}?completed=true&completed=false`,
        {
          headers: AUTH_HEADER,
        }
      );
      expect(res.status).toEqual(200);
      await checkContentType(res);
      expect(await res.json().then((res) => res)).toMatchObject([]);
    });
  });

  describe("Date filter tests", () => {
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
        TODO_SEED_VALUES.todos[0],
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
        TODO_SEED_VALUES.todos[3],
        TODO_SEED_VALUES.todos[4],
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
        TODO_SEED_VALUES.todos[0],
      ]);
    });

    test("two filters for date filter updated_at before 2023-09-30T16:26:57.956Z and after 2023-09-30T16:26:51.041Z", async () => {
      const res = await fetch(
        `${TODOS_ENDPOINT}?updated_at=before%3A2023-09-30T16%3A26%3A57.956Z&updated_at=after%3A2023-09-30T16%3A26%3A51.041Z`,
        {
          headers: AUTH_HEADER,
        }
      );

      expect(res.status).toEqual(200);
      await checkContentType(res);

      expect(await res.json().then((res) => res)).toMatchObject(
        TODO_SEED_VALUES.todos.slice(1, 3)
      );
    });

    test("return error if invalid date", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}?updated_at=eq%3Anot_a_date`, {
        headers: AUTH_HEADER,
      });

      expect(res.status).toEqual(400);
      await checkContentType(res);

      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe("Invalid date filter");
    });
  });

  describe("Error handling", () => {
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

    test("incorrect route returns 404", async () => {
      const res = await fetch(
        "http://localhost:3000/api-v1/nonExistantEndpoint",
        {
          headers: AUTH_HEADER,
        }
      );

      expect(res.status).toEqual(404);
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
  });

  describe(":id parameter", () => {
    test("get todo by id with invalid id", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/not_a_valid_id`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(400);
      checkContentType(res);

      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe(
        "Invalid input for request parameter /:id. Expected a number"
      );
    });

    test("get todo by id with id that does not exist", async () => {
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

    test("get todo by id with id that is not a number", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/not_a_valid_id`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(400);
      checkContentType(res);

      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe(
        "Invalid input for request parameter /:id. Expected a number"
      );
    });

    test("get todo by id with id that is a negative number", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/-1`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(400);
      checkContentType(res);
      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe(
        "Invalid input for request parameter /:id. Expected a number"
      );
    });

    test("get todo by id with id that is a decimal number", async () => {
      const res = await fetch(`${TODOS_ENDPOINT}/1.5`, {
        headers: AUTH_HEADER,
      });
      expect(res.status).toEqual(400);
      checkContentType(res);
      const resJson = await res.json().then((res) => res);
      expect(resJson.message).toBe("Fail: ParameterError");
      expect(resJson.info).toBe(
        "Invalid input for request parameter /:id. Expected a number"
      );
    });
  });
});
