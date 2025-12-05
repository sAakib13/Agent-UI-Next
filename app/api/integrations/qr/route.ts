import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

// Configuration for the external Symbiosis API
const SYMBIOSIS_API_URL =
  "https://agentapi.symbiosis.solutions/api/v1/qr_codes";
const API_KEY = process.env.SYMBIOSIS_API_KEY || "";

interface QRRequest {
  agentId: string;
  agentName: string;
  businessName?: string; // Added to support the logic
  triggerCode?: string;
}

export async function POST(req: Request) {
  try {
    const body: QRRequest = await req.json();
    const { agentId, agentName, businessName, triggerCode } = body;

    // 1. Validate critical identifiers
    if (!agentId || !agentName) {
      return NextResponse.json(
        { success: false, message: "Agent ID and Name are required" },
        { status: 400 }
      );
    }

    // 2. INTELLIGENT TRIGGER CODE LOGIC
    // The user requirement: "Snap that Business name first word into it with caps"
    // We default to "START" only if all else fails.
    let finalTriggerCode = "START";

    // Check if we have a valid custom trigger code (ignoring the default "START" if passed)
    if (triggerCode && triggerCode.trim() !== "" && triggerCode !== "START") {
      finalTriggerCode = triggerCode.toUpperCase();
    }
    // If not, apply the "First Word of Business Name" logic
    else if (businessName) {
      // Split by space, take the first element, remove non-alphanumeric chars if needed, and uppercase
      const firstWord = businessName.trim().split(/\s+/)[0];
      if (firstWord) {
        finalTriggerCode = firstWord.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      }
    }

    // 3. Configure HTTPS Agent to ignore SSL errors (specific to Symbiosis requirement)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    // 4. Call Symbiosis API
    const response = await axios.post(
      SYMBIOSIS_API_URL,
      {
        agent_id: agentId,
        agent_name: agentName,
        trigger_code: finalTriggerCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "api-key": API_KEY,
        },
        httpsAgent: httpsAgent,
      }
    );

    const data = response.data;

    // 5. Return the result
    return NextResponse.json({
      success: true,
      qrCodeUrl: data.qr_image_base64
        ? `data:image/png;base64,${data.qr_image_base64}`
        : null,
      message: `QR generated with trigger: ${finalTriggerCode}`,
      usedTriggerCode: finalTriggerCode, // Returning this so frontend knows what was used
    });
  } catch (error: any) {
    console.error("QR Integration Error:", error.message);

    if (axios.isAxiosError(error)) {
      console.error("Symbiosis API Response:", error.response?.data);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate QR Code via External API",
          details: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
