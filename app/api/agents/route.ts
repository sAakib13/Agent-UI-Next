import { NextResponse } from "next/server";
import { Agent } from "../../../types/model";
import { db } from "../../../lib/db";

// --- GET Handler (Fetches Agents + Org Info) ---
export async function GET(request: Request) {
  try {
    // Ideally, get organization_id from the authenticated user's session
    const organizationId = "...get-from-session...";

    const result = await db.query(
      `SELECT * FROM agents WHERE organization_id = $1`,
      [organizationId]
    );

    const agents: Agent[] = result.rows;
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
// --- POST Handler (Transactional Upsert) ---
// POST: Create a new agent
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      organization_id,
      name,
      language,
      tone,
      persona_prompt,
      task_prompt,
      trigger_code,
      allowed_actions,
    } = body;

    // Insert into your Fixed Schema
    const result = await db.query(
      `INSERT INTO agents (
         organization_id, name, language, tone, 
         persona_prompt, task_prompt, trigger_code, allowed_actions
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        organization_id,
        name,
        language,
        tone,
        persona_prompt,
        task_prompt,
        trigger_code,
        JSON.stringify(allowed_actions),
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
