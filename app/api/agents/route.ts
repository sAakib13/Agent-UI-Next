import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: "52.186.169.156",
  port: 5432,
  database: "db_sbdev",
  user: "sb_devs",
  password: "eBNW[9PThcFg65Q",
});

// --- GET Handler (Fetches Agents + Org Info) ---
export async function GET() {
  let client;
  try {
    client = await pool.connect();

    // Join agents with organizations to return full view
    const query = `
      SELECT 
        a.*, 
        o.name as business_name, 
        o.industry, 
        o.short_description, 
        o.website as business_url 
      FROM agentstudio.agents a
      JOIN agentstudio.organizations o ON a.organization_id = o.id
      ORDER BY a.updated_at DESC
    `;

    const result = await client.query(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

// --- POST Handler (Transactional Upsert) ---
export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();

    const {
      id, // Agent ID from frontend
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

    // Start Transaction
    await client.query("BEGIN");

    // 1. Upsert Organization
    const orgQuery = `
      INSERT INTO agentstudio.organizations (name, website, industry, short_description, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (name) DO UPDATE 
      SET website = EXCLUDED.website,
          industry = EXCLUDED.industry,
          short_description = EXCLUDED.short_description,
          updated_at = NOW()
      RETURNING id;
    `;

    const orgValues = [businessName, businessURL, industry, shortDescription];
    const orgResult = await client.query(orgQuery, orgValues);
    const organizationId = orgResult.rows[0].id;

    // 2. Upsert Agent linked to Organization
    const agentQuery = `
      INSERT INTO agentstudio.agents (
        id, organization_id, name, language, tone, persona_prompt, task_prompt, 
        trigger_code, allowed_actions, qr_code_base64, status, urls, document_refs, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (name) DO UPDATE 
      SET 
          organization_id = EXCLUDED.organization_id,
          language = EXCLUDED.language,
          tone = EXCLUDED.tone,
          persona_prompt = EXCLUDED.persona_prompt,
          task_prompt = EXCLUDED.task_prompt,
          trigger_code = EXCLUDED.trigger_code,
          allowed_actions = EXCLUDED.allowed_actions,
          qr_code_base64 = EXCLUDED.qr_code_base64,
          status = EXCLUDED.status,
          urls = EXCLUDED.urls,
          document_refs = EXCLUDED.document_refs,
          updated_at = NOW()
      RETURNING *;
    `;

    const agentValues = [
      id, // Keep ID consistent from frontend if provided
      organizationId,
      agentName,
      language,
      tone,
      persona,
      task,
      triggerCode,
      JSON.stringify(possibleActions || {}), // Maps to allowed_actions
      qrCode,
      status || "Training",
      JSON.stringify(urls || []),
      JSON.stringify(documentRefs || []),
    ];

    const agentResult = await client.query(agentQuery, agentValues);

    // Commit Transaction
    await client.query("COMMIT");

    return NextResponse.json({ success: true, data: agentResult.rows[0] });
  } catch (error: any) {
    if (client) await client.query("ROLLBACK"); // Rollback on error
    console.error("Database Transaction Error:", error);
    return NextResponse.json(
      { success: false, error: "Transaction Failed", details: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
