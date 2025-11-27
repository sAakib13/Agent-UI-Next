import { NextResponse } from "next/server";

const SYMBIOSIS_API_URL =
  "https://agentapi.symbiosis.solutions/api/v1/qr_codes";
// Use the key from env or fallback to the one provided in your curl example for testing
const API_KEY =
  process.env.SYMBIOSIS_API_KEY ||
  "V3Uzbiuhx1893871928798x38127x3987x8937b8937xb219837xb98";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, agentName, triggerCode } = body;

    // Validate inputs
    if (!agentId || !agentName) {
      return NextResponse.json(
        { success: false, error: "Agent ID and Name are required" },
        { status: 400 }
      );
    }

    // Call Symbiosis API
    const externalResponse = await fetch(SYMBIOSIS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "api-key": API_KEY, // Correct header name based on your curl
      },
      body: JSON.stringify({
        agent_id: agentId,
        agent_name: agentName,
        trigger_code: triggerCode || "START", // Provide default if missing
      }),
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error("Symbiosis API Error Body:", errorText);
      throw new Error(
        `Symbiosis API Error: ${externalResponse.status} ${errorText}`
      );
    }

    const data = await externalResponse.json();

    return NextResponse.json({
      success: true,
      // The API returns 'qr_image_base64' based on the schema
      qrCodeUrl: data.qr_image_base64
        ? `data:image/png;base64,${data.qr_image_base64}`
        : null,
    });
  } catch (error: any) {
    console.error("QR Integration Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate QR Code",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
