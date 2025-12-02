/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  UploadCloud,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  QrCode,
  X,
  Activity,
  Settings,
  Save,
  RotateCcw,
  Search,
  ArrowLeft,
  Users,
  Zap,
  Clock,
  ChevronRight,
  Loader2,
  Hash,
} from "lucide-react";

// --- Types & Helpers ---

type AgentConfig = {
  id: string;
  agentName: string;
  triggerCode: string; // New field
  status: "Active" | "Inactive" | "Training";
  lastActive: string;

  // Business Profile Fields
  businessName: string;
  industry: string;
  shortDescription: string;
  businessURL: string;

  // Core Config
  persona: string;
  task: string;
  language: string;
  tone: string;

  urls: string[];
  documents: File[];
  possibleActions: { updateContactTable: boolean; delegateToHuman: boolean };
};

const parseJSONField = <T,>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  return value as T;
};

const normalizeStatus = (status?: string | null): AgentConfig["status"] => {
  const normalized = (status || "Training").toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "inactive") return "Inactive";
  return "Training";
};

const formatLastActive = (timestamp?: string | null) => {
  if (!timestamp) return "Unknown";
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime())
    ? "Unknown"
    : parsed.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
};

// --- Reusable Modern Components ---

const TextInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  hint?: string;
}> = ({ label, placeholder, value, onChange, hint }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex justify-between">
      {label}
      {hint && (
        <span className="text-xs font-normal text-gray-400">{hint}</span>
      )}
    </label>
    <input
      type="text"
      value={value}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={onChange as any}
      placeholder={placeholder}
      className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
    />
  </div>
);

const RichTextEditorMock: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800/50 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all shadow-sm">
      <div className="flex space-x-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        {[Bold, Italic, Underline, List, ListOrdered].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <textarea
        rows={6}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none"
      />
    </div>
  </div>
);

