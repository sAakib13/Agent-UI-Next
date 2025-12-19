import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { createClient } from "../../../../utils/supabase/server";

export async function GET(request: Request, context: { params: any }) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // `context.params` may be a Promise in some Next.js typings; resolve safely
  const resolvedParams = await Promise.resolve(context?.params);
  const id =
    resolvedParams?.id || new URL(request.url).pathname.split("/").pop();
  try {
    const result = await db.query(
      `SELECT 
        a.id, a.name AS agent_name, a.trigger_code, a.updated_at, a.language, a.tone,
        a.status, a.persona_prompt, a.task_prompt, a.allowed_actions AS actions, a.qr_code_base64, a.greeting_message,
        a.document_refs, a.source_urls, a.model_config,
        o.name AS business_name, o.industry, o.short_description, o.website AS business_url
      FROM agents a
      JOIN organizations o ON a.organization_id = o.id
      WHERE a.id = $1
      LIMIT 1`,
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("--- FETCH AGENT BY ID FAILED ---", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
