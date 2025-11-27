import { NextResponse } from "next/server";

// Configuration for the Symbiosis API
const SYMBIOSIS_API_URL = process.env.SYMBIOSIS_API_URL_QR;
const API_KEY = process.env.SYMBIOSIS_API_KEY; // Store this in your .env.local file

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, triggerCode } = body;

    // Validate input
    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!SYMBIOSIS_API_URL) {
      return NextResponse.json(
        { success: false, error: "Symbiosis API URL is not configured" },
        { status: 500 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { success: false, error: "Symbiosis API Key is not configured" },
        { status: 500 }
      );
    }

    // Call the Third-Party API
    // Note: Adjust the payload structure ({ agent_id, ... }) based on Symbiosis API docs
    const externalResponse = await fetch(SYMBIOSIS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`, // Or 'x-api-key': API_KEY depending on their docs
      },
      body: JSON.stringify({
        agent_id: agentId,
        trigger_code: triggerCode,
        // Add other required fields here
      }),
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      throw new Error(
        `Symbiosis API Error: ${externalResponse.status} ${errorText}`
      );
    }

    // Assume the API returns JSON with a 'qr_image_url' or base64 string
    const data = await externalResponse.json();

    return NextResponse.json({
      success: true,
      qrCodeUrl: data.url || data.qr_code || data.image_url, // Adjust based on actual response
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
