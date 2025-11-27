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

// 1. Update Schema to include qr_code
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
    qr_code TEXT,
    urls JSONB DEFAULT '[]'::jsonb,
    document_refs JSONB DEFAULT '[]'::jsonb,
    actions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

// 2. Migration Helper: Check for qr_code column
const MIGRATE_COLUMNS_QUERY = `
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='trigger_code') THEN ALTER TABLE agentstudio.agents ADD COLUMN trigger_code VARCHAR(100); END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='business_name') THEN ALTER TABLE agentstudio.agents ADD COLUMN business_name VARCHAR(255); END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='industry') THEN ALTER TABLE agentstudio.agents ADD COLUMN industry VARCHAR(100); END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='short_description') THEN ALTER TABLE agentstudio.agents ADD COLUMN short_description TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='business_url') THEN ALTER TABLE agentstudio.agents ADD COLUMN business_url TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='language') THEN ALTER TABLE agentstudio.agents ADD COLUMN language VARCHAR(50); END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='tone') THEN ALTER TABLE agentstudio.agents ADD COLUMN tone VARCHAR(50); END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='document_refs') THEN ALTER TABLE agentstudio.agents ADD COLUMN document_refs JSONB DEFAULT '[]'::jsonb; END IF;
    -- NEW: Add qr_code column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='agentstudio' AND table_name='agents' AND column_name='qr_code') THEN ALTER TABLE agentstudio.agents ADD COLUMN qr_code TEXT; END IF;
  END $$;
`;

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    await client.query(CREATE_TABLE_QUERY);
    await client.query(MIGRATE_COLUMNS_QUERY);
    const result = await client.query(
      "SELECT * FROM agentstudio.agents ORDER BY updated_at DESC"
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Database Error", details: error.message },
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

    // Destructure qrCode from body
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
      documentRefs,
      status,
      possibleActions,
      qrCode,
    } = body;

    client = await pool.connect();
    await client.query(CREATE_TABLE_QUERY);
    await client.query(MIGRATE_COLUMNS_QUERY);

    const queryText = `
      INSERT INTO agentstudio.agents (
        id, name, trigger_code, business_name, industry, short_description, business_url, 
        language, tone, persona, task, status, qr_code, urls, document_refs, actions, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
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
          qr_code = EXCLUDED.qr_code,
          urls = $14, 
          document_refs = $15,
          actions = $16,
          updated_at = NOW()
      RETURNING *;
    `;

    // Map values ($13 is qrCode)
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
      qrCode || null, // Pass the base64 string here
      JSON.stringify(urls || []),
      JSON.stringify(documentRefs || []),
      JSON.stringify(possibleActions || {}),
    ];

    const result = await client.query(queryText, values);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Database Operation Error:", error);
    return NextResponse.json(
      { success: false, error: "Database Error", details: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
