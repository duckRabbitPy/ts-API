import express from "express";
import { todoRouter as todoRouterV1 } from "./routes/todos/todos_v1";
import { json } from "body-parser";
import { apiKeyMiddleware } from "./routes/middleware";
import path from "path";

const PORT = process.env?.PORT || 3000;

const app = express();

app.use(json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "/docs/index.html"));
});

app.get("/docs/api-v1.yaml", (_, res) => {
  res.sendFile(path.join(__dirname, "/docs/api-v1.yaml"));
});

app.use("/api-v1", apiKeyMiddleware);
app.use("/api-v1/todos", todoRouterV1);

console.log("\x1b[42m", `listening on port ${PORT}`, "\x1b[0m");

app.listen(PORT);
