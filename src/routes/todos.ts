import { Router } from "express";
import {
  createToDo,
  getToDo,
  updateToDo,
  deleteToDo,
} from "../controllers/todos";
import { router } from "./root";

router.post("/", createToDo);

router.get("/", getToDo);

router.patch("/:id", updateToDo);

router.delete("/:id", deleteToDo);

export default router;
