"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const todos_v1_1 = require("./routes/todos/todos_v1");
const body_parser_1 = require("body-parser");
const middleware_1 = require("./routes/middleware");
const PORT = ((_a = process.env) === null || _a === void 0 ? void 0 : _a.PORT) || 3000;
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("This is the root route. See documentation for available endpoints");
});
app.use("/api-v1", middleware_1.apiKeyMiddleware);
app.use("/api-v1/todos", todos_v1_1.todoRouter);
console.log("\x1b[42m", `listening on port ${PORT}`, "\x1b[0m");
app.listen(PORT);
