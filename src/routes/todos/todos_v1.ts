import { Router } from "express";
import {
  createToDo,
  deleteToDo,
  getAllToDos,
  getToDo,
  updateToDo,
} from "../../controllers/todos/todos";

const todoRouter = Router();

todoRouter.post("/", createToDo);

todoRouter.get("/", getAllToDos);

todoRouter.get("/:id", getToDo);

todoRouter.patch("/:id", updateToDo);

todoRouter.delete("/:id", deleteToDo);

export { todoRouter };
