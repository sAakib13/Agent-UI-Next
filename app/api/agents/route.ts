import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// --- Validation Schemas ---

const agentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  language: z.string().min(1),
  tone: z.string().min(1),
  status: z.string().optional().default("Training"),
  persona_prompt: z.string().optional().default(""),
  task_prompt: z.string().optional().default(""),
  trigger_code: z.string().optional().default(""),
  allowed_actions: z.array(z.string()).optional().default([]),
  qr_code_base64: z.string().optional().nullable(),
  greeting_message: z.string().optional().nullable(),
  document_refs: z.array(z.string()).optional().default([]),
  source_urls: z.array(z.string()).optional().default([]),
  model_config: z
    .object({
      model: z.string().optional().nullable(),
      route: z.string().optional().nullable(),
    })
    .optional()
    .default({}),
});

const organizationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  website: z.string().optional().nullable(),
  industry: z.string().optional(),
  short_description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});

const bodySchema = z.object({
  organization: organizationSchema,
  agents: z.array(agentSchema).min(1, "At least one agent is required"),
});

// --- API Route Handlers ---

// GET: Fetch all agents (Superadmin View)
export async function GET(_request: Request) {
  try {
    const result = await db.query(`
      SELECT 
        a.id, a.name AS agent_name, a.trigger_code, a.updated_at, a.language, a.tone,
        a.status, a.persona_prompt, a.task_prompt, a.allowed_actions AS actions, a.qr_code_base64, a.greeting_message,
        a.document_refs, a.source_urls, a.model_config,
        o.name AS business_name, o.industry, o.short_description, o.website AS business_url
      FROM agents a
      JOIN organizations o ON a.organization_id = o.id
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("--- SUPERADMIN AGENT FETCH FAILED ---");
    console.error("FULL DATABASE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Server error during agent aggregation. Check database connection and schema.",
      },
      { status: 500 }
    );
  }
}

// POST: Create Organization + Agents
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate request body
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { organization, agents } = parsed.data;

    // 2. Begin transaction
    await db.query("BEGIN");

    // 2a. Ensure optional columns exist
    await db.query(
      "ALTER TABLE agents ADD COLUMN IF NOT EXISTS allowed_actions JSONB DEFAULT '[]'::jsonb"
    );
    await db.query(
      "ALTER TABLE agents ADD COLUMN IF NOT EXISTS document_refs JSONB DEFAULT '[]'::jsonb"
    );
    await db.query(
      "ALTER TABLE agents ADD COLUMN IF NOT EXISTS source_urls JSONB DEFAULT '[]'::jsonb"
    );
    await db.query(
      "ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_config JSONB DEFAULT '{}'::jsonb"
    );

    // 3. Insert Organization
    const organizationId = organization.id ?? uuidv4();
    const orgResult = await db.query(
      `INSERT INTO organizations (
         id, name, website, industry, short_description, is_active, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        organizationId,
        organization.name,
        organization.website || null,
        organization.industry || null,
        organization.short_description || null,
        organization.is_active,
      ]
    );

    const newOrg = orgResult.rows[0];

    // 4. Insert Agents
    const insertedAgents = [];
    for (const agent of agents) {
      const agentId = agent.id ?? uuidv4();
      // NOTE: allowed_actions now includes both possibleActions and features (all combined)
      const result = await db.query(
        `INSERT INTO agents (
           id, organization_id, name, language, tone, status,
           persona_prompt, task_prompt, trigger_code, allowed_actions,
           greeting_message, qr_code_base64, document_refs, source_urls, model_config
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [
          agentId, // $1
          organizationId, // $2
          agent.name, // $3
          agent.language, // $4
          agent.tone, // $5
          agent.status || "Training", // $6
          agent.persona_prompt, // $7
          agent.task_prompt, // $8
          agent.trigger_code, // $9
          JSON.stringify(agent.allowed_actions), // $10
          agent.greeting_message || null, // $11
          agent.qr_code_base64 || null, // $12
          JSON.stringify(agent.document_refs || []), // $13
          JSON.stringify(agent.source_urls || []), // $14
          JSON.stringify(agent.model_config || {}), // $15
        ]
      );
      insertedAgents.push(result.rows[0]);
    }

    // 5. Commit transaction
    await db.query("COMMIT");

    return NextResponse.json(
      { organization: newOrg, agents: insertedAgents },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("--- CREATE AGENT FAILED ---");
    console.error(error);

    // Ensure we rollback so we don't leave partial data or locked rows
    await db.query("ROLLBACK");

    return NextResponse.json(
      {
        error: "Failed to create organization and agents",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
