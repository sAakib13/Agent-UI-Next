import { NextResponse } from "next/server";

const SYM_API_BASE =
  process.env.SYM_API_BASE || "https://agentapi.symbiosis.solutions";
const SYM_UPLOAD_TOKEN = process.env.SYMBIOSIS_API_KEY || "";

// Max 10MB pdf (adjust if needed)
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  if (!SYM_UPLOAD_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Missing SYMBIOSIS_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const agentId = form.get("agent_id");
    const organizationId = form.get("organization_id");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "file is required" },
        { status: 400 }
      );
    }
    if (!agentId || !organizationId) {
      return NextResponse.json(
        { success: false, error: "agent_id and organization_id are required" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Forward to Symbiosis upload API
    const outbound = new FormData();
    outbound.append("file", file);
    outbound.append("agent_id", String(agentId));
    outbound.append("organization_id", String(organizationId));

    const uploadRes = await fetch(`${SYM_API_BASE}/api/vi/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SYM_UPLOAD_TOKEN}`,
      },
      body: outbound,
    });

    const data = await uploadRes.json().catch(() => null);

    if (!uploadRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.error || `Upload failed with ${uploadRes.status}`,
          details: data,
        },
        { status: uploadRes.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Unexpected error during upload" },
      { status: 500 }
    );
  }
}

