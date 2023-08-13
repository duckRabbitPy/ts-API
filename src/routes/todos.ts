import { Router } from "express";
import {
  createToDo,
  getToDo,
  updateToDo,
  deleteToDo,
} from "../controllers/todos";

const todoRouter = Router();

todoRouter.post("/", createToDo);

todoRouter.get("/", getToDo);

todoRouter.patch("/:id", updateToDo);

todoRouter.delete("/:id", deleteToDo);

export { todoRouter };
