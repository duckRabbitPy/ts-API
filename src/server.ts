import express from "express";
import { todoRouter as todoRouterV1 } from "./routes/todos/todos_v1";
import { json } from "body-parser";
import { apiKeyMiddleware } from "./routes/middleware";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env?.PORT || 3000;

const server = express();

server.use(json());
server.use(express.urlencoded({ extended: true }));

server.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "../docs/api-v1/index.html"));
});

server.get("/docs/api-v1/open-api.yaml", (_, res) => {
  res.sendFile(path.join(__dirname, "../docs/api-v1/open-api.yaml"));
});

server.use("/api-v1", apiKeyMiddleware);
server.use("/api-v1/todos", todoRouterV1);

console.log("\x1b[42m", `listening on port ${PORT}`, "\x1b[0m");

server.listen(PORT);
