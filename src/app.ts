//SET-UP
//npm install typescript
//npm install @types/node
//npm install @types/express
//npx tsc --init
//npx tsc - w
//Use insomnia to test http requests
//http://localhost:3000/todos

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

import express, { NextFunction } from "express";
import { todoRouter } from "./routes/todos";

import { json } from "body-parser";

const app = express();

//use body parser as middleware in express app
app.use(json());

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
