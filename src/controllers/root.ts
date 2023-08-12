import { RequestHandler } from "express";

export const getRoot: RequestHandler = (req, res, next) => {
  res.json("welcome to Effect API current routes avaiable for query: /todo");
};
