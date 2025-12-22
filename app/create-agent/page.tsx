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
  Trash2,
  HelpCircle,
  Wand2, // Auto-fill icon
} from "lucide-react";
import { tr } from "zod/locales";
import { AgentPopup } from "@/components/agent/AgentPopup";
import { INDUSTRY_PRESETS, IndustryPreset } from "../_config/industryPresets";
import { set } from "zod";
import { required } from "zod/mini";

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

  features: {
    locationService: boolean;
    searchTool: boolean;
    knowledgeBase: boolean;
  };
};

// Initial state without ID (ID is generated on mount/state init)
const initialConfigBase: Omit<AgentConfig, "id"> = {
  status: "Training",
  possibleActions: { updateContactTable: false, delegateToHuman: false },
  features: {
    locationService: false,
    searchTool: false,
    knowledgeBase: true, // default to true if you like
  },
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
  "Consultancy",
  "E-commerce",
  "Insurance/Banks",
  "Education",
  "Travel Agency",
  "Hospitality",
  "Automotive",
  "Real Estate",
  "Hospital/Healthcare/Clinics",
  "Legal Services",
  "Fitness/Wellness",
  "Food & Beverage",
  "Retail",
  "Technology/Software",
  "Others",
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
  config: AgentConfig,
  documentRefs: string[],
  uploadedUrls: string[],
  organizationId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Map possibleActions + features to allowed_actions (all as snake_case)
    const possibleActionsArray = Object.entries(config.possibleActions)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    // Map features to snake_case format
    const featureMap: Record<string, string> = {
      locationService: "nearby_search_tool",
      searchTool: "web_search_tool",
      knowledgeBase: "knowledge_search_tool",
    };
    const featuresArray = Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => featureMap[key as keyof typeof featureMap] || key);

    // Combine both into allowed_actions
    const allowedActionsArray = [...possibleActionsArray, ...featuresArray];

    const payload = {
      organization: {
        id: organizationId,
        name: config.businessName,
        website: config.businessURL,
        industry: config.industry,
        short_description: config.shortDescription,
        is_active: true,
      },
      agents: [
        {
          id: config.id,
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
          source_urls: [
            ...config.urls.filter((url) => url.trim() !== ""),
            ...uploadedUrls,
          ],
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
  required?: boolean;
  tooltip?: string;
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
  required,
  tooltip,
  ...props
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex justify-between items-center">
      <span>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {tooltip && (
        <div className="group relative ml-1">
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
          {/* Tooltip Popup */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            {tooltip}
            {/* Tiny arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
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
        required={required}
        className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none shadow-sm"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
        {...props}
      />
    )}
  </div>
);

// Add this near your other components (TextInput, SelectInput, etc.)
const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
}> = ({ label, checked, onChange, disabled, tooltip, icon }) => (
  <div
    onClick={() => !disabled && onChange(!checked)}
    className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${
      checked
        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500"
        : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <div
      className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
        checked
          ? "bg-blue-600 border-blue-600"
          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">
        {label}
      </span>
    </div>
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string | null;
  options: string[];
  disabled?: boolean;
  required?: boolean;
  tooltip?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, value, options, disabled, required, tooltip, onChange }) => (
  <div className="space-y-2">
    {/* ADD 'flex items-center' here to keep the label, asterisk, and tooltip in one row */}
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center justify-between gap-1">
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>

      {/* Tooltip */}
      {tooltip && (
        <div className="group relative ml-1">
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200 font-normal">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </label>

    <div className="relative">
      <select
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        required={required}
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
  required?: boolean;
  tooltip?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, placeholder, value, disabled, required, tooltip, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center justify-between gap-1">
      <span>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <span>
        {tooltip && (
          <div className="group relative ml-1">
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
            {/* Tooltip Popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
              {tooltip}
              {/* Tiny arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        )}
      </span>
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
        required={required}
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
  required?: boolean;
}> = ({ files, onFilesAdded, onFileRemoved, disabled, required }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <div
        className={`group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center transition-all cursor-pointer bg-white dark:bg-gray-900/50 
        ${
          disabled
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
          required={required}
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
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ring-4 ring-white dark:ring-gray-950 z-10 ${
                  isActive
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
  const [showPopup, setShowPopup] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isIndustryAutoFillMode, setIsIndustryAutoFillMode] = useState(false);

  // Type-safe change handlers
  const handleInputChange = (
    field: keyof AgentConfig,
    value: string | number | boolean
  ) => {
    // If user changes Industry, turn off the auto-fill toggle so they can re-enable it if needed
    if (field === "industry") {
      setIsIndustryAutoFillMode(false);
    }
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...config.urls];
    newUrls[index] = value;
    setConfig((prev) => ({ ...prev, urls: newUrls }));
  };
  const handleUrlRemove = (index: number) => {
    const newUrls = config.urls.filter((_, i) => i !== index);
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

  // --- NEW: Handle Industry Auto-fill Logic ---
  const handleIndustryAutoFill = (checked: boolean) => {
    setIsIndustryAutoFillMode(checked);
    if (checked) {
      if (!config.industry || !(config.industry in INDUSTRY_PRESETS)) {
        setResultMessage({
          type: "error",
          text: "Please select a valid industry to auto-fill the configuration.",
        });
        setIsIndustryAutoFillMode(false);
        return;
      } else {
        const preset: IndustryPreset = INDUSTRY_PRESETS[config.industry];
        if (preset) {
          const businessName = config.businessName || "our business bot";

          // Inject the name into the greeting
          const dynamicGreeting = preset.initialGreeting.replace(
            "[Business Name]",
            businessName
          );
          // --- NEW LOGIC END ---

          // 4. Update State
          setIsIndustryAutoFillMode(true);
          setConfig((prev) => ({
            ...prev,
            greeting_message: dynamicGreeting, // Use the new dynamic string
            persona: preset.persona,
            task: preset.task,
          }));
          setResultMessage({
            type: "success",
            text: `Configuration auto-filled for ${config.industry} industry.`,
          });
          setTimeout(() => setResultMessage(null), 2000);
        }
      }
    }
  };

  // --- Auto-Fill Logic ---
  const handleAutoFill = () => {
    const presets = [
      // --- Consultancy ---
      {
        businessName: "Apex Strategy Group",
        industry: "Consultancy",
        businessURL: "https://www.apexstrategy.example.com",
        shortDescription:
          "A premier management consulting firm helping businesses optimize performance and growth.",
        agentName: "ConsultMate",
        triggerCode: "APEX",
        language: "English",
        tone: "Professional",
        greeting_message:
          "Hello! I'm ConsultMate. How can I assist with your business strategy today?",
        persona:
          "You are a senior business analyst providing professional, concise, and strategic advice.",
        task: "Schedule consultations, provide brief industry insights, and collect client requirements.",
        model: "",
        route: "WhatsApp",
        urls: [
          "https://www.mckinsey.com/capabilities",
          "https://www.bcg.com/industries",
        ],
        features: {
          locationService: false,
          searchTool: true,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
      },
      {
        businessName: "TechVision Solutions",
        industry: "Consultancy",
        businessURL: "https://www.techvision.example.com",
        shortDescription:
          "IT consultancy specializing in cloud migration and digital transformation.",
        agentName: "TechAdvisor",
        triggerCode: "TECH",
        language: "English",
        tone: "Professional",
        greeting_message:
          "Welcome to TechVision. Need help transforming your digital infrastructure?",
        persona:
          "You are a technical consultant knowledgeable in cloud architecture and software solutions.",
        task: "Qualify leads for IT services and answer technical capability questions.",
        model: "",
        route: "WhatsApp",
        urls: ["https://aws.amazon.com/solutions/"],
        features: {
          locationService: false,
          searchTool: true,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
      },

      // --- E-commerce ---
      {
        businessName: "Urban Threads",
        industry: "E-commerce",
        businessURL: "https://www.urbanthreads.example.com",
        shortDescription:
          "Trendy streetwear and accessories for the modern generation.",
        agentName: "StyleBot",
        triggerCode: "STYLE",
        language: "English",
        tone: "Casual",
        greeting_message:
          "Yo! 🧢 Welcome to Urban Threads. Looking for the latest drop?",
        persona:
          "You are a hype-beast fashion assistant, trendy, cool, and helpful.",
        task: "Suggest outfits, track orders, and handle returns.",
        model: "",
        route: "WhatsApp",
        urls: ["https://www.nike.com/men", "https://www.asos.com/men/"],
        features: {
          locationService: false,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: false },
      },
      {
        businessName: "Gadget Galaxy",
        industry: "E-commerce",
        businessURL: "https://www.gadgetgalaxy.example.com",
        shortDescription:
          "Your one-stop shop for the latest electronics, phones, and smart home tech.",
        agentName: "Gizmo",
        triggerCode: "TECHIE",
        language: "English",
        tone: "Friendly",
        greeting_message:
          "Beep boop! 🤖 I'm Gizmo. Need help finding the perfect gadget?",
        persona: "You are a tech-savvy assistant who loves specs and features.",
        task: "Compare products, check stock availability, and explain technical specs.",
        model: "",
        route: "Messenger",
        urls: ["https://www.apple.com/iphone/", "https://www.samsung.com/us/"],
        features: {
          locationService: false,
          searchTool: true,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
      },

      // --- Insurance/Banks ---
      {
        businessName: "Sentinel Insurance",
        industry: "Insurance/Banks",
        businessURL: "https://www.sentinel.example.com",
        shortDescription:
          "Reliable home, auto, and life insurance for peace of mind.",
        agentName: "Guardian",
        triggerCode: "SAFE",
        language: "English",
        tone: "Empathetic",
        greeting_message:
          "Hello. I'm Guardian, here to help protect what matters most to you.",
        persona:
          "You are a caring and trustworthy insurance agent focused on safety and security.",
        task: "Guide users through claims processes, explain policy details, and provide quotes.",
        model: "",
        route: "WhatsApp",
        urls: [
          "https://www.geico.com/claims/",
          "https://www.statefarm.com/insurance",
        ],
        features: {
          locationService: true,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
      },
      {
        businessName: "Future Trust Bank",
        industry: "Insurance/Banks",
        businessURL: "https://www.futuretrust.example.com",
        shortDescription:
          "Modern banking solutions for personal and business finance.",
        agentName: "BankerBot",
        triggerCode: "BANK",
        language: "English",
        tone: "Formal",
        greeting_message:
          "Welcome to Future Trust Bank. How may I assist with your finances today?",
        persona:
          "You are a secure, formal banking assistant strictly adhering to privacy.",
        task: "Assist with account opening info, branch location, and general banking FAQs.",
        model: "",
        route: "WhatsApp",
        urls: ["https://www.chase.com/personal/banking"],
        features: {
          locationService: true,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: false, delegateToHuman: true },
      },

      // --- Clincs (using user typo "Clincs") ---
      {
        businessName: "City Care Clinic",
        industry: "Clincs",
        businessURL: "https://www.citycare.example.com",
        shortDescription:
          "Walk-in clinic providing general health and urgent care services.",
        agentName: "NurseJoy",
        triggerCode: "CARE",
        language: "English",
        tone: "Empathetic",
        greeting_message:
          "Hi there! I'm NurseJoy. Do you need to book an appointment or ask about services?",
        persona:
          "You are a warm, triage-nurse persona who is calm and reassuring.",
        task: "Schedule appointments, list services, and provide opening hours.",
        model: "",
        route: "WhatsApp",
        urls: ["https://www.mayoclinic.org/patient-visitor-guide"],
        features: {
          locationService: true,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
      },
      {
        businessName: "Bright Smile Dental",
        industry: "Clincs",
        businessURL: "https://www.brightsmile.example.com",
        shortDescription:
          "Cosmetic and family dentistry specializing in smiles.",
        agentName: "ToothFairy",
        triggerCode: "SMILE",
        language: "English",
        tone: "Friendly",
        greeting_message:
          "Keep smiling! 😁 I'm here to help with your dental appointments.",
        persona: "You are a cheerful receptionist for a dental office.",
        task: "Book cleanings, explain procedures (like whitening), and handle cancellations.",
        model: "",
        route: "Viber",
        urls: ["https://www.colgate.com/en-us/oral-health"],
        features: {
          locationService: true,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: false },
      },

      // --- Education ---
      {
        businessName: "Global Lang Academy",
        industry: "Education",
        businessURL: "https://www.globallang.example.com",
        shortDescription:
          "Online language learning platform for professionals.",
        agentName: "TutorTom",
        triggerCode: "LEARN",
        language: "English",
        tone: "Professional",
        greeting_message:
          "Bonjour! Hola! Hello! I'm TutorTom. Ready to learn a new language?",
        persona:
          "You are an encouraging teacher who helps students find the right course.",
        task: "Recommend courses, explain pricing, and troubleshoot login issues.",
        model: "",
        route: "WhatsApp",
        urls: ["https://www.duolingo.com/", "https://www.babel.com"],
        features: {
          locationService: false,
          searchTool: true,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: false },
      },
      {
        businessName: "Ivy Prep Institute",
        industry: "Education",
        businessURL: "https://www.ivyprep.example.com",
        shortDescription:
          "SAT/ACT preparation and college admissions counseling.",
        agentName: "PrepMaster",
        triggerCode: "PREP",
        language: "English",
        tone: "Formal",
        greeting_message:
          "Welcome to Ivy Prep. Let's secure your academic future.",
        persona: "You are a knowledgeable academic counselor.",
        task: "Explain curriculum, schedule tutoring sessions, and provide study tips.",
        model: "",
        route: "WhatsApp",
        urls: ["https://www.collegeboard.org/"],
        features: {
          locationService: false,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
      },

      // --- Travel Agency ---
      {
        businessName: "Wanderlust Travels",
        industry: "Travel Agency",
        businessURL: "https://www.wanderlust.example.com",
        shortDescription:
          "Boutique travel agency creating custom holiday packages.",
        agentName: "GlobeTrotter",
        triggerCode: "TRIP",
        language: "English",
        tone: "Friendly",
        greeting_message:
          "Adventure awaits! ✈️ I'm GlobeTrotter. Where do you want to go?",
        persona:
          "You are an enthusiastic travel agent who loves discovering new places.",
        task: "Suggest destinations, book flights/hotels, and check visa requirements.",
        model: "",
        route: "WhatsApp",
        urls: ["https://www.lonelyplanet.com/", "https://www.expedia.com/"],
        features: {
          locationService: false,
          searchTool: true,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
      },

      // --- Hospitality ---
      {
        businessName: "Grand Horizon Hotel",
        industry: "Hospitality",
        businessURL: "https://www.grandhorizon.example.com",
        shortDescription:
          "Luxury 5-star accommodation with spa and fine dining.",
        agentName: "Concierge",
        triggerCode: "STAY",
        language: "English",
        tone: "Formal",
        greeting_message:
          "Welcome to Grand Horizon. How may I serve you today?",
        persona: "You are a polite, high-end hotel concierge.",
        task: "Room service orders, spa bookings, and local recommendations.",
        model: "",
        route: "WhatsApp",
        urls: ["https://www.marriott.com/default.mi"],
        features: {
          locationService: true,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: false, delegateToHuman: true },
      },
      {
        businessName: "Burger Bistro",
        industry: "Hospitality",
        businessURL: "https://www.burgerbistro.example.com",
        shortDescription:
          "Gourmet burger joint serving locally sourced ingredients.",
        agentName: "ChefMate",
        triggerCode: "YUM",
        language: "English",
        tone: "Casual",
        greeting_message: "Hungry? 🍔 I'm ChefMate. Ready to take your order!",
        persona: "You are a friendly waiter helping with the menu.",
        task: "Take takeout orders, explain ingredients, and book tables.",
        model: "",
        route: "Messenger",
        urls: ["https://www.ubereats.com/"],
        features: {
          locationService: true,
          searchTool: false,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: false },
      },

      // --- Others ---
      {
        businessName: "Solaris Energy",
        industry: "Others",
        businessURL: "https://www.solaris.example.com",
        shortDescription:
          "Renewable solar energy solutions for residential homes.",
        agentName: "Sunny",
        triggerCode: "SOLAR",
        language: "English",
        tone: "Professional",
        greeting_message:
          "Let's go green! ☀️ I'm Sunny. Interested in solar panels?",
        persona: "You are an eco-friendly consultant.",
        task: "Calculate potential savings, explain installation, and schedule surveys.",
        model: "",
        route: "WhatsApp",
        urls: [
          "https://www.energy.gov/eere/solar/homeowners-guide-going-solar",
        ],
        features: {
          locationService: true,
          searchTool: true,
          knowledgeBase: true,
        },
        possibleActions: { updateContactTable: true, delegateToHuman: true },
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
      if (!config.language) {
        setResultMessage({ type: "error", text: "Enter the Agent Language" });
        return false;
      }
      if (!config.tone) {
        setResultMessage({ type: "error", text: "Enter the Agent Tone" });
        return false;
      }
      if (!config.greeting_message) {
        setResultMessage({ type: "error", text: "Enter a Greeting Message" });
        return false;
      }
      if (!config.persona) {
        setResultMessage({ type: "error", text: "Enter the Agent Persona" });
        return false;
      }
      if (!config.task) {
        setResultMessage({ type: "error", text: "Enter the Agent Task" });
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
    const organizationId =
      typeof crypto !== "undefined" ? crypto.randomUUID() : `org-${Date.now()}`;

    const uploadDocuments = async () => {
      if (!config.documents.length) return { refs: [], urls: [] };

      const uploads = await Promise.all(
        config.documents.map(async (file) => {
          const form = new FormData();
          form.append("file", file);
          form.append("agent_id", config.id);
          form.append("organization_id", organizationId);

          const res = await fetch("/api/uploads", {
            method: "POST",
            body: form,
          });

          // Safely parse JSON responses; many servers return plain text on errors
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let json: any = null;
          const text = await res.text();
          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            json = null;
          }

          if (!res.ok) {
            const errMsg =
              json?.error ||
              text ||
              `Upload failed for ${file.name} (status ${res.status})`;
            throw new Error(errMsg);
          }

          if (!json?.success) {
            throw new Error(json?.error || `Upload failed for ${file.name}`);
          }

          // Expect { data: { id, url } }
          const uploadedId = json?.data?.id || json?.data?.url || file.name;
          const uploadedUrl = json?.data?.url || "";
          return { id: uploadedId as string, url: uploadedUrl as string };
        })
      );

      return {
        refs: uploads.map((u) => u.id),
        urls: uploads.map((u) => u.url).filter(Boolean),
      };
    };

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
          const text = await qrResponse.text();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let qrData: any = null;
          try {
            qrData = text ? JSON.parse(text) : null;
          } catch {
            qrData = null;
          }
          if (qrData?.success && qrData.qrCodeUrl) {
            qrCodeBase64 = qrData.qrCodeUrl;
          }
        }
      } catch (qrErr) {
        console.warn("QR Generation skipped due to error", qrErr);
      }

      // 2. Upload documents (PDFs) to Symbiosis
      setDeployStep("Uploading knowledge base PDFs...");
      const { refs: documentRefs, urls: uploadedUrls } =
        await uploadDocuments();

      // 3. Save to Database
      setDeployStep("Saving to Database...");
      const result = await saveAgentConfigToDB(
        {
          ...config,
          qrCode: qrCodeBase64,
        },
        documentRefs,
        uploadedUrls,
        organizationId
      );

      if (result.success) {
        setResultMessage({ type: "success", text: result.message });
        setDeployed(true);
        setShowPopup(true);
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

  const handleContinue = () => {
    setShowPopup(false);
    setTimeout(() => router.push("/dashboard"), 1000);
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
            ${
              resultMessage.type === "success"
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
                  required={true}
                  tooltip="The name of your business or organization."
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                />
                <TextInput
                  label="Business Website"
                  placeholder="e.g. https://www.telerivet.com"
                  value={config.businessURL}
                  disabled={deployed}
                  tooltip="The official website URL of your business."
                  onChange={(e) =>
                    handleInputChange("businessURL", e.target.value)
                  }
                />
                <SelectInput
                  label="Industry"
                  value={config.industry}
                  options={industries}
                  disabled={deployed}
                  required={true}
                  tooltip="The industry your business operates in."
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                />

                <TextInput
                  label="Short Description"
                  placeholder="Briefly describe your business..."
                  value={config.shortDescription}
                  disabled={deployed}
                  tooltip="A brief description of your business for context."
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
                  required={true}
                  tooltip="The name of your AI agent."
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
                    required={true}
                    tooltip="The language your agent will use."
                    onChange={(e) =>
                      handleInputChange("language", e.target.value)
                    }
                  />
                  <SelectInput
                    label="Agent Tone"
                    value={config.tone}
                    options={tones}
                    disabled={deployed}
                    required={true}
                    tooltip="The tone/style of communication for your agent."
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center justify-between gap-1">
                    <span>
                      Agent Features{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                    <div className="group relative ml-1">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                      {/* Tooltip Popup */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                        Select additional features to enhance your agent&apos;s
                        capabilities.
                        {/* Tiny arrow pointing down */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Checkbox
                      label="Location Service"
                      checked={Boolean(config.features?.locationService)}
                      disabled={deployed}
                      onChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          features: {
                            ...(prev.features ?? {
                              locationService: false,
                              searchTool: false,
                              knowledgeBase: false,
                            }),
                            locationService: checked,
                          },
                        }))
                      }
                    />
                    <Checkbox
                      label="Search Tool"
                      checked={Boolean(config.features?.searchTool)}
                      disabled={deployed}
                      onChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          features: {
                            ...(prev.features ?? {
                              locationService: false,
                              searchTool: false,
                              knowledgeBase: false,
                            }),
                            searchTool: checked,
                          },
                        }))
                      }
                    />
                    <Checkbox
                      label="Knowledge Base"
                      checked={Boolean(config.features?.knowledgeBase)}
                      disabled={deployed}
                      onChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          features: {
                            ...(prev.features ?? {
                              locationService: false,
                              searchTool: false,
                              knowledgeBase: false,
                            }),
                            knowledgeBase: checked,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                <div
                  onClick={() =>
                    handleIndustryAutoFill(!isIndustryAutoFillMode)
                  }
                  className={`flex items-start p-4  rounded-2xl cursor-pointer transition-all mt-4
                      ${
                        isIndustryAutoFillMode
                        // ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500"
                        // : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                >
                  {/* The Checkbox Square */}
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center mr-3 mt-0.5 transition-colors shrink-0 
                        ${
                          isIndustryAutoFillMode
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                  >
                    {isIndustryAutoFillMode && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>

                  {/* The Text Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 select-none">
                        Automatically populate Greeting, Persona, and Task based
                        on
                        {/* <span className="font-semibold text-blue-600 dark:text-blue-400"> {config.industry || "Industry"}</span>. */}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 select-none">
                      {/* Automatically populate Greeting, Persona, and Task based on */}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {" "}
                        {config.industry || "Industry"}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <TextInput
                  label="Agent Initial Greeting"
                  placeholder="e.g. Hello! How can I assist you today?"
                  value={config.greeting_message}
                  disabled={deployed}
                  required={true}
                  tooltip="The initial greeting message your agent will use."
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
                    required={true}
                    tooltip="Describe the agent's persona in detail."
                    onChange={(e) =>
                      handleInputChange("persona", e.target.value)
                    }
                  />
                  <RichTextEditorMock
                    label="Agent's Task"
                    placeholder="Describe the specific tasks..."
                    value={config.task}
                    disabled={deployed}
                    required={true}
                    tooltip="Describe the specific tasks your agent will perform."
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
                        tooltip="The AI model or project ID to use for the agent."
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                      />
                      <SelectInput
                        label="Route Name"
                        value={config.route}
                        options={route}
                        disabled={deployed}
                        tooltip="The communication route for the agent."
                        onChange={(e) =>
                          handleInputChange("route", e.target.value)
                        }
                      />
                      <div>
                        <TextInput
                          label="Trigger Code"
                          placeholder="e.g. HELLO START"
                          value={config.triggerCode}
                          required={true}
                          disabled={deployed}
                          tooltip="The code users send to activate the agent."
                          onChange={handleTriggerCodeChange}
                          hint="Max 4 words, Uppercase"
                        />
                      </div>
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
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Knowledge Base
              </h2>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center justify-between gap-1">
                  <span>Source URLs</span>
                  <div className="group relative ml-1">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                    {/* Tooltip Popup */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                      Add up to 3 URLs for the agent to reference when assisting
                      users.
                      {/* Tiny arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
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
                    <button
                      onClick={() => handleUrlRemove(index)}
                      className="p-3 mt-2 h-[58px] rounded-xl bg-red-50 text-red-500 cursor-pointer hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <br />
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
              <div className="pt-8">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center justify-between gap-1 mb-4">
                  <span>Upload Documents</span>

                  <div className="group relative ml-1">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                    {/* Tooltip Popup */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                      Upload PDF documents for the agent to use as reference
                      material.
                      {/* Tiny arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
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
                ${
                  deployed
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

      {showPopup && (
        <AgentPopup showPopup={showPopup} onClose={() => setShowPopup(false)} />
        // <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        //   <div className="relative bg-white rounded-2xl p-8 shadow-xl w-[400px] text-center">
        //     {/* Close X button */}
        //     <button
        //       onClick={() => setShowPopup(false)}
        //       className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold text-lg"
        //     >
        //       x
        //     </button>

        //     <h2 className="text-xl font-bold mb-4">Agent Deployed 🚀</h2>
        //     <p className="text-gray-600 mb-6">
        //       Your agent is live and running.
        //     </p>

        //     <button
        //       className="px-6 py-3 bg-blue-600 text-white rounded-xl"
        //       onClick={handleContinue}
        //     >
        //       Continue
        //     </button>
        //   </div>

        // </div>
      )}
    </div>
  );
}
