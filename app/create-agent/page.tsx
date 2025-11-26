"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Plus,
  UploadCloud,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Hash,
  MessageSquare,
} from "lucide-react";

// --- Types & Config ---

type AgentConfig = {
  // Database fields required for POST
  id: string;
  status: "Active" | "Inactive" | "Training";
  possibleActions: { updateContactTable: boolean; delegateToHuman: boolean };

  // Step 1: Business
  businessName: string;
  industry: string;
  shortDescription: string;
  businessURL: string;

  // Step 2: Core Config
  agentName: string;
  triggerCode: string; // New field
  persona: string;
  task: string;
  language: string;
  tone: string;

  // Step 3: Knowledge
  urls: string[];
  documents: File[];
};

const initialConfig: AgentConfig = {
  id: crypto.randomUUID(),
  status: "Training",
  possibleActions: { updateContactTable: false, delegateToHuman: false },

  businessName: "",
  industry: "Technology",
  shortDescription: "",
  businessURL: "",

  agentName: "",
  triggerCode: "", // Default empty
  language: "English",
  tone: "Formal",
  persona: "",
  task: "",

  urls: [""],
  documents: [],
};

const industries = [
  "Technology",
  "E-commerce",
  "Finance",
  "Healthcare",
  "Education",
];
const languages = ["English", "Spanish", "French", "German"];
const tones = ["Formal", "Casual", "Friendly", "Professional"];

// --- Reusable DB Function ---

