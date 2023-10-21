"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoRouter = void 0;
const express_1 = require("express");
const requestHandlers_1 = require("../../controllers/todos/requestHandlers");
const todoRouter = (0, express_1.Router)();
exports.todoRouter = todoRouter;
todoRouter.post("/", requestHandlers_1.createToDoItem);
todoRouter.get("/", requestHandlers_1.getAllToDoItems);
todoRouter.get("/:id", requestHandlers_1.getToDoItem);
todoRouter.put("/:id", requestHandlers_1.updateToDoItem);
todoRouter.delete("/:id", requestHandlers_1.deleteToDoItem);
todoRouter.use((req, res) => {
    res.status(406).json({ message: "Method Not Acceptable" });
});
