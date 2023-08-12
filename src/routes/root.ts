import { getRoot } from "../controllers/root";
import { Router } from "express";

export const router = Router();

router.get("/", getRoot);

export default router;
