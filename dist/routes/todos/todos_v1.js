"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoRouter = void 0;
const express_1 = require("express");
const todoController_1 = require("../../controllers/todoController");
const todoRouter = (0, express_1.Router)();
exports.todoRouter = todoRouter;
todoRouter.post("/", todoController_1.createToDoItem);
todoRouter.get("/", todoController_1.getAllToDoItems);
todoRouter.get("/:id", todoController_1.getToDoItem);
todoRouter.put("/:id", todoController_1.updateToDoItem);
todoRouter.delete("/:id", todoController_1.deleteToDoItem);
todoRouter.use((req, res) => {
    res.status(406).json({ message: "Method Not Acceptable" });
});
