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
import rootRoute from "./routes/root";
import todoRoutes from "./routes/todos";

import { json } from "body-parser";

const app = express();

//use body parser as middleware in express app
app.use(json());

app.use("/", rootRoute);

app.use("/todos", todoRoutes);

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
