import { Request } from "express";
import { parseNumericalFilter } from "./numericalFilter";
import { parseStringFilter } from "./stringFilter";

export const parseColon = (filterString: string): [string, string] => {
  if (filterString.includes(":")) {
    return [filterString.split(":")[0], filterString.split(":")[1]];
  }
  return ["eq", filterString];
};

export const getFilterParamsFromRequest = (req: Request) => {
  return {
    id: parseNumericalFilter(req.query?.id),
    text: parseStringFilter(req.query?.text),
  };
};