const saveAgentConfigToDB = async (
  config: AgentConfig
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch("/api/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: config.id,
        agentName: config.agentName,
        triggerCode: config.triggerCode, // Send new field
        persona: config.persona,
        task: config.task,
        urls: config.urls.filter((url) => url.trim() !== ""),
        status: config.status,
        possibleActions: config.possibleActions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: "Agent configuration saved to PostgreSQL database!",
      };
    } else {
      return {
        success: false,
        message:
          "Failed to save: " + (data.details || data.error || "Unknown error"),
      };
    }
  } catch (error: any) {
    console.error("API Call Error:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Connection failed"}`,
    };
  }
};

// --- Components ---

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Profile" },
    { num: 2, label: "Configuration" },
    { num: 3, label: "Knowledge" },
  ];

  return (
    <div className="relative mb-12">
      <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 px-4">
        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div
          className="absolute left-0 top-1/2 h-1 bg-blue-600 rounded-full -translate-y-1/2 transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          return (
            <div
              key={step.num}
              className="flex flex-col items-center group cursor-default"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ring-4 ring-white dark:ring-gray-950 z-10
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-400"
                  }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.num}
              </div>
              <span
                className={`absolute top-12 text-xs font-bold tracking-wide transition-colors duration-300 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TextInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isTextArea?: boolean;
  maxLength?: number; // Added prop
  hint?: string; // Added prop
}> = ({
  label,
  placeholder,
  value,
  onChange,
  isTextArea = false,
  maxLength,
  hint,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex justify-between">
      {label}
      {hint && (
        <span className="text-xs font-normal text-gray-400">{hint}</span>
      )}
    </label>
    {isTextArea ? (
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
      />
    )}
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-10 py-4 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none cursor-pointer shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
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
        className="group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center transition-all hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer bg-white dark:bg-gray-900/50"
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
        <div className="w-14 h-14 bg-blue-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-gray-700 transition-all duration-300">
          <UploadCloud className="w-7 h-7 text-blue-500 group-hover:text-blue-600 transition-colors" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Upload Documents
        </h4>
        <p className="text-sm text-gray-500">
          Drag & drop files here or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-100 dark:bg-gray-800 inline-block px-3 py-1 rounded-full">
          PDF, DOCX (Max 10MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <UploadCloud className="w-4 h-4 text-blue-500" />
                </div>
                <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                  {file.name}
                </span>
              </div>
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

// --- Main Page ---

export default function CreateAgentPage() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<AgentConfig>(initialConfig);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleInputChange = (field: keyof AgentConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [field]: value }));
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...config.urls];
    newUrls[index] = value;
    setConfig((prev) => ({ ...prev, urls: newUrls }));
  };
  const handleAddUrl = () => {
    if (config.urls.length < 3)
      setConfig((prev) => ({ ...prev, urls: [...prev.urls, ""] }));
  };
  const handleFilesAdded = (newFiles: File[]) =>
    setConfig((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newFiles],
    }));
  const handleFileRemoved = (index: number) =>
    setConfig((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  const handleNext = () => {
    if (step < 3) setStep((prev) => prev + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  // Specific handler for Trigger Code (Uppercase + 4 words limit)
  const handleTriggerCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();

    // Check word count (allow if words <= 4)
    // We check if adding another character would start a 5th word
    const words = value.trim().split(/\s+/);

    // If we have more than 4 words, don't update (unless deleting)
    // Allow spaces at the end of the 4th word, but not a 5th word char
    if (words.length > 4) {
      // Simple truncation or just prevent input could be tricky with paste.
      // Let's just prevent typing if it exceeds.
      // Or easier: allow typing but show error state? User asked for "limitation".
      // We will just slice the array to 4 words if pasted/typed.
      const truncated = words.slice(0, 4).join(" ");
      value = truncated;
    }

    setConfig((prev) => ({ ...prev, triggerCode: value }));
  };

  const handleDeployAgent = async () => {
    setIsDeploying(true);
    const result = await saveAgentConfigToDB(config);
    alert(result.message);
    setIsDeploying(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 pt-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
          Create New Agent
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Set up your intelligent assistant in a few simple steps. Configure its
          personality, tasks, and knowledge base.
        </p>
      </header>

      <div className="px-4 md:px-0">
        <Stepper currentStep={step} />
      </div>

      <form className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Step 1: Business Profile */}
        {step === 1 && (
          <div className="space-y-6">
            <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Business Profile
                </h2>
              </div>
              <div className="space-y-6">
                <TextInput
                  label="Business Name"
                  placeholder="e.g. Acme Corp"
                  value={config.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                />
                <SelectInput
                  label="Industry"
                  value={config.industry}
                  options={industries}
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                />
                <TextInput
                  label="Short Description"
                  placeholder="Briefly describe your business..."
                  value={config.shortDescription}
                  onChange={(e) =>
                    handleInputChange("shortDescription", e.target.value)
                  }
                  isTextArea
                />
                <TextInput
                  label="Business URL"
                  placeholder="e.g. https://www.acmecorp.com"
                  value={config.businessURL}
                  onChange={(e) =>
                    handleInputChange("businessURL", e.target.value)
                  }
                />
              </div>
            </section>
          </div>
        )}

        {/* Step 2: Core Configuration & Communication Style */}
        {step === 2 && (
          <div className="space-y-6">
            <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Agent Configuration
                </h2>
              </div>
              <div className="space-y-8">
                {/* Auto-Generated Agent ID Display */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between group">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Hash className="w-3 h-3" /> Agent ID (Auto-Generated)
                    </label>
                    <div className="font-mono text-lg text-gray-700 dark:text-gray-300 mt-1 select-all">
                      {config.id}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 italic opacity-0 group-hover:opacity-100 transition-opacity">
                    System Generated
                  </div>
                </div>

                <TextInput
                  label="Agent Name"
                  placeholder="e.g. Support Bot v1"
                  value={config.agentName}
                  onChange={(e) =>
                    handleInputChange("agentName", e.target.value)
                  }
                />

                {/* Agent Trigger Code Input */}
                <TextInput
                  label="Agent Trigger Code"
                  placeholder="e.g. HELLO START BOT NOW"
                  value={config.triggerCode}
                  onChange={(e) => handleTriggerCodeChange(e as any)}
                  hint="Max 4 words, All CAPS"
                />

                <div className="grid grid-cols-1 gap-8">
                  <RichTextEditorMock
                    label="Persona"
                    placeholder="Describe the agent's persona..."
                    value={config.persona}
                    onChange={(e) =>
                      handleInputChange("persona", e.target.value)
                    }
                  />
                  <RichTextEditorMock
                    label="Task"
                    placeholder="Describe the specific tasks..."
                    value={config.task}
                    onChange={(e) => handleInputChange("task", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Communication Style
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectInput
                  label="Language"
                  value={config.language}
                  options={languages}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                />
                <SelectInput
                  label="Tone"
                  value={config.tone}
                  options={tones}
                  onChange={(e) => handleInputChange("tone", e.target.value)}
                />
              </div>
            </section>
          </div>
        )}

        {/* Step 3: Knowledge Base */}
        {step === 3 && (
          <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Knowledge Base
              </h2>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  Source URLs
                </label>
                {config.urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <TextInput
                        label=""
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                {config.urls.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add another URL
                  </button>
                )}
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 ml-1">
                  Upload Documents
                </label>
                <FileDropZone
                  files={config.documents}
                  onFilesAdded={handleFilesAdded}
                  onFileRemoved={handleFileRemoved}
                />
              </div>
            </div>
          </section>
        )}
      </form>

      {/* Modern Floating Footer */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 rounded-2xl shadow-2xl shadow-blue-900/20 pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isDeploying}
            className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isDeploying}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDeployAgent}
              disabled={isDeploying}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {isDeploying ? "Deploying..." : "Deploy Agent"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
