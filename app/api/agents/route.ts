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
  CREATE TABLE IF NOT EXISTS agentstudio.agents (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    trigger_code VARCHAR(100),
    business_name VARCHAR(255),
    industry VARCHAR(100),
    short_description TEXT,
    business_url TEXT,
    language VARCHAR(50),
    tone VARCHAR(50),
    persona TEXT,
    task TEXT,
    status VARCHAR(50) DEFAULT 'Training',
    urls JSONB DEFAULT '[]'::jsonb,
    actions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

// 2. Migration Helper: Adds columns if they are missing (for existing tables)
const MIGRATE_COLUMNS_QUERY = `
  DO $$
  BEGIN
    -- Check and add trigger_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='trigger_code') THEN
      ALTER TABLE agentstudio.agents ADD COLUMN trigger_code VARCHAR(100);
    END IF;
    -- Check and add business_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='business_name') THEN
      ALTER TABLE agentstudio.agents ADD COLUMN business_name VARCHAR(255);
    END IF;
    -- Check and add industry
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='industry') THEN
      ALTER TABLE agentstudio.agents ADD COLUMN industry VARCHAR(100);
    END IF;
    -- Check and add short_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='short_description') THEN
      ALTER TABLE agentstudio.agents ADD COLUMN short_description TEXT;
    END IF;
    -- Check and add business_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='business_url') THEN
      ALTER TABLE agentstudio.agents ADD COLUMN business_url TEXT;
    END IF;
    -- Check and add language
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='language') THEN
      ALTER TABLE agentstudio.agents ADD COLUMN language VARCHAR(50);
    END IF;
    -- Check and add tone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='tone') THEN
      ALTER TABLE agentstudio.agents ADD COLUMN tone VARCHAR(50);
    END IF;
  END $$;
`;

// --- NEW GET FUNCTION (Fixes 405 Error) ---
export async function GET() {
  let client;
  try {
    client = await pool.connect();

    // Ensure table structure is valid before querying
    await client.query(CREATE_TABLE_QUERY);
    await client.query(MIGRATE_COLUMNS_QUERY);

    const result = await client.query(
      "SELECT * FROM agentstudio.agents ORDER BY updated_at DESC"
    );

    // The driver returns JSONB columns (urls, actions) as parsed JSON objects in Node.js,
    // so we don't need JSON.parse here, just return the rows.
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request or save to database.",
        details: error.message,
      },
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

    // Destructure ALL fields sent from the frontend
    const {
      id,
      agentName,
      triggerCode,
      businessName,
      industry,
      shortDescription,
      businessURL,
      language,
      tone,
      persona,
      task,
      urls,
      status,
      possibleActions,
    } = body;

    client = await pool.connect();

    // Ensure table exists
    await client.query(CREATE_TABLE_QUERY);
    // Ensure new columns exist
    await client.query(MIGRATE_COLUMNS_QUERY);

    // Insert or Update with all fields
    const queryText = `
      INSERT INTO agentstudio.agents (
        id, name, trigger_code, business_name, industry, short_description, business_url, 
        language, tone, persona, task, status, urls, actions, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (name) DO UPDATE 
      SET 
          trigger_code = EXCLUDED.trigger_code,
          business_name = EXCLUDED.business_name,
          industry = EXCLUDED.industry,
          short_description = EXCLUDED.short_description,
          business_url = EXCLUDED.business_url,
          language = EXCLUDED.language,
          tone = EXCLUDED.tone,
          persona = EXCLUDED.persona, 
          task = EXCLUDED.task,
          status = EXCLUDED.status,
          urls = EXCLUDED.urls, 
          actions = EXCLUDED.actions,
          updated_at = NOW()
      RETURNING *;
    `;

    // Map the values to the SQL placeholders ($1, $2, etc.)
    const values = [
      id,
      agentName,
      triggerCode,
      businessName,
      industry,
      shortDescription,
      businessURL,
      language,
      tone,
      persona,
      task,
      status || "Training",
      JSON.stringify(urls || []), // Ensure Arrays are stringified for JSONB
      JSON.stringify(possibleActions || {}), // Ensure Objects are stringified for JSONB
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
    if (client) client.release();
  }
}
