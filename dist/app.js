"use strict";
//SET-UP
//npm install typescript
//npm install @types/node
//npm install @types/express
//npx tsc --init
//npx tsc - w
//Use insomnia to test http requests
//http://localhost:3000/todos
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Tsconfig
// {
//     "compilerOptions": {
//       "target": "es2018",
//       "module": "commonjs",
//       "moduleResolution": "node",
//       "outDir": "./dist",
//       "rootDir": "./src",
//       "strict": true,
//       "esModuleInterop": true,
//       "forceConsistentCasingInFileNames": true
//     }
//   }
const express_1 = __importDefault(require("express"));
const todos_1 = __importDefault(require("./routes/todos"));
const body_parser_1 = require("body-parser");
const app = (0, express_1.default)();
//use body parser as middleware in express app
app.use((0, body_parser_1.json)());
app.use("/todos", todos_1.default);
//error handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
app.listen(3000);
