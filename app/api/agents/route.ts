import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { Organization, CreateAgentDTO, Agent } from "../../../types/model";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const agentSchema = z.object({
  name: z.string().min(1),
  language: z.string().min(1),
  tone: z.string().min(1),
  persona_prompt: z.string().optional().default(""),
  task_prompt: z.string().optional().default(""),
  trigger_code: z.string().optional().default(""),
  allowed_actions: z.array(z.string()).optional().default([]),
  // Added these to match your DB Schema
  qr_code_base64: z.string().optional().nullable(),
  greeting_message: z.string().optional().nullable(),
});

const organizationSchema = z.object({
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

// --- GET Handler (Fetches Agents + Org Info) ---
export async function GET(request: Request) {
  try {
    // Ideally, get organization_id from the authenticated user's session
    const organizationId = uuidv4();

    const result = await db.query(`SELECT * FROM agents`, [organizationId]);

    const agents: Agent[] = result.rows;
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { organization, agents } = parsed.data;

    // Begin transaction
    await db.query("BEGIN");

    // Generate UUID for organization
    const organizationId = uuidv4();

    // Insert organization
    const orgResult = await db.query(
      `INSERT INTO organizations (
         id, name, website, industry, short_description, is_active, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
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

    // Insert agents
    const insertedAgents = [];
    for (const agent of agents) {
      const result = await db.query(
        `INSERT INTO agents (
           organization_id, name, language, tone, 
           persona_prompt, task_prompt, trigger_code, allowed_actions
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          organizationId,
          agent.name,
          agent.language,
          agent.tone,
          agent.persona_prompt,
          agent.task_prompt,
          agent.trigger_code,
          JSON.stringify(agent.allowed_actions),
        ]
      );
      insertedAgents.push(result.rows[0]);
    }

    // Commit transaction
    await db.query("COMMIT");

    return NextResponse.json(
      { organization: newOrg, agents: insertedAgents },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");
    return NextResponse.json(
      { error: "Failed to create organization and agents" },
      { status: 500 }
    );
  }
}
