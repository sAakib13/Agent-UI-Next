/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { AgentQR } from "@/components/agent/AgentQR";
import {
  MessageSquare,
  FileText,
  Globe,
  Users,
  Building,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  Activity,
  Zap,
  MoreHorizontal,
  Smartphone,
  Sparkles,
  Search,
  Share2,
  Wifi,
  Battery,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
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

// --- Components ---

const Card = ({
  className,
  children,
  noPadding = false,
}: {
  className?: string;
  children: React.ReactNode;
  noPadding?: boolean;
}) => (
  <div
    className={cn(
      "relative overflow-hidden  transition-all shadow-sm border",
      // Light Mode
      "bg-white border-gray-200",
      // Dark Mode
      "dark:bg-gray-900/50 dark:border-white/10 dark:backdrop-blur-xl dark:shadow-2xl",
      noPadding ? "p-0" : "p-6",
      className
    )}
  >
    {children}
  </div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  colorName = "indigo",
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  colorName: string;
  delay?: number;
}) => {
  const colors: Record<string, string> = {
    indigo:
      "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10",
    amber:
      "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10",
    pink: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-500/10",
    emerald:
      "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
  };

  const activeColor = colors[colorName] || colors.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="flex flex-col justify-between h-full hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div
            className={cn(
              "p-3 rounded-2xl transition-colors duration-300",
              activeColor
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

// --- STABLE Phone Mockup Component ---
const PhonePreview = ({ agent }: { agent: AgentData | null }) => {
  return (
    // Fixed height container for the phone to prevent layout crash
    <div className="relative mx-auto w-[280px] h-[550px] bg-gray-900 rounded-[2.5rem] border-8 border-gray-900 shadow-2xl overflow-hidden ring-1 ring-white/10 select-none flex flex-col shrink-0">
      {/* Screen Content */}
      <div className="flex-1 bg-white dark:bg-gray-950 flex flex-col w-full h-full relative overflow-hidden rounded-4xl">
        {/* Status Bar */}
        <div className="h-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-between px-5 text-[10px] font-medium text-gray-400 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" />
            <Battery className="w-3 h-3" />
          </div>
        </div>

        {/* App Header */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {agent ? agent.agent_name.charAt(0) : "A"}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {agent ? agent.agent_name : "Select Agent"}
            </p>
            <p className="text-[9px] text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </p>
          </div>
        </div>

        {/* Chat Area - Scrollable */}
        <div className="flex-1 bg-[#F0F2F5] dark:bg-[#0b141a] relative overflow-y-auto p-3 flex flex-col items-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat pointer-events-none" />

          <AnimatePresence mode="wait">
            {agent ? (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col relative z-10"
              >
                <div className="flex justify-center mb-4 mt-2">
                  <span className="bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur text-[9px] text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded shadow-sm">
                    Today
                  </span>
                </div>
                {/* QR Code Card */}
                <div className="self-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 w-[180px]">
                  <p className="text-[9px] text-center text-gray-500 mb-2 uppercase tracking-wider font-bold">
                    Scan to Chat
                  </p>
                  <div className="aspect-square bg-white rounded-lg overflow-hidden p-1 border border-gray-100 dark:border-gray-700 mb-">
                    <AgentQR
                      agentId={agent.id}
                      agentName={agent.agent_name}
                      triggerCode={agent.trigger_code}
                      initialQrCode={agent.qr_code_base64}
                      className="border-none! shadow-none! bg-transparent! p-0! w-full h-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold py-1.5 rounded flex items-center justify-center gap-1">
                      <Copy className="w-3 h-3" /> Link
                    </button>
                  </div>
                </div>

                {/* Bot Greeting */}
                <div className="self-start max-w-[90%] bg-white dark:bg-gray-800 rounded-xl rounded-tl-none p-3 shadow-sm mb-3 border border-gray-100 dark:border-gray-700/50 mt-4">
                  <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                    {agent.greeting_message ||
                      "Hello! How can I help you today?"}
                  </p>
                  <span className="text-[8px] text-gray-400 block text-right mt-1">
                    10:00 AM
                  </span>
                </div>


              </motion.div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                <Smartphone className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-xs">Select an agent</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="bg-gray-50 dark:bg-gray-900 p-2.5 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 shrink-0 z-20">
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-lg leading-none pb-1">
            +
          </div>
          <div className="flex-1 h-7 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700" />
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center">
            <div className="w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-white border-b-4 border-b-transparent ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        if (!response.ok) throw new Error("Failed to fetch agents");
        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
          setAgents(json.data);
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

  const handleAgentSelect = async (id: string) => {
    const found = agents.find((a) => a.id === id);
    if (found) setSelectedAgent(found);
  };

  const numberOfAgents = agents.length;
  // const uniqueOrgs = new Set(agents.map((a) => a.business_name)).size;

  const mockMetrics = {
    messagesProcessed: 14500,
    documentsUploaded: 75,
    urlsCrawled: 420,
    contacts: 12,
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-rose-500 text-center bg-gray-50 dark:bg-gray-950 min-h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Dashboard
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-400/20">
                Live v2.4
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back. Your agents are currently{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                active
              </span>
              .
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-3"
          >
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              <FileText className="w-4 h-4" /> Report
            </button>
            <button
              onClick={() => (window.location.href = "/create-agent")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-all text-sm font-medium"
            >
              <Zap className="w-4 h-4 fill-current" /> Deploy Agent
            </button>
          </motion.div>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Messages"
            value={mockMetrics.messagesProcessed.toLocaleString()}
            icon={MessageSquare}
            colorName="indigo"
            trend="+12%"
            delay={0.1}
          />
          <StatCard
            title="Documents"
            value={mockMetrics.documentsUploaded}
            icon={FileText}
            colorName="amber"
            delay={0.2}
          />
          <StatCard
            title="Knowledge Base"
            value={mockMetrics.urlsCrawled}
            icon={Globe}
            colorName="pink"
            trend="+5 New"
            delay={0.3}
          />
          <StatCard
            title="Agents"
            value={numberOfAgents}
            icon={Users}
            colorName="emerald"
            delay={0.4}
          />
        </div>

        {/* Main Content Area (Fixed Height for Scrolling) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
          {/* Left: Agent List (2 Columns) */}
          <motion.div
            className="lg:col-span-2 h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="h-[700px] flex flex-col p-0" noPadding>
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-transparent shrink-0">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Active Agents
                  </h2>
                </div>
                <div className="relative w-64 hidden sm:block">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* SCROLLABLE LIST - Fixed overflow issue */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                      selectedAgent?.id === agent.id
                        ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30"
                        : "bg-white dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-transform",
                          selectedAgent?.id === agent.id
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-700"
                        )}
                      >
                        {agent.agent_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
                          {agent.agent_name}
                          {selectedAgent?.id === agent.id && (
                            <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                          {agent.business_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-800">
                        {agent.trigger_code}
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>
                ))}

                {agents.length === 0 && (
                  <div className="text-center py-20 text-gray-500 text-sm">
                    No active agents found.
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Right: Preview (1 Column) - CRASH FIXED */}
          <motion.div
            className="lg:col-span-1 h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card
              className="h-full bg-gradient-to-b from-indigo-50/50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col relative overflow-hidden border-indigo-100 dark:border-indigo-500/20 p-0"
              noPadding
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200/50 dark:border-white/5 text-center shrink-0 z-10">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  Live Preview
                </h3>
              </div>

              {/* Phone Container - Centered & Scaled */}
              <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

                {/* The Phone */}
                <PhonePreview agent={selectedAgent} />
              </div>

              {/* Footer Info */}
              {selectedAgent && (
                <div className="p-3 bg-white/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 text-center shrink-0 backdrop-blur-sm z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                      Tone: {selectedAgent.tone}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
