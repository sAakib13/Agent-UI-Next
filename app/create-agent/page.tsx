"use client";
import React, { useState } from "react";
import { ChevronDown, Plus, UploadCloud, Zap } from "lucide-react";

// --- Types and Mock Data ---

// Define the shape of the data the form collects
type AgentConfig = {
  businessName: string;
  industry: string;
  shortDescription: string;
  language: string;
  tone: string;
  urls: string[];
  documents: File[];
};

const initialConfig: AgentConfig = {
  businessName: "",
  industry: "Technology",
  shortDescription: "",
  language: "English",
  tone: "Formal",
  urls: [""], // Start with one empty URL input
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

// --- Reusable Form Components (Defined inline for simplicity) ---

// Component for standard text inputs and textareas
const TextInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isTextArea?: boolean;
}> = ({ label, placeholder, value, onChange, isTextArea = false }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-300">{label}</label>
    )}
    {isTextArea ? (
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    )}
  </div>
);

// Component for select inputs
const SelectInput: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-10 py-2 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

// Component for the File Drop Zone
const FileDropZone: React.FC<{
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
}> = ({ files, onFilesAdded, onFileRemoved }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handlers for drag-and-drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = ""; // Reset input so same file can be selected again
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-900/20"
            : "border-gray-700 bg-gray-800 hover:border-blue-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          id="file-upload-input"
          ref={inputRef}
          multiple
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
        <UploadCloud className="w-8 h-8 mx-auto mb-3 text-gray-500" />
        <p className="text-gray-400">
          Drag & drop files here or click to browse
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: PDF, DOCX
        </p>
      </div>

      {/* Displaying uploaded files */}
      {files.length > 0 && (
        <ul className="text-sm text-gray-400 pt-2 space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700"
            >
              <span className="truncate flex-1">{file.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {Math.round(file.size / 1024)} KB
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemoved(index);
                  }}
                  className="text-red-400 hover:text-red-300 font-medium text-xs ml-2"
                >
                  (Remove)
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function CreateAgentPage() {
  const [config, setConfig] = useState<AgentConfig>(initialConfig);

  // General handler for simple text/select fields
  const handleInputChange = (
    field: keyof Omit<AgentConfig, "urls" | "documents">,
    value: string
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Handler for dynamic URL fields
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...config.urls];
    newUrls[index] = value;
    setConfig((prev) => ({ ...prev, urls: newUrls }));
  };

  const handleAddUrl = () => {
    if (config.urls.length < 3) {
      setConfig((prev) => ({ ...prev, urls: [...prev.urls, ""] }));
    }
  };

  // Handler for file uploads
  const handleFilesAdded = (newFiles: File[]) => {
    setConfig((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newFiles],
    }));
  };

  const handleFileRemoved = (indexToRemove: number) => {
    setConfig((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send 'config' to your Next.js API route here
    console.log("Agent Configuration Submitted:", config);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <header className="pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Sahayata Agent
        </h1>
        <p className="text-gray-400 mt-1">
          Configure your intelligent agent with custom business profiles and
          knowledge bases
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Quick Start Templates */}
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
          <div className="flex justify-between items-center cursor-pointer text-gray-300 hover:text-white transition-colors">
            <h2 className="text-lg font-semibold">Quick Start Templates</h2>
            <ChevronDown className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Select a template to auto-fill your agent configuration
          </p>
        </div>

        {/* Business Profile Section */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Business Profile
          </h2>

          <TextInput
            label="Business Name"
            placeholder="Enter your business name"
            value={config.businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
          />

          <SelectInput
            label="Industry"
            value={config.industry}
            options={industries}
            onChange={(e) => handleInputChange("industry", e.target.value)}
          />

          <TextInput
            label="Short Description"
            placeholder="Brief description of your business"
            value={config.shortDescription}
            onChange={(e) =>
              handleInputChange("shortDescription", e.target.value)
            }
            isTextArea
          />
        </div>

        {/* Agent Behavior Section */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Agent Behavior
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectInput
              label="Language"
              value={config.language}
              options={languages}
              onChange={(e) => handleInputChange("language", e.target.value)}
            />

            <SelectInput
              label="Tone"
              value={config.tone}
              options={tones}
              onChange={(e) => handleInputChange("tone", e.target.value)}
            />
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Knowledge Base
          </h2>

          {/* URL Inputs */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              URLs (up to 3)
            </label>
            {config.urls.map((url, index) => (
              <TextInput
                key={index}
                label="" // Label is handled by the group header
                placeholder="https://example.com"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
              />
            ))}
            {config.urls.length < 3 && (
              <button
                type="button"
                onClick={handleAddUrl}
                className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add URL
              </button>
            )}
          </div>

          {/* Documents Drop Zone */}
          <div className="space-y-2 pt-4">
            <label className="block text-sm font-medium text-gray-300">
              Documents (PDF, DOCX)
            </label>
            <FileDropZone
              files={config.documents}
              onFilesAdded={handleFilesAdded}
              onFileRemoved={handleFileRemoved}
            />
          </div>
        </div>

        {/* Optional Templates Section (Collapsible) */}
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
          <div className="flex justify-between items-center cursor-pointer text-gray-300 hover:text-white transition-colors">
            <h2 className="text-lg font-semibold">Optional Templates</h2>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Form Footer / Action Buttons */}
        {/* Using a fixed, slightly sticky footer for better UX on long forms */}
        <footer className="flex justify-end space-x-4 sticky bottom-0 bg-gray-900 pt-4 border-t border-gray-800">
          <button
            type="button"
            className="px-6 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => console.log("Cancel clicked")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <span>Continue</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </footer>
      </form>
    </div>
  );
}
