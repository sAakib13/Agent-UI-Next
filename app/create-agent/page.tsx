/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Settings2,
  AlertCircle,
  Wand2, // Auto-fill icon
} from "lucide-react";

// --- Types & Config ---

type AgentStatus = "Active" | "Inactive" | "Training";

type AgentConfig = {
  id: string;
  status: AgentStatus;
  possibleActions: { updateContactTable: boolean; delegateToHuman: boolean };

  // Business Info
  businessName: string;
  industry: string;
  shortDescription: string;
  businessURL: string;

  // Agent Info
  agentName: string;
  triggerCode: string;
  persona: string;
  task: string;
  language: string;
  tone: string;
  greeting_message: string;

  // Advanced Settings
  route: string;
  model: string;

  urls: string[];
  documents: File[];
  qrCode?: string;
};

// Initial state without ID (ID is generated on mount/state init)
const initialConfigBase: Omit<AgentConfig, "id"> = {
  status: "Training",
  possibleActions: { updateContactTable: false, delegateToHuman: false },
  businessName: "",
  industry: "",
  shortDescription: "",
  businessURL: "",
  agentName: "",
  triggerCode: "",
  language: "",
  tone: "",
  greeting_message: "",
  persona: "",
  task: "",
  model: "",
  route: "",
  urls: [""],
  documents: [],
};

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
const route = ["WhatsApp", "Viber", "Messenger"];

// --- Utility: Safe Error Message Extraction ---
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
};

// --- Reusable DB Function ---

const saveAgentConfigToDB = async (
  config: AgentConfig
): Promise<{ success: boolean; message: string }> => {
  try {
    const documentRefs = config.documents.map((f) => f.name);

    const allowedActionsArray = Object.entries(config.possibleActions)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    const payload = {
      organization: {
        name: config.businessName,
        website: config.businessURL,
        industry: config.industry,
        short_description: config.shortDescription,
        is_active: true,
      },
      agents: [
        {
          name: config.agentName,
          language: config.language,
          tone: config.tone,
          persona_prompt: config.persona,
          task_prompt: config.task,
          trigger_code: config.triggerCode,
          allowed_actions: allowedActionsArray,
          qr_code_base64: config.qrCode,
          greeting_message: config.greeting_message,
          status: config.status,
          document_refs: documentRefs,
          source_urls: config.urls.filter((url) => url.trim() !== ""),
          // Advanced fields
          model_config: {
            model: config.model,
            route: config.route,
          },
        },
      ],
    };

    const response = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || "Validation Failed");
      } catch {
        throw new Error(`Server Error ${response.status}: ${errorText}`);
      }
    }

    return {
      success: true,
      message: "Agent deployed and saved successfully!",
    };
  } catch (error: unknown) {
    console.error("API Call Error:", error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// --- Components ---

interface InputProps {
  label: string;
  placeholder?: string;
  value: string | number;
  disabled?: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  isTextArea?: boolean;
  hint?: string;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}

const TextInput: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  isTextArea,
  hint,
  type = "text",
  ...props
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex justify-between items-center">
      {label}{" "}
      {hint && (
        <span className="text-xs font-normal text-gray-400 ml-2">{hint}</span>
      )}
    </label>
    {isTextArea ? (
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none shadow-sm"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
        {...props}
      />
    )}
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string | null;
  options: string[];
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, value, options, disabled, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`appearance-none w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-10 py-4 
    focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none cursor-pointer shadow-sm hover:border-gray-300 dark:hover:border-gray-600
    ${value === "" ? "text-gray-400" : "text-gray-900 dark:text-white"}`}
      >
        <option value="" disabled>
          Select an option
        </option>
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
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, placeholder, value, disabled, onChange }) => (
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
            disabled={disabled}
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
        disabled={disabled}
        placeholder={placeholder}
        className="w-full p-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none"
      />
    </div>
  </div>
);

