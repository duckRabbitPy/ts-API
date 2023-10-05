import { Router } from "express";
import {
  createToDoItem,
  deleteToDoItem,
  getAllToDoItems,
  getToDoItem,
  updateToDoItem,
} from "../../controllers/todoController";

const todoRouter = Router();

todoRouter.post("/", createToDoItem);

todoRouter.get("/", getAllToDoItems);

todoRouter.get("/:id", getToDoItem);

todoRouter.put("/:id", updateToDoItem);

todoRouter.delete("/:id", deleteToDoItem);

todoRouter.use((req, res) => {
  res.status(406).json({ message: "Method Not Acceptable" });
});

export { todoRouter };
