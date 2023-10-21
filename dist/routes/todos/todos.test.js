"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const seed_1 = require("../../db/seed");
const TODOS_ENDPOINT = "http://localhost:3000/api-v1/todos";
const AUTH_HEADER = {
    "x-api-key": process.env.API_KEY || "",
};
function checkContentType(response) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, bun_test_1.expect)(response.headers.get("content-type")).toEqual("application/json; charset=utf-8");
    });
}
(0, bun_test_1.describe)("V1 Todo Database Tests", () => {
    (0, bun_test_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, seed_1.resetAndSeedDatabase)();
    }));
    (0, bun_test_1.describe)("CRUD operations", () => {
        (0, bun_test_1.test)("get all todos returns all todos", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(TODOS_ENDPOINT, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos);
        }));
        (0, bun_test_1.test)("get todo by id", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/1`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res.id)).toBe(1);
        }));
        (0, bun_test_1.test)("create todo", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}`, {
                method: "POST",
                body: JSON.stringify({ text: "hello" }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(201);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res.text)).toBe("hello");
        }));
        (0, bun_test_1.test)("create todo with empty text", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}`, {
                method: "POST",
                body: JSON.stringify({ text: "" }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid input in request body. Expected {text: string} (non-empty)");
        }));
        (0, bun_test_1.test)("only text property can be set when creating a new todo", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}`, {
                method: "POST",
                body: JSON.stringify({ text: "hello", completed: true }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            yield checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid input in request body. Expected {text: string} (non-empty)");
        }));
        (0, bun_test_1.test)("create todo errors if sent to single todo endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/1`, {
                method: "POST",
                body: JSON.stringify({ text: "new text" }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(406);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => {
                return res.message;
            })).toBe("Method Not Acceptable");
        }));
        (0, bun_test_1.test)("update todo", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/1`, {
                method: "PUT",
                body: JSON.stringify({ text: "updated with new text" }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res.text)).toBe("updated with new text");
            const updatedRes = yield fetch(`${TODOS_ENDPOINT}/1`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(yield updatedRes.json().then((res) => res.text)).toBe("updated with new text");
        }));
        (0, bun_test_1.test)("errors if try to update id field", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/1`, {
                method: "PUT",
                body: JSON.stringify({ id: 2 }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid parameter in request body. One of the fields specified is not allowed to be updated");
        }));
        (0, bun_test_1.test)("set completed to true", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/1`, {
                method: "PUT",
                body: JSON.stringify({ completed: true }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res.completed)).toBe(true);
        }));
        (0, bun_test_1.test)("update todo not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/111`, {
                method: "PUT",
                body: JSON.stringify({ text: "updated with new text" }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            (0, bun_test_1.expect)(res.status).toEqual(404);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => {
                return res.message;
            })).toBe("Fail: ItemNotFoundError");
        }));
        (0, bun_test_1.test)("delete todo", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/1`, {
                method: "DELETE",
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(204);
            (0, bun_test_1.expect)(res.headers.get("content-type")).toBeNull();
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toBeNull();
            const deletedRes = yield fetch(`${TODOS_ENDPOINT}/1`);
            (0, bun_test_1.expect)(yield deletedRes.json().then((res) => res.text)).toBeUndefined();
        }));
        (0, bun_test_1.test)("delete todo not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/100`, {
                headers: AUTH_HEADER,
                method: "DELETE",
            });
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => {
                return res.message;
            })).toBe("Fail: ItemNotFoundError");
        }));
        (0, bun_test_1.test)("getall returns newly created todo", () => __awaiter(void 0, void 0, void 0, function* () {
            const getallRes1 = yield fetch(`${TODOS_ENDPOINT}`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(yield getallRes1.json().then((res) => res.length)).toBe(seed_1.TODO_SEED_VALUES.todos.length);
            yield fetch(`${TODOS_ENDPOINT}`, {
                method: "POST",
                body: JSON.stringify({ text: "hello" }),
                headers: Object.assign({ "Content-Type": "application/json" }, AUTH_HEADER),
            });
            const getallRes2 = yield fetch(`${TODOS_ENDPOINT}`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(yield getallRes2.json().then((res) => res.length)).toBe(seed_1.TODO_SEED_VALUES.todos.length + 1);
        }));
        (0, bun_test_1.test)("getall only returns defined fields", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?fields=%5Btext,%20id%5D`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res[0])).toMatchObject({
                id: seed_1.TODO_SEED_VALUES.todos[0].id,
                text: seed_1.TODO_SEED_VALUES.todos[0].text,
            });
        }));
    });
    (0, bun_test_1.describe)("Sorting, pagination and defined fields", () => {
        (0, bun_test_1.test)("page size and page number parameters limit and offset return values", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?page_size=2&page_number=2`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.slice(2, 4));
        }));
        (0, bun_test_1.test)("sort by numerical field (id desc)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?sort_by=id&order=desc`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.slice().reverse());
        }));
        (0, bun_test_1.test)("get by id only returns defined fields", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/2?fields=%5Btext,%20id%5D`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject({
                id: seed_1.TODO_SEED_VALUES.todos[1].id,
                text: seed_1.TODO_SEED_VALUES.todos[1].text,
            });
        }));
        (0, bun_test_1.test)("if user forgets to add id to defined fields array it is implied because required arg", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/2?fields=%5Btext%5D`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject({
                id: seed_1.TODO_SEED_VALUES.todos[1].id,
                text: seed_1.TODO_SEED_VALUES.todos[1].text,
            });
        }));
    });
    (0, bun_test_1.describe)("Numerical filter tests", () => {
        (0, bun_test_1.test)("id equal to parameter input number", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?id=3`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.filter((todo) => todo.id === 3));
        }));
        (0, bun_test_1.test)("id greater than number", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?id=gt%3A3`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.slice(3));
        }));
        (0, bun_test_1.test)("id less than or equal to number", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?id=lte%3A3`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.slice(0, 3));
        }));
        (0, bun_test_1.test)("two filters for numerical filter id greater 2 and less than 5 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?id=lt%3A5&id=gt%3A2`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.filter((todo) => todo.id > 2 && todo.id < 5));
        }));
    });
    (0, bun_test_1.describe)("String filter tests", () => {
        (0, bun_test_1.test)("return if starts with string", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?text=startsWith%3AWalk`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[1],
            ]);
        }));
        (0, bun_test_1.test)("return if ends with string", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?text=endsWith%3Arun`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[3],
            ]);
        }));
        (0, bun_test_1.test)("return if contains string", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?text=contains%3Athe`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[1],
                seed_1.TODO_SEED_VALUES.todos[2],
                seed_1.TODO_SEED_VALUES.todos[4],
            ]);
        }));
        (0, bun_test_1.test)("return if equals string", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?text=eq%3AWalk%20the%20dog`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[1],
            ]);
        }));
        (0, bun_test_1.test)("two filters for string filter text contains 'the' and ends with 'k'", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?text=contains%3Athe&text=endsWith%3Ak`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[2],
            ]);
        }));
    });
    (0, bun_test_1.describe)("Boolean filter tests", () => {
        (0, bun_test_1.test)("return if true", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?completed=true`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.filter((todo) => todo.completed === true));
        }));
        (0, bun_test_1.test)("Returns false if two conflicting boolean filters", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?completed=true&completed=false`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([]);
        }));
    });
    (0, bun_test_1.describe)("Date filter tests", () => {
        (0, bun_test_1.test)("return if before date", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?updated_at=before%3A2023-09-30T16%3A26%3A51.044Z`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[0],
            ]);
        }));
        (0, bun_test_1.test)("return if after date", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?updated_at=after%3A2023-09-30T16%3A26%3A51.044Z`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[3],
                seed_1.TODO_SEED_VALUES.todos[4],
            ]);
        }));
        (0, bun_test_1.test)("return if equals date", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?updated_at=eq%3A2023-09-30T16%3A26%3A51.041Z`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject([
                seed_1.TODO_SEED_VALUES.todos[0],
            ]);
        }));
        (0, bun_test_1.test)("two filters for date filter updated_at before 2023-09-30T16:26:57.956Z and after 2023-09-30T16:26:51.041Z", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?updated_at=before%3A2023-09-30T16%3A26%3A57.956Z&updated_at=after%3A2023-09-30T16%3A26%3A51.041Z`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(200);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res)).toMatchObject(seed_1.TODO_SEED_VALUES.todos.slice(1, 3));
        }));
        (0, bun_test_1.test)("return error if invalid date", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}?updated_at=eq%3Anot_a_date`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            yield checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid date filter");
        }));
    });
    (0, bun_test_1.describe)("Error handling", () => {
        (0, bun_test_1.test)("unauthorised requests receive 401", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}`, {
                headers: {
                    "x-api-key": "not_a_valid_key",
                },
            });
            (0, bun_test_1.expect)(res.status).toEqual(401);
            yield checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => res.message)).toBe("AuthorisationError");
        }));
        (0, bun_test_1.test)("incorrect route returns 404", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch("http://localhost:3000/api-v1/nonExistantEndpoint", {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(404);
        }));
        (0, bun_test_1.test)("get todo by id not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/100`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(404);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => {
                return res.message;
            })).toBe("Fail: ItemNotFoundError");
        }));
    });
    (0, bun_test_1.describe)(":id parameter", () => {
        (0, bun_test_1.test)("get todo by id with invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/not_a_valid_id`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid input for request parameter /:id. Expected a number");
        }));
        (0, bun_test_1.test)("get todo by id with id that does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/100`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(404);
            checkContentType(res);
            (0, bun_test_1.expect)(yield res.json().then((res) => {
                return res.message;
            })).toBe("Fail: ItemNotFoundError");
        }));
        (0, bun_test_1.test)("get todo by id with id that is not a number", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/not_a_valid_id`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid input for request parameter /:id. Expected a number");
        }));
        (0, bun_test_1.test)("get todo by id with id that is a negative number", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/-1`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid input for request parameter /:id. Expected a number");
        }));
        (0, bun_test_1.test)("get todo by id with id that is a decimal number", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(`${TODOS_ENDPOINT}/1.5`, {
                headers: AUTH_HEADER,
            });
            (0, bun_test_1.expect)(res.status).toEqual(400);
            checkContentType(res);
            const resJson = yield res.json().then((res) => res);
            (0, bun_test_1.expect)(resJson.message).toBe("Fail: ParameterError");
            (0, bun_test_1.expect)(resJson.info).toBe("Invalid input for request parameter /:id. Expected a number");
        }));
    });
});
