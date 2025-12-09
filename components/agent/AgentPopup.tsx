"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AgentQR } from "@/components/agent/AgentQR";
import { useRouter } from "next/navigation";

interface AgentData {
    id: string;
    agent_name: string;
    trigger_code: string;
    updated_at: string;
    qr_code_base64?: string | null;
}

interface AgentPopupProps {
    showPopup: boolean;
    onClose: () => void;
}


export const AgentPopup: React.FC<AgentPopupProps> = ({ showPopup, onClose }) => {
    const [latestAgent, setLatestAgent] = useState<AgentData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLatestAgent = async () => {
            try {
                const res = await fetch("/api/agents");
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    const sorted = data.data.sort(
                        (a: AgentData, b: AgentData) =>
                            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                    );
                    setLatestAgent(sorted[0] || null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (showPopup) fetchLatestAgent();
    }, [showPopup]);

    if (!showPopup) return null;

    const handleContinue = () => {
        setTimeout(() => router.push("/dashboard"), 800);
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl p-8 shadow-xl w-[400px] text-center">
                {/* Close X button */}
                <button
                    onClick={() => onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold text-lg"
                >
                    <X></X>
                </button>

                <h2 className="text-xl font-bold mb-4">Agent Deployed 🚀</h2>
                <p className="text-gray-600 mb-6">
                    Your agent is live and running.
                </p>


                {loading ? (
                    <div className="flex items-center justify-center h-48">Loading...</div>
                ) : latestAgent ? (
                    <AgentQR
                        agentId={latestAgent.id}
                        agentName={latestAgent.agent_name}
                        triggerCode={latestAgent.trigger_code}
                        initialQrCode={latestAgent.qr_code_base64 || null}
                    />
                ) : (
                    <p className="text-center text-gray-500">No agents available</p>
                )}

                <button
                    className="px-6 py-3 mt-5 bg-blue-600 text-white rounded-xl"
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>

        </div>
    );
};
