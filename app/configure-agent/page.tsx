"use client"

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
  X,
} from "lucide-react";

type AgentConfig = {
  agentName: string;
  persona: string;
  task: string;
  urls: string[];
  documents: File[];
  possibleActions: { updateContactTable: boolean; delegateToHuman: boolean };
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
  possibleActions: { updateContactTable: true, delegateToHuman: false },
};

const TextInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}> = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange as any}
      placeholder={placeholder}
      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
    />
  </div>
);

const RichTextEditorMock: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
      {label}
    </label>
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      <div className="flex space-x-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800">
        {[Bold, Italic, Underline, List, ListOrdered].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
        className="w-full p-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none"
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
        className="group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center transition-all hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer"
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
        <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Click to upload documents
        </p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
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

export default function ConfigureAgentPage() {
  const [config, setConfig] = useState<AgentConfig>(mockConfig);
  const handleInputChange = (field: any, value: string) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Configure Agent
        </h1>
      </header>

      {/* Status Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Agent Status
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-500">Last updated: Today, 4:21 PM</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            Rebuild
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Core Configuration
            </h2>
            <TextInput
              label="Agent Name"
              placeholder="Agent Name"
              value={config.agentName}
              onChange={(e) => handleInputChange("agentName", e.target.value)}
            />
            <RichTextEditorMock
              label="Persona"
              placeholder="Describe persona..."
              value={config.persona}
              onChange={(e) => handleInputChange("persona", e.target.value)}
            />
            <RichTextEditorMock
              label="Task"
              placeholder="Describe task..."
              value={config.task}
              onChange={(e) => handleInputChange("task", e.target.value)}
            />
          </section>

          <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Knowledge Base
            </h2>
            <FileDropZone
              files={config.documents}
              onFilesAdded={() => {}}
              onFileRemoved={() => {}}
            />
            <div className="space-y-3 pt-4">
              {config.urls.map((url, i) => (
                <TextInput
                  key={i}
                  label={i === 0 ? "Source URLs" : ""}
                  placeholder="https://"
                  value={url}
                  onChange={() => {}}
                />
              ))}
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add URL
              </button>
            </div>
          </section>
        </div>

        {/* Side Column */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Actions
            </h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.possibleActions.updateContactTable}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    Update Contact Table
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Allow agent to modify records
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.possibleActions.delegateToHuman}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    Human Delegation
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Transfer to agent when stuck
                  </span>
                </div>
              </label>
            </div>
          </section>

          <section className="bg-gradient-to-b from-gray-900 to-gray-800 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-6 h-6 text-white/80" />
              <h2 className="text-lg font-bold">Test Live</h2>
            </div>
            <p className="text-sm text-white/60 mb-6">
              Scan to chat with this agent configuration on WhatsApp instantly.
            </p>
            <button className="w-full py-2 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
              Open WhatsApp
            </button>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 left-0 lg:left-72 p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 z-40">
        <button
          type="button"
          className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Discard Changes
        </button>
        <button
          type="button"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
        >
          Save Config
        </button>
      </footer>
    </div>
  );
}
