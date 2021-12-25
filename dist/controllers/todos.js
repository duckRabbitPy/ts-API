"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteToDo = exports.updateToDo = exports.getToDo = exports.createToDo = void 0;
const todos_1 = __importDefault(require("../models/todos"));
const TODOs = [];
const createToDo = (req, res, next) => {
    const text = req.body.text;
    const newToDo = new todos_1.default(Math.random().toString().slice(0, 3), text);
    TODOs.push(newToDo);
    res.status(201).json({ message: "created Todo", newToDo: newToDo });
};
exports.createToDo = createToDo;
const getToDo = (req, res, next) => {
    res.json({ todos: TODOs });
};
exports.getToDo = getToDo;
const updateToDo = (req, res, next) => {
    const todoID = req.params.id;
    const updatedText = req.body.text;
    const todoIndex = TODOs.findIndex((elem) => todoID === elem.id);
    if (todoIndex < 0) {
        throw new Error("Could not foind todo");
    }
    TODOs[todoIndex] = new todos_1.default(TODOs[todoIndex].id, updatedText);
    res.json({ message: "Updated todo!", updatedToDo: TODOs[todoIndex] });
};
exports.updateToDo = updateToDo;
const deleteToDo = (req, res, next) => {
    const todoID = req.params.id;
    const todoIndex = TODOs.findIndex((elem) => todoID === elem.id);
    if (todoIndex < 0) {
        throw new Error("Could not foind todo");
    }
    TODOs.slice(todoIndex, 1);
    res.json({ message: "Deleted todo!", TODOs });
};
exports.deleteToDo = deleteToDo;
