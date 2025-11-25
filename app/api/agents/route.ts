import { NextResponse } from "next/server";
import { Pool } from "pg";

// Configure the Postgres connection pool with your credentials
const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// SQL statement to create the table if it does not exist
// We use JSONB for flexible storage of arrays (urls) and objects (actions)
const CREATE_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS agentstudio.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    persona TEXT,
    task TEXT,
    status VARCHAR(50) DEFAULT 'Training',
    urls JSONB DEFAULT '[]'::jsonb,
    actions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();

    // Destructure the agent configuration from the request body
    const { agentName, persona, task, urls, status, possibleActions } = body;

    client = await pool.connect();

    // 1. Ensure the table exists
    // This will execute the CREATE TABLE IF NOT EXISTS query
    await client.query(CREATE_TABLE_QUERY);

    // 2. Perform INSERT or UPDATE operation
    const queryText = `
      INSERT INTO ${process.env.PG_SCHEMA}.${process.env.PG_TABLE} (name, persona, task, status, urls, actions, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (name) DO UPDATE 
      SET persona = EXCLUDED.persona, 
          task = EXCLUDED.task,
          status = EXCLUDED.status,
          urls = $5, 
          actions = $6,
          updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      agentName,
      persona,
      task,
      status || "Training",
      JSON.stringify(urls || []), // Ensure it's a valid JSON string
      JSON.stringify(possibleActions || {}), // Ensure it's a valid JSON string
    ];

    const result = await client.query(queryText, values);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Database Operation Error:", error);
    // You might also get errors here if the schema 'agentstudio' doesn't exist.
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request or save to database.",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
