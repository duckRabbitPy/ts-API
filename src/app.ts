import express, { NextFunction } from "express";
import { todoRouter } from "./routes/todos";

import { json } from "body-parser";

const app = express();

//use body parser as middleware in express app
app.use(json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("This is the root route.");
});

app.use("/todos", todoRouter);

//error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) => {
    res.status(500).json({ message: err.message });
  }
);
console.log("listening on 3000");
app.listen(3000);
