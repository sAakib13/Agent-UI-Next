import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const SYMBIOSIS_API_URL =
  "https://agentapi.symbiosis.solutions/api/v1/qr_codes";
const API_KEY = process.env.SYMBIOSIS_API_KEY || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, agentName, triggerCode } = body;

    // 1. Validate inputs
    if (!agentId || !agentName) {
      return NextResponse.json(
        { success: false, error: "Agent ID and Name are required" },
        { status: 400 }
      );
    }

    // 2. Configure the HTTPS Agent to ignore SSL errors
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    // 3. Call Symbiosis API using Axios
    // Axios throws an error automatically if the status is not 2xx,
    // so we catch it in the catch block below.
    const response = await axios.post(
      SYMBIOSIS_API_URL,
      {
        agent_id: agentId,
        agent_name: agentName,
        trigger_code: triggerCode || "START",
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "api-key": API_KEY,
        },
        httpsAgent: httpsAgent, // This applies the SSL fix
      }
    );

    const data = response.data;

    return NextResponse.json({
      success: true,
      qrCodeUrl: data.qr_image_base64
        ? `data:image/png;base64,${data.qr_image_base64}`
        : null,
    });
  } catch (error: any) {
    console.error("QR Integration Error:", error.message);

    // Axios specific error handling to see external API details
    if (axios.isAxiosError(error)) {
      console.error("External API Response:", error.response?.data);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate QR Code via External API",
          details: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
