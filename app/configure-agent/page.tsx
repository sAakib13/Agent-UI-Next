"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Plus,
  UploadCloud,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Zap,
  QrCode,
} from "lucide-react";

// --- Types and Mock Data ---

// Define the shape of the data the form collects
type AgentConfig = {
  agentName: string;
  persona: string;
  task: string;
  urls: string[];
  documents: File[];
  possibleActions: {
    updateContactTable: boolean;
    delegateToHuman: boolean;
  };
};

const mockConfig: AgentConfig = {
  agentName: "Customer Support Bot v2.1",
  persona:
    "A friendly and knowledgeable assistant dedicated to technical support.",
  task: "Identify customer issues, provide troubleshooting steps, and escalate complex problems to human agents.",
  urls: ["https://docs.sahayata.ai/api", "https://knowledge.base/faq"],
  documents: [
    new File([], "Troubleshooting_Guide_v1.pdf", { type: "application/pdf" }),
  ],
  possibleActions: {
    updateContactTable: true,
    delegateToHuman: false,
  },
};

const mockAgentStatus = {
  status: "Active",
  created: "2025-10-01",
  lastUpdated: "2025-11-20 4:21 PM",
};

// --- Reusable Form Components ---

// Component for standard text inputs and textareas
const TextInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isTextArea?: boolean;
  rows?: number;
}> = ({
  label,
  placeholder,
  value,
  onChange,
  isTextArea = false,
  rows = 4,
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-300">{label}</label>
    )}
    {isTextArea ? (
      <textarea
        rows={rows}
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

// Component that mocks a simple Rich Text Editor (RTE)
const RichTextEditorMock: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, placeholder, value, onChange }) => {
  const toolbarItems = [Bold, Italic, Underline, List, ListOrdered];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {/* Mock Toolbar */}
        <div className="flex space-x-2 p-2 border-b border-gray-700">
          {toolbarItems.map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="p-1 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              title={Icon.displayName}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          rows={6}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-4 bg-gray-800 text-white placeholder-gray-500 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};

// Component for the File Drop Zone (adapted from Create Agent)
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
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
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
          Drag & drop documents here or click to browse
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

export default function ConfigureAgentPage() {
  const [config, setConfig] = useState<AgentConfig>(mockConfig);

  const handleInputChange = (
    field: keyof Omit<AgentConfig, "urls" | "documents" | "possibleActions">,
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
    setConfig((prev) => ({ ...prev, urls: [...prev.urls, ""] }));
  };

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

  const handleActionToggle = (action: keyof AgentConfig["possibleActions"]) => {
    setConfig((prev) => ({
      ...prev,
      possibleActions: {
        ...prev.possibleActions,
        [action]: !prev.possibleActions[action],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Agent Configuration Saved:", config);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header and Agent Information */}
      <header className="pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Configure Sahayata Agent
        </h1>
        <p className="text-gray-400 mt-1">
          Customize your agent with templates, knowledge base, and actions
        </p>
      </header>

      {/* Agent Information & Actions */}
      <div className="flex justify-between items-start p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Agent Information
          </h3>
          <p className="text-sm text-gray-400">
            Status:{" "}
            <span className="text-green-400 font-medium">
              {mockAgentStatus.status}
            </span>{" "}
            | Created: {mockAgentStatus.created} | Last Updated:{" "}
            {mockAgentStatus.lastUpdated}
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-sm text-blue-400 border border-blue-600 rounded-lg hover:bg-blue-900/50 transition-colors">
            Rebuild Agent
          </button>
          <button className="px-4 py-2 text-sm text-red-400 border border-red-600 rounded-lg hover:bg-red-900/50 transition-colors">
            Delete Agent
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Agent Configuration (Name, Persona, Task) */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Agent Configuration
          </h2>

          <TextInput
            label="Agent Name"
            placeholder="Enter agent name"
            value={config.agentName}
            onChange={(e) => handleInputChange("agentName", e.target.value)}
          />

          <RichTextEditorMock
            label="Persona"
            placeholder="Describe the agent's persona. (e.g., formal, friendly, expert in X)"
            value={config.persona}
            onChange={(e) => handleInputChange("persona", e.target.value)}
          />

          <RichTextEditorMock
            label="Task"
            placeholder="Describe the agent's task. (e.g., answer FAQs, qualify leads, provide technical support)"
            value={config.task}
            onChange={(e) => handleInputChange("task", e.target.value)}
          />
        </div>

        {/* Knowledge Base Documents */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Knowledge Base Documents
          </h2>

          <FileDropZone
            files={config.documents}
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
          />
        </div>

        {/* URL-based Knowledge Base */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            URL-based Knowledge Base
          </h2>

          <div className="space-y-4">
            {config.urls.map((url, index) => (
              <TextInput
                key={index}
                label={index === 0 ? "URLs" : ""}
                placeholder="https://example.com"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
              />
            ))}
            <button
              type="button"
              onClick={handleAddUrl}
              className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Url
            </button>
          </div>
        </div>

        {/* Possible Actions */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Possible Actions
          </h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-gray-300">
              <input
                type="checkbox"
                checked={config.possibleActions.updateContactTable}
                onChange={() => handleActionToggle("updateContactTable")}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
              />
              <span>Update Contact Table</span>
            </label>
            <label className="flex items-center space-x-3 text-gray-300">
              <input
                type="checkbox"
                checked={config.possibleActions.delegateToHuman}
                onChange={() => handleActionToggle("delegateToHuman")}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
              />
              <span>Delegate to Human at a Particular Stage</span>
            </label>
          </div>
        </div>

        {/* Knowledgebase Sources Summary */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Knowledgebase Sources
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                URLs
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1 pl-4">
                {config.urls
                  .filter((url) => url)
                  .map((url, index) => (
                    <li key={index} className="text-sm truncate">
                      {url}
                    </li>
                  ))}
                {config.urls.filter((url) => url).length === 0 && (
                  <li className="text-sm text-gray-500">No URLs configured.</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Documents
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1 pl-4">
                {config.documents.map((doc, index) => (
                  <li key={index} className="text-sm truncate">
                    {doc.name}
                  </li>
                ))}
                {config.documents.length === 0 && (
                  <li className="text-sm text-gray-500">
                    No documents uploaded.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Test Your Agent Section */}
        <div className="space-y-6 border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">
            Test Your Agent on WhatsApp
          </h2>

          <div className="flex items-center space-x-8">
            {/* Mock QR Code Placeholder */}
            <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
              <QrCode className="w-10 h-10 text-gray-600" />
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-4">
                Scan this QR code with your phone to test your agent on
                WhatsApp.
              </p>
              <button
                type="button"
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium space-x-2"
              >
                <span>Open WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Footer / Action Buttons */}
        <footer className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
          <button
            type="button"
            className="px-6 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => console.log("Cancel clicked")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Configuration
          </button>
        </footer>
      </form>
    </div>
  );
}
