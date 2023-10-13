import { pool } from "./connection";

export const TODO_SEED_VALUES = {
  todos: [
    {
      id: 1,
      text: "Buy groceries",
      completed: false,
      updated_at: "2023-09-30T16:26:51.041Z",
    },
    {
      id: 2,
      text: "Walk the dog",
      completed: true,
      updated_at: "2023-09-30T16:26:51.044Z",
    },
    {
      id: 3,
      text: "Complete the task",
      completed: false,
      updated_at: "2023-09-30T16:26:51.044Z",
    },
    {
      id: 4,
      text: "Go for run",
      completed: true,
      updated_at: "2023-09-30T16:26:57.956Z",
    },
    {
      id: 5,
      text: "Do the laundry",
      completed: false,
      updated_at: "2023-09-30T16:26:57.956Z",
    },
  ],
};

export const resetAndSeedDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query("DROP TABLE IF EXISTS todos");

    await client.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id serial PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW(),
          completed BOOLEAN DEFAULT false
        )
      `);

    for (const item of TODO_SEED_VALUES.todos) {
      const { id, text, updated_at, completed } = item;
      await client.query(
        `INSERT INTO todos (id, text, updated_at, completed)
          VALUES ($1, $2, $3, $4)
          `,
        [id, text, updated_at, completed]
      );
    }
  } catch (error) {
    console.error("Error resetting and seeding the database:", error);
  } finally {
    client.release();
  }
};
