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

const SCHEMA = process.env.PG_SCHEMA || "agentstudio";
const TABLE = process.env.PG_TABLE || "agents";

// SQL statement to create the schema/table if it does not exist
const CREATE_SCHEMA_QUERY = `CREATE SCHEMA IF NOT EXISTS ${SCHEMA};`;
const CREATE_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS ${SCHEMA}.${TABLE} (
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

async function ensureTableExists(client: any) {
  await client.query(CREATE_SCHEMA_QUERY);
  await client.query(CREATE_TABLE_QUERY);
}

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    await ensureTableExists(client);

    const queryText = `SELECT id, name, persona, task, status, urls, actions, created_at, updated_at FROM ${SCHEMA}.${TABLE} ORDER BY updated_at DESC;`;
    const result = await client.query(queryText);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("GET /api/agents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agents", details: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();

    // Destructure the agent configuration from the request body
    const { agentName, persona, task, urls, status, possibleActions } = body;

    client = await pool.connect();

    // Ensure schema/table exist
    await ensureTableExists(client);

    // Insert or update
    const queryText = `
      INSERT INTO ${SCHEMA}.${TABLE} (name, persona, task, status, urls, actions, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (name) DO UPDATE 
      SET persona = EXCLUDED.persona, 
          task = EXCLUDED.task,
          status = EXCLUDED.status,
          urls = EXCLUDED.urls, 
          actions = EXCLUDED.actions,
          updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      agentName,
      persona,
      task,
      status || "Training",
      urls || [], // send as JSONB via pg driver
      possibleActions || {},
    ];

    const result = await client.query(queryText, values);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Database Operation Error:", error);
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
