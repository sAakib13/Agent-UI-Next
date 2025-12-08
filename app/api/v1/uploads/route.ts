import { NextResponse } from "next/server";

const SYM_API_BASE = process.env.SYM_API_BASE || "https://agentapi.symbiosis.solutions";

export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split("/").filter(Boolean);
    // Expect path like /api/v1/uploads/{agent_id}
    const agentId = parts[parts.length - 1];

    if (!agentId) {
      return NextResponse.json({ success: false, error: "agent_id path parameter is required" }, { status: 400 });
    }

    const apiKey = req.headers.get("api-key") || req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Missing api-key header" }, { status: 401 });
    }

    const targetUrl = `${SYM_API_BASE}/api/v1/uploads/${(agentId)}`;

    const proxied = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
      },
    });

    const data = await proxied.json().catch(() => null);

    if (!proxied.ok) {
      return NextResponse.json({ success: false, error: data?.error || `Request failed`, details: data }, { status: proxied.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Uploads v1 GET proxy error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
