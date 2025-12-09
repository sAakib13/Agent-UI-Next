"use client";

import React, { useEffect, useState } from "react";
import { MetricCard, ActiveAgentCard } from "@/components/ui/MetricCard";
import { AgentQR } from "@/components/agent/AgentQR";
import {
  MessageSquare,
  FileText,
  Globe,
  Users,
  User,
  Building,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

// Define the shape of the data coming from your API
interface AgentData {
  id: string;
  agent_name: string;
  trigger_code: string;
  updated_at: string;
  language: string;
  tone: string;
  business_name: string;
  industry: string;
  business_url: string;
  greeting_message?: string;
  qr_code_base64?: string;
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Data on Mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        if (!response.ok) throw new Error("Failed to fetch agents");
        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
          setAgents(json.data);
          // Set initially selected agent to the latest by updated_at
          const sorted = [...json.data].sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
          setSelectedAgent(sorted[0] ?? null);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // 2. Calculate Dynamic Metrics
  const numberOfAgents = agents.length;
  // Get unique organizations count
  const uniqueOrgs = new Set(agents.map((a) => a.business_name)).size;

  // 3. Get the "Latest" Agent
  // We sort by updated_at descending, so the first item is the newest
  const latestAgent = [...agents].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0];

  const fetchAgentById = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch agent");
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedAgent(json.data as AgentData);
      }
    } catch (err) {
      console.error("Error fetching agent by id", err);
    }
  };

  // Hardcoded mocks for metrics not yet in DB (e.g., message counts)
  const mockMetrics = {
    messagesProcessed: 14500,
    documentsUploaded: 75,
    urlsCrawled: 420,
    contacts: 12,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-10 pt-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Welcome back, here&apos;s your live overview.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Download Report
          </button>
        </div>
      </header>

      {/* Overview Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ActiveAgentCard
            status={numberOfAgents > 0 ? "Active" : "Inactive"}
            lastUpdated={
              latestAgent
                ? new Date(latestAgent.updated_at).toLocaleDateString()
                : "N/A"
            }
          />
          <MetricCard
            title="Messages Processed"
            value={mockMetrics.messagesProcessed.toLocaleString()}
            icon={MessageSquare}
            iconBgColor="text-emerald-600 dark:text-emerald-400"
          />
          <MetricCard
            title="Documents Uploaded"
            value={mockMetrics.documentsUploaded.toLocaleString()}
            icon={FileText}
            iconBgColor="text-amber-600 dark:text-amber-400"
          />
          <MetricCard
            title="URLs Crawled"
            value={mockMetrics.urlsCrawled.toLocaleString()}
            icon={Globe}
            iconBgColor="text-rose-600 dark:text-rose-400"
          />
        </div>
      </section>

      {/* Platform Stats & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Stats */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MetricCard
              title="Agents"
              value={numberOfAgents.toLocaleString()}
              icon={Users}
              iconBgColor="text-indigo-600 dark:text-indigo-400"
            />
            <MetricCard
              title="Contacts"
              value={mockMetrics.contacts.toLocaleString()}
              icon={User}
              iconBgColor="text-fuchsia-600 dark:text-fuchsia-400"
            />
            <MetricCard
              title="Organizations"
              value={uniqueOrgs.toLocaleString()}
              icon={Building}
              iconBgColor="text-cyan-600 dark:text-cyan-400"
            />
          </div>

          {/* Optional: List of Recent Agents */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mt-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Agents
            </h3>
            <div className="space-y-3">
              {agents.slice(0, 3).map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => fetchAgentById(agent.id)}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agent.agent_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {agent.business_name}
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    {agent.trigger_code}
                  </span>
                </div>
              ))}
              {agents.length === 0 && (
                <p className="text-sm text-gray-500">No agents found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel: Actions & Test */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
              <h3 className="font-bold text-lg mb-2">Deploy New Agent</h3>
              <p className="text-blue-100 text-sm mb-6">
                Create a new instance or update existing configurations
                instantly.
              </p>
              <button
                onClick={() => (window.location.href = "/create-agent")}
                className="w-full py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>Start Deployment</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Test Agent
            </h2>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-blue-900/40 dark:to-indigo-900/40 p-4 rounded-3xl text-white flex flex-col gap-4 items-center justify-between shadow-lg">
              <div>
                <p className="text-sm text-white/70 font-medium mb-1 text-center">
                  {selectedAgent?.greeting_message
                    ? selectedAgent.greeting_message
                    : "Testing Sandbox"}
                </p>
                <p className="text-xl font-bold text-center">
                  {selectedAgent ? (
                    <>
                      {selectedAgent.agent_name}
                      {selectedAgent.tone && (
                        <span className="ml-2 text-sm font-normal opacity-70 block">
                          {selectedAgent.tone}
                        </span>
                      )}
                    </>
                  ) : (
                    "No Agents Yet"
                  )}
                </p>
              </div>

              {/* Updated QR Code Integration - Using Real Data */}
              <div className="bg-white p-2 rounded-xl">
                {selectedAgent ? (
                  <AgentQR
                    agentId={selectedAgent.id}
                    agentName={selectedAgent.agent_name}
                    triggerCode={selectedAgent.trigger_code}
                    initialQrCode={selectedAgent.qr_code_base64}
                    className="!border-none !shadow-none !bg-transparent !p-0"
                  />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center text-gray-400">
                    No active agent
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
