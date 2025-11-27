"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface AgentQRProps {
  agentId: string;
  agentName: string; // Added required prop
  triggerCode?: string;
  className?: string;
}

export const AgentQR: React.FC<AgentQRProps> = ({
  agentId,
  agentName,
  triggerCode,
  className,
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQR = async () => {
    // Basic validation to prevent calling with invalid mock IDs like "1" or "agent-001"
    // UUID regex check (simple version)
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        agentId
      );

    if (!isUUID) {
      // Don't attempt fetch if ID isn't a valid UUID (avoids 422 error loop)
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, agentName, triggerCode }),
      });
      const data = await res.json();

      if (data.success && data.qrCodeUrl) {
        setQrUrl(data.qrCodeUrl);
      } else {
        setError(data.details || "Failed to load");
      }
    } catch (err) {
      console.error(err);
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId && agentName) fetchQR();
  }, [agentId, agentName]);

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      {loading ? (
        <div className="h-48 w-48 flex items-center justify-center text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="h-48 w-48 flex flex-col items-center justify-center text-gray-400">
          <AlertCircle className="w-10 h-10 mb-2 opacity-50 text-red-400" />
          <span className="text-xs text-center mb-2 px-2 text-red-400">
            {error}
          </span>
          <button
            onClick={fetchQR}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : qrUrl ? (
        <div className="relative group">
          <img
            src={qrUrl}
            alt="Agent WhatsApp QR"
            className="h-48 w-48 object-contain rounded-lg"
          />
          <a
            href={qrUrl}
            download={`agent-${agentName}-qr.png`}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium rounded-lg transition-opacity"
          >
            Download
          </a>
        </div>
      ) : (
        <div className="h-48 w-48 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg text-center p-4">
          <QrCode className="w-12 h-12 text-gray-300 mb-2" />
          <span className="text-xs text-gray-400">
            QR not available for this ID
          </span>
        </div>
      )}

      <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
        Scan to test on WhatsApp
      </p>
    </div>
  );
};
