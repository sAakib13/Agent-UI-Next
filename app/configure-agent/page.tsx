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
  X,
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
  Trash2,
  ChevronDown,
} from "lucide-react";
import { redirect } from "next/navigation";

// --- Types & Helpers ---

const industries = [
  "Technology",
  "E-commerce",
  "Finance",
  "Healthcare",
  "Education",
  "Real Estate",
  "Hospitality",
];
const languages = ["English", "Spanish", "French", "German", "Portuguese"];
const tones = ["Formal", "Casual", "Friendly", "Professional", "Empathetic"];

// 1. UPDATED: Type definition matches your DB Schema needs
type AgentConfig = {
  id: string;
  organizationId?: string; // New field to link org
  agentName: string; // Maps to: name
  triggerCode: string; // Maps to: trigger_code
  greeting_message: string;
  status: "Active" | "Inactive" | "Training";
  lastActive: string;

  // Business Profile Fields (Organization)
  businessName: string; // Maps to: organization.name
  industry: string; // Maps to: organization.industry
  shortDescription: string; // Maps to: organization.short_description
  businessURL: string; // Maps to: organization.website

  // Core Config
  persona: string; // Maps to: persona_prompt
  task: string; // Maps to: task_prompt
  language: string;
  tone: string;

  urls: string[]; // Maps to: source_urls
  documents: File[];
  // Maps to: allowed_actions array
  possibleActions: { updateContactTable: boolean; delegateToHuman: boolean };
  uploadedDocs?: {
    id: string;
    url?: string;
    name?: string;
    created_at?: string;
  }[];
};

// Helper to safely parse JSON from DB
const parseJSONField = <T,>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
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

// ... [Keep your Reusable Components (TextInput, SelectInput, etc.) exactly as they were] ...
// For brevity, I am omitting the UI components code block here as they do not need changing.
// Paste your previous TextInput, SelectInput, RichTextEditorMock, FileDropZone here.

const TextInput: React.FC<any> = ({
  label,
  placeholder,
  value,
  onChange,
  hint,
}) => (
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
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
    />
  </div>
);

