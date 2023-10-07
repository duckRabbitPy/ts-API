"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const todos_v1_1 = require("./routes/todos/todos_v1");
const body_parser_1 = require("body-parser");
const middleware_1 = require("./routes/middleware");
process.env.TZ = "UTC";
const app = (0, express_1.default)();
//use body parser as middleware in express app
app.use((0, body_parser_1.json)());
app.use(express_1.default.urlencoded({ extended: true }));
//error handling middleware for all routes
app.use("/api-v1", middleware_1.apiKeyMiddleware);
app.get("/", (req, res) => {
    res.send("This is the root route. See documentation for available endpoints");
});
app.use("/api-v1/todos", todos_v1_1.todoRouter);
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
console.log("listening on 3000");
app.listen(3000);
