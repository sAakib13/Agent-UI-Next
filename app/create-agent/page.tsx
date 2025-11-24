"use client"
import React, { useState } from "react";
import { ChevronDown, Plus, UploadCloud, X } from "lucide-react";

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

// Modern Input Component
const TextInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isTextArea?: boolean;
}> = ({ label, placeholder, value, onChange, isTextArea = false }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    {isTextArea ? (
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder={placeholder}
        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-10 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
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
        className="group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center transition-all hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer"
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
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
        </div>
        <p className="text-gray-900 dark:text-white font-medium">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">PDF, DOCX (Max 10MB)</p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
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
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500 transition-colors"
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

export default function CreateAgentPage() {
  const [config, setConfig] = useState<AgentConfig>(initialConfig);

  const handleInputChange = (
    field: keyof Omit<AgentConfig, "urls" | "documents">,
    value: string
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

  const handleFilesAdded = (newFiles: File[]) => {
    setConfig((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newFiles],
    }));
  };

  const handleFileRemoved = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create Sahayata Agent
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Set up your intelligent agent in just a few steps.
        </p>
      </header>

      <form className="space-y-8">
        {/* Template Selector */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                Quick Start Templates
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Pre-configured setups for common use cases.
              </p>
            </div>
            <ChevronDown className="w-5 h-5 text-blue-700 dark:text-blue-300" />
          </div>
        </div>

        {/* Card: Business Profile */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Business Profile
          </h2>
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
              onChange={(e) => handleInputChange("industry", e.target.value)}
            />
            <TextInput
              label="Short Description"
              placeholder="Describe what your business does..."
              value={config.shortDescription}
              onChange={(e) =>
                handleInputChange("shortDescription", e.target.value)
              }
              isTextArea
            />
          </div>
        </div>

        {/* Card: Behavior */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
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

        {/* Card: Knowledge Base */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Knowledge Base
          </h2>
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                Source URLs
              </label>
              {config.urls.map((url, index) => (
                <TextInput
                  key={index}
                  label=""
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                />
              ))}
              {config.urls.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline pl-1"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add another URL
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                Upload Documents
              </label>
              <FileDropZone
                files={config.documents}
                onFilesAdded={handleFilesAdded}
                onFileRemoved={handleFileRemoved}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 right-0 left-0 lg:left-72 p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 z-40">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
            Create Agent
          </button>
        </footer>
      </form>
    </div>
  );
}