const SelectInput: React.FC<any> = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={onChange}
        className={`appearance-none w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-10 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none cursor-pointer shadow-sm hover:border-gray-300 dark:hover:border-gray-600 ${
          value === "" ? "text-gray-400" : "text-gray-900 dark:text-white"
        }`}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const RichTextEditorMock: React.FC<any> = ({
  label,
  placeholder,
  value,
  onChange,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800/50 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all shadow-sm">
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

const FileDropZone: React.FC<any> = ({
  files,
  onFilesAdded,
  onFileRemoved,
}) => {
  // ... (Keep existing implementation)
  return (
    <div className="p-4 border border-dashed rounded-xl text-center text-gray-500">
      File Upload UI Placeholder
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
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);

  // 2. UPDATED: Fetch Logic to map SQL results to Frontend State
  const fetchAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/agents");
      if (!response.ok)
        throw new Error("Unable to reach the agents API endpoint.");

      const payload = await response.json();
      if (!payload?.success)
        throw new Error(payload?.error || "Failed to fetch agents.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: AgentConfig[] = (payload.data ?? []).map((row: any) => {
        // Handle parsing of JSONB columns coming from DB
        const urls = parseJSONField<string[]>(row?.source_urls, []); // Changed from row.urls to row.source_urls based on schema

        // Handle allowed_actions (schema stores stringified array)
        let actionsMap: Record<string, boolean> = {};
        const allowedActionsRaw = parseJSONField(row?.actions, []); // In your SQL SELECT you aliased it as 'actions'

        if (Array.isArray(allowedActionsRaw)) {
          actionsMap = allowedActionsRaw.reduce(
            (acc: any, key: string) => ({ ...acc, [key]: true }),
            {}
          );
        }

        return {
          id: row?.id,
          // You need to update your GET SQL to include organization_id if you want to link them properly
          organizationId: row?.organization_id,
          agentName: row?.agent_name || "Untitled Agent",

          // Schema mappings
          triggerCode: row?.trigger_code || "",
          greeting_message: row?.greeting_message || "",
          status: row?.status || "Training",
          lastActive: formatLastActive(row?.updated_at),

          // Business Fields
          businessName: row?.business_name || "",
          industry: row?.industry || "",
          shortDescription: row?.short_description || "",
          businessURL: row?.business_url || "",

          // Prompt Fields
          language: row?.language || "English",
          tone: row?.tone || "Formal",
          persona: row?.persona_prompt || "", // Mapped from persona_prompt
          task: row?.task_prompt || "", // Mapped from task_prompt

          urls: Array.isArray(urls) ? urls : [],
          documents: [],
          possibleActions: {
            updateContactTable: Boolean(actionsMap["updateContactTable"]),
            delegateToHuman: Boolean(actionsMap["delegateToHuman"]),
          },
        };
      });

      setAgents(mapped);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setLoadError(
        error instanceof Error ? error.message : "Unexpected error."
      );
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleEditAgent = async (agent: AgentConfig) => {
    // ... [Keep existing upload fetch logic] ...
    setCurrentAgent(agent);
    setView("EDIT");
  };

  const handleBackToList = () => {
    setCurrentAgent(null);
    setView("LIST");
  };

  // --- Handlers ---
  const handleInputChange = (field: keyof AgentConfig, value: string) => {
    if (currentAgent) setCurrentAgent({ ...currentAgent, [field]: value });
  };

  const handleToggleAction = (action: keyof AgentConfig["possibleActions"]) => {
    if (!currentAgent) return;
    setCurrentAgent({
      ...currentAgent,
      possibleActions: {
        ...currentAgent.possibleActions,
        [action]: !currentAgent.possibleActions[action],
      },
    });
  };

  // URL Helpers
  const handleAddUrl = () =>
    currentAgent &&
    setCurrentAgent({ ...currentAgent, urls: [...currentAgent.urls, ""] });
  const handleUpdateUrl = (i: number, val: string) => {
    if (!currentAgent) return;
    const newUrls = [...currentAgent.urls];
    newUrls[i] = val;
    setCurrentAgent({ ...currentAgent, urls: newUrls });
  };
  const handleRemoveUrl = (i: number) => {
    if (!currentAgent) return;
    const newUrls = currentAgent.urls.filter((_, idx) => idx !== i);
    setCurrentAgent({ ...currentAgent, urls: newUrls });
  };

  const handleFilesAdded = (files: File[]) => {
    // Visual only - actual upload requires separate logic
    if (currentAgent)
      setCurrentAgent({
        ...currentAgent,
        documents: [...currentAgent.documents, ...files],
      });
  };
  const handleFileRemoved = (i: number) => {
    if (currentAgent)
      setCurrentAgent({
        ...currentAgent,
        documents: currentAgent.documents.filter((_, idx) => idx !== i),
      });
  };

  const handleRoute = () => redirect("/create-agent");

  // 3. UPDATED: Save Logic to match Zod Schema
  const handleSaveChanges = async () => {
    if (!currentAgent) return;
    setIsSaving(true);

    try {
      // Convert action map back to array of strings for DB
      const allowedActionsArray = Object.entries(currentAgent.possibleActions)
        .filter(([, isEnabled]) => isEnabled)
        .map(([key]) => key);

      // Construct the exact structure your bodySchema expects:
      // { organization: {...}, agents: [...] }
      const payload = {
        organization: {
          id: currentAgent.organizationId, // Pass this if updating existing org
          name: currentAgent.businessName,
          website: currentAgent.businessURL,
          industry: currentAgent.industry,
          short_description: currentAgent.shortDescription,
          is_active: true, // or derive from state
        },
        agents: [
          {
            id: currentAgent.id, // ID is optional in Zod (creates new if missing), but strictly needed here for updates
            name: currentAgent.agentName,
            language: currentAgent.language,
            tone: currentAgent.tone,
            status: currentAgent.status,

            // Map frontend fields to DB Schema names
            persona_prompt: currentAgent.persona,
            task_prompt: currentAgent.task,
            trigger_code: currentAgent.triggerCode,
            greeting_message: currentAgent.greeting_message,

            // Arrays (Backend Zod expects arrays of strings)
            allowed_actions: allowedActionsArray,
            source_urls: currentAgent.urls.filter((u) => u.trim() !== ""),
            document_refs: currentAgent.uploadedDocs?.map((d) => d.id) || [], // Send IDs of already uploaded docs

            model_config: {}, // Schema requires this object, default empty
          },
        ],
      };

      const response = await fetch("/api/agents", {
        method: "POST", // NOTE: Your backend is POST. If it doesn't handle updates (upsert), this might fail on duplicate ID.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server error.");
      }

      const data = await response.json();

      // Check for errors inside 200 responses if your API does that
      if (data.error) throw new Error(JSON.stringify(data.error));

      await fetchAgents();
      handleBackToList();
      alert("Agent configuration saved!");
    } catch (error: any) {
      console.error(error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Views ---

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
          <button
            onClick={handleRoute}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 shadow-lg hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" /> Deploy New Agent
          </button>
        </header>

        {/* Search & Filter Bar */}
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
          <select className="bg-transparent border-none px-6 py-3 text-gray-700 dark:text-gray-300 outline-none cursor-pointer font-medium">
            <option>All Statuses</option>
            <option>Active</option>
          </select>
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingAgents ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
            </div>
          ) : agents.length > 0 ? (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 hover:shadow-xl transition-all flex flex-col hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      agent.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <Zap className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 border border-gray-200">
                    {agent.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{agent.agentName}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                  {agent.persona || "No persona set."}
                </p>
                <button
                  onClick={() => handleEditAgent(agent)}
                  className="w-full py-3 border rounded-xl hover:bg-gray-50 font-semibold flex items-center justify-center"
                >
                  Configure <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500">
              No agents found.
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- View: Edit ---
  if (view === "EDIT" && currentAgent) {
    return (
      <div className="max-w-6xl mx-auto pb-32 pt-6 animate-in slide-in-from-right-8 fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <button
              onClick={handleBackToList}
              className="p-3 bg-white border rounded-2xl hover:bg-gray-50"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-4">
                {currentAgent.agentName}
                <span className="text-sm px-3 py-1 rounded-full border bg-gray-50">
                  {currentAgent.status}
                </span>
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Updated {currentAgent.lastActive}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 shadow-lg disabled:opacity-70"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{" "}
              Save
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Identity */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Agent Identity</h2>
              <div className="space-y-6">
                <TextInput
                  label="Agent Name"
                  value={currentAgent.agentName}
                  onChange={(e: any) =>
                    handleInputChange("agentName", e.target.value)
                  }
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-6">
                  <SelectInput
                    label="Language"
                    value={currentAgent.language}
                    options={languages}
                    onChange={(e: any) =>
                      handleInputChange("language", e.target.value)
                    }
                  />
                  <SelectInput
                    label="Tone"
                    value={currentAgent.tone}
                    options={tones}
                    onChange={(e: any) =>
                      handleInputChange("tone", e.target.value)
                    }
                  />
                </div>
                <TextInput
                  label="Trigger Code"
                  value={currentAgent.triggerCode}
                  onChange={(e: any) =>
                    handleInputChange(
                      "triggerCode",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="START AGENT"
                />
                <TextInput
                  label="Greeting Message"
                  value={currentAgent.greeting_message}
                  onChange={(e: any) =>
                    handleInputChange("greeting_message", e.target.value)
                  }
                  placeholder="Hello!"
                />
                <RichTextEditorMock
                  label="Persona"
                  value={currentAgent.persona}
                  onChange={(e: any) =>
                    handleInputChange("persona", e.target.value)
                  }
                  placeholder="Describe persona..."
                />
                <RichTextEditorMock
                  label="Task"
                  value={currentAgent.task}
                  onChange={(e: any) =>
                    handleInputChange("task", e.target.value)
                  }
                  placeholder="Describe task..."
                />
              </div>
            </section>

            {/* Business Context */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Business Context</h2>
              <div className="space-y-6">
                <TextInput
                  label="Business Name"
                  value={currentAgent.businessName}
                  onChange={(e: any) =>
                    handleInputChange("businessName", e.target.value)
                  }
                  placeholder="Acme Inc"
                />
                <TextInput
                  label="Website URL"
                  value={currentAgent.businessURL}
                  onChange={(e: any) =>
                    handleInputChange("businessURL", e.target.value)
                  }
                  placeholder="https://..."
                />
                <SelectInput
                  label="Industry"
                  value={currentAgent.industry}
                  options={industries}
                  onChange={(e: any) =>
                    handleInputChange("industry", e.target.value)
                  }
                />
                <TextInput
                  label="Short Description"
                  value={currentAgent.shortDescription}
                  onChange={(e: any) =>
                    handleInputChange("shortDescription", e.target.value)
                  }
                  placeholder="Description..."
                />
              </div>
            </section>

            {/* Knowledge Base */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Knowledge Base</h2>
              <FileDropZone
                files={currentAgent.documents}
                onFilesAdded={handleFilesAdded}
                onFileRemoved={handleFileRemoved}
              />

              {/* URL List */}
              <div className="space-y-4 pt-8">
                <h3 className="text-sm font-bold">Connected URLs</h3>
                {currentAgent.urls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex-1">
                      <TextInput
                        label=""
                        value={url}
                        onChange={(e: any) =>
                          handleUpdateUrl(i, e.target.value)
                        }
                        placeholder="https://"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveUrl(i)}
                      className="p-3 mt-2 h-[58px] rounded-2xl bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddUrl}
                  className="text-sm font-medium text-blue-600 flex items-center hover:underline"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Source URL
                </button>
              </div>
            </section>
          </div>

          {/* Side Panel: Capabilities */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-3xl border shadow-sm sticky top-6">
              <h2 className="text-lg font-bold mb-6">Capabilities</h2>
              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentAgent.possibleActions.updateContactTable}
                    onChange={() => handleToggleAction("updateContactTable")}
                    className="w-5 h-5 mt-1"
                  />
                  <div>
                    <span className="block text-sm font-bold">CRM Access</span>
                    <span className="text-xs text-gray-500">
                      Read/Update contacts
                    </span>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentAgent.possibleActions.delegateToHuman}
                    onChange={() => handleToggleAction("delegateToHuman")}
                    className="w-5 h-5 mt-1"
                  />
                  <div>
                    <span className="block text-sm font-bold">
                      Human Handoff
                    </span>
                    <span className="text-xs text-gray-500">
                      Escalate on negative sentiment
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