const FileDropZone: React.FC<{
  files: File[];
  onFilesAdded: (f: File[]) => void;
  onFileRemoved: (i: number) => void;
  disabled?: boolean;
}> = ({ files, onFilesAdded, onFileRemoved, disabled }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <div
        className={`group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center transition-all cursor-pointer bg-white dark:bg-gray-900/50 
        ${disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
          }`}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          multiple
          accept=".pdf,.doc,.docx"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) {
              onFilesAdded(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />
        <div className="w-14 h-14 bg-blue-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
          <UploadCloud className="w-7 h-7 text-blue-500" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Upload Documents
        </h4>
        <p className="text-sm text-gray-500">
          Drag & drop files here (PDF, DOCX)
        </p>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                {file.name}
              </span>
              <button
                type="button"
                disabled={disabled}
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

const Stepper: React.FC<{ currentStep: number; deployed: boolean }> = ({
  currentStep,
  deployed,
}) => {
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
            width: deployed
              ? "100%"
              : `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
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
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ring-4 ring-white dark:ring-gray-950 z-10 ${isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110"
                  : isCompleted || deployed
                    ? "bg-green-500 text-white"
                    : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-400"
                  }`}
              >
                {isCompleted || deployed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`absolute top-12 text-xs font-bold tracking-wide transition-colors duration-300 ${isActive
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

// --- Main Page ---

export default function CreateAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Initialize ID in state to ensure uniqueness per session/render
  const [config, setConfig] = useState<AgentConfig>(() => ({
    ...initialConfigBase,
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : "temp-id",
  }));

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState("");
  const [resultMessage, setResultMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deployed, setDeployed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Type-safe change handlers
  const handleInputChange = (
    field: keyof AgentConfig,
    value: string | number | boolean
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleTriggerCodeChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.toUpperCase();
    const words = value.trim().split(/\s+/);
    if (words.length > 4 && value.endsWith(" ")) return;
    if (words.length <= 5)
      setConfig((prev) => ({ ...prev, triggerCode: value }));
  };

  // --- Auto-Fill Logic ---
  const handleAutoFill = () => {
    const presets = [
      {
        businessName: "Nexus Tech Solutions",
        industry: "Technology",
        businessURL: "https://nexus-demo.com",
        shortDescription:
          "A leading provider of cloud infrastructure and cybersecurity solutions for enterprise clients.",
        agentName: "NexusBot",
        language: "English",
        tone: "Professional",
        triggerCode: "START NEXUS",
        greeting_message:
          "Welcome to Nexus Tech! I am your virtual assistant. How can I help you with our cloud services today?",
        persona:
          "You are a knowledgeable and precise technical support assistant for a cloud infrastructure company. You prioritize security and uptime in your answers.",
        task: "Answer FAQs about server pricing, troubleshoot basic login issues, and schedule consultations for enterprise plans.",
        model: "",
        temperature: 0.5,
        urls: [
          "https://nexus-demo.com/docs",
          "https://nexus-demo.com/pricing",
          "https://nexus-demo.com/support",
        ],
      },
      {
        businessName: "The Bean & Leaf",
        industry: "E-commerce",
        businessURL: "https://bean-leaf-cafe.com",
        shortDescription:
          "An artisanal coffee roaster and tea shop specializing in organic, fair-trade blends.",
        agentName: "Barista Buddy",
        language: "English",
        tone: "Friendly",
        triggerCode: "ORDER COFFEE",
        greeting_message:
          "Hey there! ☕ Welcome to Bean & Leaf. Looking for a fresh brew or some beans?",
        persona:
          "You are a warm, energetic, and coffee-obsessed barista. You use emojis occasionally and love suggesting pairings.",
        task: "Take coffee orders, explain the difference between roasts, and provide store hours and location.",
        model: "",
        temperature: 0.8,
        urls: [
          "https://bean-leaf-cafe.com/menu",
          "https://bean-leaf-cafe.com/sustainability",
        ],
      },
    ];

    const randomPreset = presets[Math.floor(Math.random() * presets.length)];

    setConfig((prev) => ({
      ...prev,
      ...randomPreset,
    }));

    setResultMessage({ type: "success", text: "Auto-filled with demo data!" });
    setTimeout(() => setResultMessage(null), 2000);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!config.businessName) {
        setResultMessage({ type: "error", text: "Enter a Business Name" });
        return false;
      }
      if (!config.industry) {
        setResultMessage({ type: "error", text: "Select an Industry" });
        return false;
      }
    }
    if (currentStep === 2) {
      if (!config.agentName) {
        setResultMessage({ type: "error", text: "Enter an Agent Name" });
        return false;
      }
      if (!config.triggerCode) {
        setResultMessage({ type: "error", text: "Set a Trigger Code" });
        return false;
      }
    }
    setResultMessage(null); // Clear errors
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleDeployAgent = async () => {
    setIsDeploying(true);
    setResultMessage(null);
    let qrCodeBase64 = "";

    try {
      // 1. Generate QR Code
      setDeployStep("Generating QR Code...");
      try {
        const qrResponse = await fetch("/api/integrations/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: config.id,
            agentName: config.agentName,
            triggerCode: config.triggerCode,
          }),
        });

        if (qrResponse.ok) {
          const qrData = await qrResponse.json();
          if (qrData.success && qrData.qrCodeUrl) {
            qrCodeBase64 = qrData.qrCodeUrl;
          }
        }
      } catch (qrErr) {
        console.warn("QR Generation skipped due to error", qrErr);
      }

      // 2. Save to Database
      setDeployStep("Saving to Database...");
      const result = await saveAgentConfigToDB({
        ...config,
        qrCode: qrCodeBase64,
      });

      if (result.success) {
        setResultMessage({ type: "success", text: result.message });
        setDeployed(true);
        // Optional: Redirect
        // setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setResultMessage({ type: "error", text: result.message });
      }
    } catch (error: unknown) {
      console.error(error);
      setResultMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setIsDeploying(false);
      setDeployStep("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 pt-6">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
          Create New Agent
        </h1>
        <p className="text-md text-gray-400 dark:text-gray-400 max-w-xl mx-auto italic mb-6">
          Let’s build your WhatsApp AI Assistant
        </p>

        {/* --- Auto-Fill Button --- */}
        {!deployed && (
          <button
            type="button"
            onClick={handleAutoFill}
            className="inline-flex items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-full text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all shadow-sm hover:shadow-md border border-purple-100 dark:border-purple-800"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Auto-Fill Demo Data
          </button>
        )}
      </header>

      <div className="px-4 md:px-0">
        <Stepper currentStep={step} deployed={deployed} />
      </div>

      <div className="flex justify-center items-center w-full min-h-[60px] mb-4">
        {resultMessage && (
          <div
            className={`px-6 py-3 w-fit rounded-xl font-medium shadow-lg transition-all ease-in flex items-center justify-center gap-2
            ${resultMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
              }`}
          >
            {resultMessage.type === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <p>{resultMessage.text}</p>
          </div>
        )}
      </div>

      <form className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
                  placeholder="e.g. Telerivet.Inc"
                  value={config.businessName}
                  disabled={deployed}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                />
                <TextInput
                  label="Business Website"
                  placeholder="e.g. https://www.telerivet.com"
                  value={config.businessURL}
                  disabled={deployed}
                  onChange={(e) =>
                    handleInputChange("businessURL", e.target.value)
                  }
                />
                <SelectInput
                  label="Industry"
                  value={config.industry}
                  options={industries}
                  disabled={deployed}
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                />

                <TextInput
                  label="Short Description"
                  placeholder="Briefly describe your business..."
                  value={config.shortDescription}
                  disabled={deployed}
                  onChange={(e) =>
                    handleInputChange("shortDescription", e.target.value)
                  }
                  isTextArea
                />
              </div>
            </section>
          </div>
        )}

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
                <TextInput
                  label="Agent Name"
                  placeholder="e.g. Customer Support Assistant"
                  value={config.agentName}
                  disabled={deployed}
                  onChange={(e) =>
                    handleInputChange("agentName", e.target.value)
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectInput
                    label="Agent Language"
                    value={config.language}
                    options={languages}
                    disabled={deployed}
                    onChange={(e) =>
                      handleInputChange("language", e.target.value)
                    }
                  />
                  <SelectInput
                    label="Agent Tone"
                    value={config.tone}
                    options={tones}
                    disabled={deployed}
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                  />
                </div>
                <TextInput
                  label="Trigger Code"
                  placeholder="e.g. HELLO START"
                  value={config.triggerCode}
                  onChange={handleTriggerCodeChange}
                  hint="Max 4 words, Uppercase"
                />
                <TextInput
                  label="Agent Initial Greeting"
                  placeholder="e.g. Hello! How can I assist you today?"
                  value={config.greeting_message}
                  disabled={deployed}
                  onChange={(e) =>
                    handleInputChange("greeting_message", e.target.value)
                  }
                />
                <div className="grid grid-cols-1 gap-8">
                  <RichTextEditorMock
                    label="Agent Persona"
                    placeholder="Describe the agent's persona..."
                    value={config.persona}
                    disabled={deployed}
                    onChange={(e) =>
                      handleInputChange("persona", e.target.value)
                    }
                  />
                  <RichTextEditorMock
                    label="Agent's Task"
                    placeholder="Describe the specific tasks..."
                    value={config.task}
                    disabled={deployed}
                    onChange={(e) => handleInputChange("task", e.target.value)}
                  />
                </div>

                {/* Advanced Section Toggle */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    {expanded
                      ? "Hide Advanced Settings"
                      : "Show Advanced Settings"}
                  </button>

                  {expanded && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">

                      <TextInput
                        label="Project ID"
                        value={config.model}
                        disabled={deployed}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                      />
                      <SelectInput
                        label="Route Name"
                        value={config.route}
                        options={route}
                        disabled={deployed}
                        onChange={(e) =>
                          handleInputChange("route", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

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
                        disabled={deployed}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                {config.urls.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    disabled={deployed}
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
                  disabled={deployed}
                />
              </div>
            </div>
          </section>
        )}
      </form>

      {/* Floating Footer */}
      <div className="fixed bottom-8 w-full left-40 right-0 flex justify-center z-50 pointer-events-none px-4 items-center">
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
              disabled={deployed || isDeploying}
              className={`px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 
                ${deployed
                  ? "opacity-50 cursor-default"
                  : "hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5"
                }`}
            >
              {isDeploying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : deployed ? (
                <Check className="w-5 h-5" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
              {isDeploying
                ? deployStep || "Deploying..."
                : deployed
                  ? "Deployed!"
                  : "Deploy Agent"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
