import { pool } from "./connection";

export const SEED_VALUES = {
  todos: [
    {
      id: 1,
      text: "Buy groceries",
      updated_at: "2023-09-30T16:26:51.041Z",
    },
    {
      id: 2,
      text: "Walk the dog",
      updated_at: "2023-09-30T16:26:51.044Z",
    },
    {
      id: 3,
      text: "Complete the task",
      updated_at: "2023-09-30T16:26:51.044Z",
    },
    {
      id: 4,
      text: "Go for run",
      updated_at: "2023-09-30T16:26:57.956Z",
    },
    {
      id: 5,
      text: "Do the laundry",
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
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

    for (const item of SEED_VALUES.todos) {
      const { id, text, updated_at } = item;
      await client.query(
        `INSERT INTO todos (id, text, updated_at)
          VALUES ($1, $2, $3)
          `,
        [id, text, updated_at]
      );
    }
  } catch (error) {
    console.error("Error resetting and seeding the database:", error);
  } finally {
    client.release();
  }
};
