import express from "express";
import { todoRouter as todoRouterV1 } from "./routes/todos/todos_v1";

import { json } from "body-parser";
import { apiKeyMiddleware } from "./routes/middleware";

process.env.TZ = "UTC";

const app = express();

//use body parser as middleware in express app
app.use(json());
app.use(express.urlencoded({ extended: true }));

//error handling middleware for all routes
app.use("/api-v1", apiKeyMiddleware);

app.get("/", (req, res) => {
  res.send("This is the root route. See documentation for available endpoints");
});

app.use("/api-v1/todos", todoRouterV1);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(500).json({ message: err.message });
  }
);

console.log("listening on 3000");
app.listen(3000);
