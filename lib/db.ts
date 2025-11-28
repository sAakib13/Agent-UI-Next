import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || "5432"),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

export const db = {
  query: async (text: string, params?: any[]) => {
    const client = await pool.connect();
    try {
      // Set the search path for this session
      await client.query(
        `SET search_path TO ${process.env.PG_SCHEMA || "public"}`
      );
      return await client.query(text, params);
    } finally {
      client.release();
    }
  },
};
