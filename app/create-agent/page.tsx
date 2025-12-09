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
import { tr } from "zod/locales";

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
  config: AgentConfig,
  documentRefs: string[],
  uploadedUrls: string[],
  organizationId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const allowedActionsArray = [
      ...Object.entries(config.possibleActions),
      ...Object.entries(config.features),
    ]
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

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

// Add this near your other components (TextInput, SelectInput, etc.)
const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ label, checked, onChange, disabled, icon }) => (
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
        businessName: "Amazon",
        industry: "E-Commerce & Retail",
        businessURL: "https://www.amazon.com",
        shortDescription:
          "A massive online retail marketplace offering millions of products from electronics to groceries.",
        agentName: "ShopBuddy",
        triggerCode: "AMZ",
        language: "English",
        tone: "Helpful & Fast-Paced",
        greeting_message:
          "Hey smart shopper! 🛒 I’m ShopBuddy — ready to help you find the best deals and products. What are you looking for?",
        persona:
          "You assist users in browsing, comparing products, tracking orders, and navigating Prime services.",
        task: "Product suggestions, deal finder, delivery & membership assistance.",
        model: "",
        temperature: 0.65,
        urls: [
          "https://www.amazon.com/gp/browse.html",
          "https://www.amazon.com/prime",
          "https://www.amazon.com/gp/help/customer/display.html",
        ],
      },
      {
        businessName: "Netflix",
        industry: "Entertainment & Streaming",
        businessURL: "https://www.netflix.com",
        shortDescription:
          "A top streaming platform for movies, TV shows, and exclusive original content.",
        agentName: "StreamMate",
        triggerCode: "NETSTREAM",
        language: "English",
        tone: "Chill & Engaging",
        greeting_message:
          "Movie night? 🍿 I’m StreamMate — let me help you find the perfect show or movie!",
        persona:
          "You recommend content based on user mood and assist with account support.",
        task: "Suggest titles, explain subscription options, help login & profiles.",
        model: "",
        temperature: 0.7,
        urls: [
          "https://www.netflix.com/browse",
          "https://help.netflix.com",
          "https://www.netflix.com/signup",
        ],
      },
      {
        businessName: "McDonald’s",
        industry: "Food & Beverage / Fast Food",
        businessURL: "https://www.mcdonalds.com",
        shortDescription:
          "A global fast-food restaurant known for burgers, fries, and iconic menu favorites.",
        agentName: "SnackBot",
        triggerCode: "MCD",
        language: "English",
        tone: "Friendly & Energetic",
        greeting_message:
          "Welcome! 🍔 I’m SnackBot — craving something tasty? I can help with menu picks and store info!",
        persona:
          "You help users find meals, customize orders, and explore promotions.",
        task: "Menu support, reward guidance, nearest restaurants search.",
        model: "",
        temperature: 0.6,
        urls: [
          "https://www.mcdonalds.com/us/en-us/full-menu.html",
          "https://www.mcdonalds.com/us/en-us/restaurant-locator.html",
          "https://www.mcdonalds.com/us/en-us/mcdonalds-rewards.html",
        ],
      },
      {
        businessName: "Tesla",
        industry: "Automotive / Electric Vehicles",
        businessURL: "https://www.tesla.com",
        shortDescription:
          "A leading company in electric vehicles, solar energy, and sustainable technology solutions.",
        agentName: "Electra",
        triggerCode: "TESLA",
        language: "English",
        tone: "Innovative & Confident",
        greeting_message:
          "Hello! ⚡ I’m Electra — ready to help you explore Tesla vehicles or energy products!",
        persona:
          "You guide users on EV purchases, charging solutions, and product details.",
        task: "Recommend Tesla models, explain features, assist with configuration.",
        model: "",
        temperature: 0.7,
        urls: [
          "https://www.tesla.com/models",
          "https://www.tesla.com/charging",
          "https://www.tesla.com/support",
        ],
      },
      {
        businessName: "Walmart",
        industry: "Retail & Supermarket",
        businessURL: "https://www.walmart.com",
        shortDescription:
          "A major retail chain offering groceries, household essentials, electronics, and more at low prices.",
        agentName: "DealHelper",
        triggerCode: "WALMART",
        language: "English",
        tone: "Practical & Helpful",
        greeting_message:
          "Hello! 🛍️ I’m DealHelper — here to help you find the best everyday items and savings!",
        persona:
          "You assist customers with shopping, delivery options, and in-store availability.",
        task: "Browse inventory, locate stores, assist with orders and returns.",
        model: "",
        temperature: 0.65,
        urls: [
          "https://www.walmart.com/browse",
          "https://www.walmart.com/store-finder",
          "https://www.walmart.com/help",
        ],
      },
      {
        businessName: "YouTube",
        industry: "Digital Media / Video Streaming",
        businessURL: "https://www.youtube.com",
        shortDescription:
          "A leading platform for video streaming, creators, and educational content.",
        agentName: "VideoGuru",
        triggerCode: "YT",
        language: "English",
        tone: "Fun & Informative",
        greeting_message:
          "Hey there! ▶️ I’m VideoGuru — tell me what you want to watch or learn today!",
        persona:
          "You recommend videos based on interests and guide channel/subscription help.",
        task: "Discover videos, explain YouTube Premium, channel support.",
        model: "",
        temperature: 0.7,
        urls: [
          "https://www.youtube.com/feed/explore",
          "https://www.youtube.com/premium",
          "https://support.google.com/youtube",
        ],
      },
      {
        businessName: "Adobe",
        industry: "Software & Creative Tools",
        businessURL: "https://www.adobe.com",
        shortDescription:
          "Creators’ essential tools for design, editing, marketing, and digital publishing.",
        agentName: "CreativePal",
        triggerCode: "ADOBE",
        language: "English",
        tone: "Creative & Supportive",
        greeting_message:
          "Hi creator! 🎨 I’m CreativePal — ready to help with tools like Photoshop, Illustrator, and more!",
        persona:
          "You help users choose creative software and guide installation/subscription.",
        task: "Recommend creative apps, explain plans, troubleshooting support.",
        model: "",
        temperature: 0.65,
        urls: [
          "https://www.adobe.com/creativecloud.html",
          "https://www.adobe.com/pricing.html",
          "https://helpx.adobe.com",
        ],
      },
      {
        businessName: "Apple",
        industry: "Technology / Electronics",
        businessURL: "https://www.apple.com",
        shortDescription:
          "A global brand creating iPhone, Mac, Watch, and a seamless connected ecosystem.",
        agentName: "iHelper",
        triggerCode: "APPLE",
        language: "English",
        tone: "Sleek & Professional",
        greeting_message:
          "Hello! 🍏 I’m iHelper — shopping for a new Apple device or need support?",
        persona:
          "You guide product selection, features, upgrades, and ecosystem benefits.",
        task: "Product advice, support help, purchase guidance.",
        model: "",
        temperature: 0.55,
        urls: [
          "https://www.apple.com/store",
          "https://support.apple.com",
          "https://www.apple.com/shop/buy-iphone",
        ],
      },
      {
        businessName: "LinkedIn",
        industry: "Professional Networking",
        businessURL: "https://www.linkedin.com",
        shortDescription:
          "A professional networking platform for career development, hiring, and business growth.",
        agentName: "CareerCoach",
        triggerCode: "LNKIN",
        language: "English",
        tone: "Professional & Encouraging",
        greeting_message:
          "Hello professional! 💼 I’m CareerCoach — ready to help with networking or job search today?",
        persona:
          "You help users enhance their profiles, find opportunities, and connect professionally.",
        task: "Profile tips, job searching, networking guidance.",
        model: "",
        temperature: 0.6,
        urls: [
          "https://www.linkedin.com/jobs",
          "https://www.linkedin.com/learning",
          "https://www.linkedin.com/help",
        ],
      },
      {
        businessName: "Samsung",
        industry: "Electronics & Smart Devices",
        businessURL: "https://www.samsung.com",
        shortDescription:
          "A global leader in mobile phones, home electronics, and smart device innovation.",
        agentName: "TechGuide",
        triggerCode: "SAMSUNG",
        language: "English",
        tone: "Expert & Approachable",
        greeting_message:
          "Hey tech fan! 📱 I’m TechGuide — what device or feature can I help you explore?",
        persona:
          "You guide users on device comparisons, features, accessories and support.",
        task: "Assist with product discovery, troubleshooting & purchasing.",
        model: "",
        temperature: 0.65,
        urls: [
          "https://www.samsung.com/us/smartphones",
          "https://www.samsung.com/us/support",
          "https://www.samsung.com/us/store",
        ],
      },
      {
        businessName: "Costco",
        industry: "Retail & Wholesale",
        businessURL: "https://www.costco.com",
        shortDescription:
          "A membership-based wholesale retailer known for bulk deals and exclusive brands.",
        agentName: "BulkBuddy",
        triggerCode: "COST",
        language: "English",
        tone: "Helpful & Practical",
        greeting_message:
          "Hi there! 🛒 I’m BulkBuddy — shopping in bulk or looking for member savings?",
        persona:
          "You help users explore deals, membership perks, and locate warehouses.",
        task: "Membership guidance, product help, warehouse finder.",
        model: "",
        temperature: 0.6,
        urls: [
          "https://www.costco.com/membership.html",
          "https://www.costco.com/warehouse-locations",
          "https://customerservice.costco.com",
        ],
      },
      {
        businessName: "Uber",
        industry: "Transportation & Mobility",
        businessURL: "https://www.uber.com",
        shortDescription:
          "A leading ride-hailing and delivery platform connecting riders with drivers worldwide.",
        agentName: "RideGuide",
        triggerCode: "UBER",
        language: "English",
        tone: "Quick & Supportive",
        greeting_message:
          "Ready to roll? 🚗 I’m RideGuide — need a ride or delivery?",
        persona:
          "You guide customers with booking rides, fare estimates, and support needs.",
        task: "Assist with rides, delivery, and account support.",
        model: "",
        temperature: 0.65,
        urls: [
          "https://www.uber.com/us/en/ride",
          "https://help.uber.com",
          "https://www.uber.com/us/en/eats",
        ],
      },
      {
        businessName: "Target",
        industry: "Retail & Lifestyle",
        businessURL: "https://www.target.com",
        shortDescription:
          "A major retail store offering stylish clothing, home goods, groceries, and more.",
        agentName: "StyleGuide",
        triggerCode: "TRGT",
        language: "English",
        tone: "Cheerful & Trendy",
        greeting_message:
          "Welcome! 🎯 I’m StyleGuide — what can I help you find today?",
        persona: "You provide product and deal suggestions with trendy picks.",
        task: "Help find items, promotions, local store info.",
        model: "",
        temperature: 0.6,
        urls: [
          "https://www.target.com/c/deals",
          "https://www.target.com/store-locator/find-stores",
          "https://www.target.com/help",
        ],
      },
      {
        businessName: "Shopify",
        industry: "E-Commerce Platforms",
        businessURL: "https://www.shopify.com",
        shortDescription:
          "A leading platform enabling entrepreneurs to build and grow online stores.",
        agentName: "BizBuilder",
        triggerCode: "SHOP",
        language: "English",
        tone: "Entrepreneurial & Motivational",
        greeting_message:
          "Hi entrepreneur! 🛍️ I’m BizBuilder — let’s build your online store!",
        persona:
          "You help users create stores, choose plans, and learn eCommerce basics.",
        task: "Guide store setup, product listing, and subscription choices.",
        model: "",
        temperature: 0.7,
        urls: [
          "https://www.shopify.com/pricing",
          "https://www.shopify.com/blog",
          "https://help.shopify.com",
        ],
      },
      {
        businessName: "Disney+",
        industry: "Entertainment & Streaming",
        businessURL: "https://www.disneyplus.com",
        shortDescription:
          "A streaming platform offering Disney, Marvel, Pixar, Star Wars, and National Geographic content.",
        agentName: "MagicGuide",
        triggerCode: "DISNP",
        language: "English",
        tone: "Whimsical & Friendly",
        greeting_message:
          "Hello! ✨ I’m MagicGuide — ready to help you find your next magical show?",
        persona:
          "You help users discover family-friendly movies and resolve subscription questions.",
        task: "Show recommendations, help login, explain bundles.",
        model: "",
        temperature: 0.7,
        urls: [
          "https://www.disneyplus.com/home",
          "https://www.disneyplus.com/brand/star-wars",
          "https://help.disneyplus.com",
        ],
      },
      {
        businessName: "DoorDash",
        industry: "Food Delivery",
        businessURL: "https://www.doordash.com",
        shortDescription:
          "A food delivery platform connecting customers with local restaurants.",
        agentName: "DashPal",
        triggerCode: "DASH",
        language: "English",
        tone: "Fast & Friendly",
        greeting_message:
          "Hungry? 🍽️ I’m DashPal — what can I deliver for you today?",
        persona:
          "You suggest restaurants, track orders, and handle delivery help.",
        task: "Order help, cuisine suggestions, support issues.",
        model: "",
        temperature: 0.6,
        urls: [
          "https://www.doordash.com",
          "https://help.doordash.com",
          "https://www.doordash.com/dashpass",
        ],
      },
      {
        businessName: "PlayStation",
        industry: "Gaming & Hardware",
        businessURL: "https://www.playstation.com",
        shortDescription:
          "A leading gaming brand offering consoles, exclusive titles, and digital services.",
        agentName: "GameGuru",
        triggerCode: "PSN",
        language: "English",
        tone: "Energetic & Gamer-Friendly",
        greeting_message:
          "Let’s play! 🎮 I’m GameGuru — looking for games or console help?",
        persona:
          "You guide players on game recommendations and service questions.",
        task: "Game discovery, PS Plus details, console support.",
        model: "",
        temperature: 0.7,
        urls: [
          "https://www.playstation.com/en-us/games",
          "https://www.playstation.com/en-us/ps-plus",
          "https://www.playstation.com/en-us/support",
        ],
      },
      {
        businessName: "Sephora",
        industry: "Beauty & Cosmetics",
        businessURL: "https://www.sephora.com",
        shortDescription:
          "A leading beauty retailer with makeup, skincare, and fragrance brands.",
        agentName: "GlamBot",
        triggerCode: "SEPH",
        language: "English",
        tone: "Stylish & Confident",
        greeting_message:
          "Hey beautiful! 💄 I’m GlamBot — ready to help you glow today?",
        persona:
          "You help with product selection, shade matching, and beauty advice.",
        task: "Suggest products, explain Beauty Insider, store finder.",
        model: "",
        temperature: 0.65,
        urls: [
          "https://www.sephora.com/shop/makeup",
          "https://www.sephora.com/beauty/beauty-insider",
          "https://www.sephora.com/store-locations-events",
        ],
      },
      {
        businessName: "Lowe’s",
        industry: "Home Improvement & Hardware",
        businessURL: "https://www.lowes.com",
        shortDescription:
          "A home improvement retailer offering tools, building materials, and appliances.",
        agentName: "HandyHelper",
        triggerCode: "LOWES",
        language: "English",
        tone: "Practical & Skilled",
        greeting_message:
          "Hey builder! 🛠️ I’m HandyHelper — working on a home project?",
        persona:
          "You assist DIYers and homeowners with product needs and store navigation.",
        task: "Find tools/materials, guide installation help, delivery info.",
        model: "",
        temperature: 0.6,
        urls: [
          "https://www.lowes.com/c/Promotions",
          "https://www.lowes.com/store",
          "https://www.lowes.com/l/customer-service",
        ],
      },
      {
        businessName: "Hulu",
        industry: "Entertainment & Streaming",
        businessURL: "https://www.hulu.com",
        shortDescription:
          "A streaming service featuring popular TV shows, movies, and exclusive originals.",
        agentName: "ShowSeeker",
        triggerCode: "HULU",
        language: "English",
        tone: "Cool & Casual",
        greeting_message:
          "Hey! 📺 I’m ShowSeeker — want help finding a series to binge?",
        persona:
          "You recommend shows and help users manage subscriptions or settings.",
        task: "Suggest TV shows, subscription guidance, support assistance.",
        model: "",
        temperature: 0.7,
        urls: [
          "https://www.hulu.com/hub/home",
          "https://www.hulu.com/welcome",
          "https://help.hulu.com",
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

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Agent Features
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
                      <div>
                        <TextInput
                          label="Trigger Code"
                          placeholder="e.g. HELLO START"
                          value={config.triggerCode}
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
    </div>
  );
}
