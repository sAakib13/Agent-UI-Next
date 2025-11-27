"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Loader2, RefreshCw } from "lucide-react";

interface AgentQRProps {
  agentId: string;
  triggerCode?: string;
  className?: string;
}

export const AgentQR: React.FC<AgentQRProps> = ({
  agentId,
  triggerCode,
  className,
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchQR = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/integrations/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, triggerCode }),
      });
      const data = await res.json();

      if (data.success && data.qrCodeUrl) {
        setQrUrl(data.qrCodeUrl);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    if (agentId) fetchQR();
  }, [agentId]);

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
          <QrCode className="w-12 h-12 mb-2 opacity-50" />
          <span className="text-xs text-center mb-2">Failed to load QR</span>
          <button
            onClick={fetchQR}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : qrUrl ? (
        // Display the fetched Image
        <div className="relative group">
          <img
            src={qrUrl}
            alt="Agent WhatsApp QR"
            className="h-48 w-48 object-contain rounded-lg"
          />
          {/* Optional Overlay to Download */}
          <a
            href={qrUrl}
            download="agent-qr.png"
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium rounded-lg transition-opacity"
          >
            Download
          </a>
        </div>
      ) : (
        // Fallback if no URL yet
        <div className="h-48 w-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
          <QrCode className="w-12 h-12 text-gray-300" />
        </div>
      )}

      <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
        Scan to test on WhatsApp
      </p>
    </div>
  );
};