const FileDropZone: React.FC<{
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
}> = ({ files, onFilesAdded, onFileRemoved }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center transition-all hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer bg-white dark:bg-gray-900/50"
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          multiple
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="w-12 h-12 bg-blue-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-gray-700 transition-all duration-300">
          <UploadCloud className="w-6 h-6 text-blue-500 group-hover:text-blue-600" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Click to upload documents
        </p>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <span className="truncate flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemoved(index);
                }}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function AgentManagementPage() {
  const [view, setView] = useState<"LIST" | "EDIT">("LIST");
  const [currentAgent, setCurrentAgent] = useState<AgentConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch logic mapping DB snake_case to frontend camelCase
  const fetchAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error("Unable to reach the agents API endpoint.");
      }

      const payload = await response.json();
      if (!payload?.success) {
        throw new Error(
          payload?.error || "Failed to fetch agents from PostgreSQL."
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: AgentConfig[] = (payload.data ?? []).map((row: any) => {
        const urls = parseJSONField<string[]>(row?.urls, []);
        const actions = parseJSONField<Record<string, boolean>>(
          row?.actions,
          {}
        );

        return {
          id: row?.id || crypto.randomUUID(),
          agentName: row?.name || "Untitled Agent",
          triggerCode: row?.trigger_code || "",
          status: normalizeStatus(row?.status),
          lastActive: formatLastActive(row?.updated_at),

          // Mapped Business Fields
          businessName: row?.business_name || "",
          industry: row?.industry || "",
          shortDescription: row?.short_description || "",
          businessURL: row?.business_url || "",

          // Mapped Config Fields
          language: row?.language || "English",
          tone: row?.tone || "Formal",
          persona: row?.persona || "",
          task: row?.task || "",

          urls: Array.isArray(urls) ? urls : [],
          documents: [], // Files are client-side only for now in this demo
          possibleActions: {
            updateContactTable: Boolean(actions.updateContactTable),
            delegateToHuman: Boolean(actions.delegateToHuman),
          },
        };
      });

      setAgents(mapped);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unexpected error while fetching agents."
      );
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleEditAgent = (agent: AgentConfig) => {
    setCurrentAgent(agent);
    setView("EDIT");
  };

  const handleBackToList = () => {
    setCurrentAgent(null);
    setView("LIST");
  };

  const handleInputChange = (field: keyof AgentConfig, value: string) => {
    if (currentAgent) {
      setCurrentAgent({ ...currentAgent, [field]: value });
    }
  };

  // --- DB Save Handler ---
  const handleSaveChanges = async () => {
    if (!currentAgent) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send ALL fields to match schema
        body: JSON.stringify({
          id: currentAgent.id,
          agentName: currentAgent.agentName,
          triggerCode: currentAgent.triggerCode,
          businessName: currentAgent.businessName,
          industry: currentAgent.industry,
          shortDescription: currentAgent.shortDescription,
          businessURL: currentAgent.businessURL,
          language: currentAgent.language,
          tone: currentAgent.tone,
          persona: currentAgent.persona,
          task: currentAgent.task,
          status: currentAgent.status,
          urls: currentAgent.urls,
          possibleActions: currentAgent.possibleActions,
        }),
      });

      if (!response.ok) {
        throw new Error("Server returned an error while saving the agent.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save agent.");
      }

      await fetchAgents(); // Refresh list
      handleBackToList(); // Go back to list
      alert("Agent configuration saved successfully!");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Error connecting to server."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- View: Agent List ---
  if (view === "LIST") {
    return (
      <div className="max-w-7xl mx-auto space-y-10 pb-20 pt-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Agent Fleet
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
              Manage and monitor your fleet of intelligent agents.
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all">
            <Plus className="w-5 h-5" /> Deploy New Agent
          </button>
        </header>

        {/* Filter Bar */}
        <div className="flex gap-4 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              className="w-full bg-transparent border-none rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:ring-0 placeholder-gray-400 outline-none"
            />
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-800 my-2" />
          <select className="bg-transparent border-none px-6 py-3 text-gray-700 dark:text-gray-300 outline-none cursor-pointer font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingAgents ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white/80 py-20 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
              <Loader2 className="mb-4 h-6 w-6 animate-spin text-blue-600" />
              <p className="font-medium">Loading agents from PostgreSQL...</p>
            </div>
          ) : agents.length > 0 ? (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${agent.status === "Active"
                      ? "bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10"
                      : agent.status === "Training"
                        ? "bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10"
                        : "bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                      }`}
                  >
                    <Zap
                      className={`w-7 h-7 ${agent.status === "Active"
                        ? "text-green-600 dark:text-green-400"
                        : agent.status === "Training"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-400"
                        }`}
                    />
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${agent.status === "Active"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-900"
                      : agent.status === "Training"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900"
                        : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                  >
                    {agent.status}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {agent.agentName}
                </h3>
                {agent.triggerCode && (
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-2 block">
                    TRIGGER: {agent.triggerCode}
                  </span>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {agent.persona || "No persona provided yet."}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <Clock className="w-4 h-4 mr-2" />
                    Active {agent.lastActive}
                  </div>

                  <button
                    onClick={() => handleEditAgent(agent)}
                    className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center group-hover:border-blue-500/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  >
                    Configure{" "}
                    <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white/80 py-16 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
              <Users className="mb-4 h-10 w-10 text-gray-400" />
              <p className="text-base font-semibold">No agents found yet.</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Save a configuration to see it appear here.
              </p>
              <button
                onClick={fetchAgents}
                className="mt-4 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-blue-400"
              >
                Refresh
              </button>
            </div>
          )}

          {/* Add New Agent Placeholder Card */}
          {/* <button className="group border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all gap-4 min-h-[320px]">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-300">
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <span className="block font-bold text-lg text-gray-600 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                Deploy New Agent
              </span>
              <span className="block text-sm text-gray-400 mt-1">
                Start from scratch or template
              </span>
            </div>
          </button> */}
        </div>
      </div>
    );
  }

  // --- View: Edit Agent ---
  if (view === "EDIT" && currentAgent) {
    return (
      <div className="max-w-6xl mx-auto pb-32 pt-6 animate-in slide-in-from-right-8 fade-in duration-500">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <button
              onClick={handleBackToList}
              className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:shadow-md hover:-translate-x-1"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-4">
                {currentAgent.agentName}
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full border ${currentAgent.status === "Active"
                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400"
                    : "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                    }`}
                >
                  {currentAgent.status}
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Last Updated{" "}
                {currentAgent.lastActive}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:shadow-md">
              <RotateCcw className="w-4 h-4" /> Rebuild
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Identification */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Agent Identity
                </h2>
                {/* ID Badge */}
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  <Hash className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {currentAgent.id}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <TextInput
                  label="Agent Name"
                  placeholder="Agent Name"
                  value={currentAgent.agentName}
                  onChange={(e) =>
                    handleInputChange("agentName", e.target.value)
                  }
                />
                <TextInput
                  label="Trigger Code (Max 4 words, CAPS)"
                  placeholder="START AGENT NOW"
                  value={currentAgent.triggerCode}
                  onChange={(e) =>
                    handleInputChange(
                      "triggerCode",
                      e.target.value.toUpperCase()
                    )
                  }
                />
              </div>
            </section>

            {/* Business Info (Editable) */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">
                Business Context
              </h2>
              <div className="space-y-6">
                <TextInput
                  label="Business Name"
                  placeholder="Acme Corp"
                  value={currentAgent.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                />
                <TextInput
                  label="Website URL"
                  placeholder="https://..."
                  value={currentAgent.businessURL}
                  onChange={(e) =>
                    handleInputChange("businessURL", e.target.value)
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="Language"
                    placeholder="English"
                    value={currentAgent.language}
                    onChange={(e) =>
                      handleInputChange("language", e.target.value)
                    }
                  />
                  <TextInput
                    label="Tone"
                    placeholder="Formal"
                    value={currentAgent.tone}
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Core Behavior */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">
                Core Behavior
              </h2>
              <div className="space-y-6">
                <RichTextEditorMock
                  label="Persona"
                  placeholder="Describe persona..."
                  value={currentAgent.persona}
                  onChange={(e) => handleInputChange("persona", e.target.value)}
                />
                <RichTextEditorMock
                  label="Task"
                  placeholder="Describe task..."
                  value={currentAgent.task}
                  onChange={(e) => handleInputChange("task", e.target.value)}
                />
              </div>
            </section>

            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">
                Knowledge Base
              </h2>
              <FileDropZone
                files={currentAgent.documents}
                onFilesAdded={() => { }}
                onFileRemoved={() => { }}
              />
              <div className="space-y-4 pt-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Connected URLs
                </h3>
                {currentAgent.urls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <TextInput
                      label=""
                      placeholder="https://"
                      value={url}
                      onChange={() => { }}
                    />
                  </div>
                ))}
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center hover:underline">
                  <Plus className="w-4 h-4 mr-1" /> Add Source URL
                </button>
              </div>
            </section>
          </div>

          {/* Side Column */}
          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Capabilities
              </h2>
              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={currentAgent.possibleActions.updateContactTable}
                      onChange={() => { }}
                      className="w-5 h-5 text-blue-600 rounded-md focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white">
                      CRM Access
                    </span>
                    <span className="block text-xs text-gray-500 mt-1 leading-relaxed">
                      Allow agent to read and update contact tables
                    </span>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={currentAgent.possibleActions.delegateToHuman}
                      onChange={() => { }}
                      className="w-5 h-5 text-blue-600 rounded-md focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white">
                      Human Handoff
                    </span>
                    <span className="block text-xs text-gray-500 mt-1 leading-relaxed">
                      Escalate conversation based on sentiment analysis
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
