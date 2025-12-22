"use client";

import React, { useState } from "react";
import {
  Book,
  Code,
  Database,
  Server,
  Layers,
  Search,
  ChevronRight,
  Terminal,
  Shield,
  Bot,
  Lock,
  Key,
  Workflow,
  Fingerprint,
  Copy,
  Check,
  Menu,
  X,
  QrCode,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Map,
} from "lucide-react";

// --- 1. AI Context Prompt (The "Brain") ---
const aiContextPrompt = `
YOU ARE WORKING ON PROJECT: SAHAYATA AGENT (NEXT GEN)

--- ARCHITECTURE: SPLIT STACK ---
1. Identity Provider: Supabase Auth (Handles Users, Sessions, JWTs).
2. Data Store: External PostgreSQL (Handles Business Data).
3. The Bridge: Next.js Middleware & API Routes link "Supabase User ID" to "Postgres owner_id".

--- TECH STACK ---
- Framework: Next.js 16 (App Router)
- Auth: @supabase/ssr + @supabase/supabase-js
- Database: PostgreSQL (Direct connection via 'pg' library)
- Styling: Tailwind CSS 4 + Framer Motion
- State: React 19 Hooks

--- DATABASE SCHEMA (External Postgres) ---
TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  owner_id UUID NOT NULL, -- Links to Supabase auth.users.id
  industry VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

TABLE agents (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255),
  allowed_actions JSONB DEFAULT '[]', -- Snake_case actions
  model_config JSONB DEFAULT '{}',
  document_refs JSONB DEFAULT '[]',
  greeting_message TEXT,
  qr_code_base64 TEXT
);

--- CODING RULES ---
1. PROTECTED ROUTES: All API routes must verify Supabase session first.
2. ROW LEVEL SECURITY (LOGICAL): Every SELECT must include "WHERE owner_id = user.id" (via organization join).
3. MIDDLEWARE: middleware.ts protects /dashboard and /create-agent.
`.trim();

// --- 2. Documentation Data Structure ---

type DocSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  tags: string[];
  content: React.ReactNode;
};

// --- Helper Component: CopyBlock ---
const CopyBlock = ({
  text,
  label = "SQL",
}: {
  text: string;
  label?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 my-4">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
        {text}
      </pre>
    </div>
  );
};

// --- Documentation Content ---
const docSections: DocSection[] = [
  {
    id: "ai-context",
    title: "AI System Prompt",
    icon: Bot,
    description:
      "Bootstrap Cursor or any LLM with the project context immediately.",
    tags: ["cursor", "llm", "setup"],
    content: (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
            Why this matters?
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            AI tools usually "guess" your schema. By copying the block below
            into your <strong>.cursorrules</strong> file or chat window, you
            force the AI to understand your exact "Split Stack" architecture
            (Supabase + External Postgres) instantly.
          </p>
        </div>
        <CopyBlock
          text={aiContextPrompt}
          label="SYSTEM PROMPT / .cursorrules"
        />
      </div>
    ),
  },
  {
    id: "architecture",
    title: "Architecture Overview",
    icon: Layers,
    description:
      "Understanding the Split Stack: Supabase Auth + External Postgres.",
    tags: ["supabase", "postgres", "security"],
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              1. Identity (Supabase)
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Handles Sign Up, Login, Password Reset, and Magic Links. It issues
              a <strong>JWT Session</strong> containing a unique User UUID.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              2. Data (External Postgres)
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stores your actual business data (Agents, Organizations). It does{" "}
              <strong>not</strong> have a foreign key to Supabase users.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "pages-structure",
    title: "Pages & Routing",
    icon: Map,
    description: "Map of the application interface and route purposes.",
    tags: ["routes", "ui", "navigation"],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The application is divided into public authentication pages and a
          protected dashboard area.
        </p>

        <div className="space-y-4">
          {/* Dashboard */}
          <div className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <div className="mt-1">
              <LayoutDashboard className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                /dashboard
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  PROTECTED
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The main landing page after login. Displays metrics (active
                agents, documents) and includes a <strong>Sandbox</strong> for
                testing agent greeting messages and QR codes.
              </p>
            </div>
          </div>

          {/* Create Agent */}
          <div className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <div className="mt-1">
              <PlusCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                /create-agent
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  PROTECTED
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A multi-step wizard. Step 1: Business Profile. Step 2: Agent
                Persona & Features. Step 3: Knowledge Base Uploads.
                <br />
                <em>
                  Triggers document upload and QR generation upon submission.
                </em>
              </p>
            </div>
          </div>

          {/* Configure Agent */}
          <div className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <div className="mt-1">
              <Settings className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                /configure-agent
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  PROTECTED
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Management list view. Allows editing existing agents, updating
                prompts, and viewing uploaded files.
              </p>
            </div>
          </div>

          {/* Auth Pages */}
          <div className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="mt-1">
              <Shield className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                /login & /register
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  PUBLIC
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supabase authentication pages. <code>/register</code> sends
                email verification. <code>/auth/callback</code> handles the
                verification redirect.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: Terminal,
    description: "Detailed documentation of all backend endpoints.",
    tags: ["endpoints", "json", "requests", "qr", "uploads"],
    content: (
      <div className="space-y-12">
        {/* GET AGENTS */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md tracking-wide">
              GET
            </span>
            <code className="text-lg font-mono font-semibold text-slate-900 dark:text-white">
              /api/agents
            </code>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Fetches all agents belonging to the authenticated user.
            Automatically filters by joining the <code>organizations</code>{" "}
            table.
          </p>
          <CopyBlock
            label="RESPONSE EXAMPLE (200 OK)"
            text={`{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "agent_name": "Support Bot",
      "status": "Training",
      "business_name": "Acme Corp",
      "actions": ["updateContactTable", "web_search_tool"]
    }
  ]
}`}
          />
        </section>

        {/* POST AGENTS */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md tracking-wide">
              POST
            </span>
            <code className="text-lg font-mono font-semibold text-slate-900 dark:text-white">
              /api/agents
            </code>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Creates a new Organization and Agent in a single transaction. The
            backend automatically extracts the user ID from the session to set
            ownership.
          </p>
          <CopyBlock
            label="REQUEST BODY"
            text={`{
  "organization": {
    "name": "My Business",
    "industry": "Retail",
    "website": "https://example.com"
  },
  "agents": [
    {
      "name": "Sales Agent",
      "language": "English",
      "tone": "Friendly",
      "allowed_actions": ["nearby_search_tool", "web_search_tool"],
      "greeting_message": "Hello! How can I help you buy?"
    }
  ]
}`}
          />
        </section>

        {/* UPLOADS */}
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Document Uploads
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Proxies PDF uploads to the external Knowledge Base provider
            (Symbiosis). Files must be under 10MB.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md tracking-wide">
              POST
            </span>
            <code className="text-lg font-mono font-semibold text-slate-900 dark:text-white">
              /api/uploads
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Request Body (FormData)
              </p>
              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-2 font-mono bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <li>
                  <span className="font-bold text-slate-900 dark:text-white">
                    file
                  </span>
                  : (Binary) PDF file
                </li>
                <li>
                  <span className="font-bold text-slate-900 dark:text-white">
                    agent_id
                  </span>
                  : UUID
                </li>
                <li>
                  <span className="font-bold text-slate-900 dark:text-white">
                    organization_id
                  </span>
                  : UUID
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Response
              </p>
              <CopyBlock
                label="JSON Response"
                text={`{
  "success": true,
  "data": {
    "id": "doc-uuid-123",
    "url": "https://storage.symbiosis.com/..."
  }
}`}
              />
            </div>
          </div>
        </section>

        {/* QR GENERATION */}
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              QR Integrations
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Generates WhatsApp activation QR codes via Symbiosis API.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md tracking-wide">
              POST
            </span>
            <code className="text-lg font-mono font-semibold text-slate-900 dark:text-white">
              /api/integrations/qr
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Request Body
              </p>
              <CopyBlock
                label="JSON Payload"
                text={`{
  "agentId": "uuid-string",
  "agentName": "Support Agent",
  "businessName": "Acme Corp",
  "triggerCode": "HELP" // Optional
}`}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Response
              </p>
              <CopyBlock
                label="JSON Response"
                text={`{
  "success": true,
  "qrCodeUrl": "data:image/png;base64,iVB...",
  "message": "QR generated with trigger: HELP",
  "usedTriggerCode": "HELP"
}`}
              />
            </div>
          </div>
        </section>
      </div>
    ),
  },
  {
    id: "database",
    title: "Database Schema",
    icon: Database,
    description: "SQL definitions for the External Postgres database.",
    tags: ["sql", "tables", "schema"],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Run these SQL commands on your external PostgreSQL instance to set up
          the tables required for the application.
        </p>
        <CopyBlock
          label="SQL MIGRATION"
          text={`-- 1. Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL, -- The Supabase User ID stored as UUID/String
  website VARCHAR(255),
  industry VARCHAR(255),
  short_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup by user
CREATE INDEX idx_org_owner ON organizations(owner_id);

-- 2. Agents Table
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  language VARCHAR(50),
  tone VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Training',
  persona_prompt TEXT,
  task_prompt TEXT,
  trigger_code VARCHAR(50),
  allowed_actions JSONB DEFAULT '[]'::jsonb,
  greeting_message TEXT,
  qr_code_base64 TEXT,
  document_refs JSONB DEFAULT '[]'::jsonb,
  source_urls JSONB DEFAULT '[]'::jsonb,
  model_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);`}
        />
      </div>
    ),
  },
];

export default function DocsPage() {
  // --- State ---
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorShake, setErrorShake] = useState(false);

  const [activeSection, setActiveSection] = useState<string>(docSections[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Password Logic ---
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "open1") {
      setIsLocked(false);
    } else {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      setPasswordInput("");
    }
  };

  // --- Filter Logic ---
  const filteredSections = docSections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.includes(searchQuery.toLowerCase()))
  );

  const currentDoc =
    docSections.find((s) => s.id === activeSection) || docSections[0];

  // --------------------------------------------------------------------------
  // RENDER: LOCKED SCREEN
  // --------------------------------------------------------------------------
  if (isLocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div
          className={`w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 transition-all duration-200 ${
            errorShake ? "translate-x-2 ring-2 ring-red-500/20" : ""
          }`}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
              Protected Docs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2 max-w-[240px]">
              These architectural documents are restricted to authorized
              developers.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative group">
              <Key className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Enter password..."
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Unlock Access
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">Hint: open...</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: MAIN DOCS UI
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* --- Sidebar (Desktop) --- */}
      <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sahayata<span className="font-light">Docs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Split Stack Architecture
          </p>
        </div>

        <div className="p-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <nav className="space-y-1">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <section.icon
                  className={`w-4 h-4 ${
                    activeSection === section.id
                      ? "text-blue-500"
                      : "text-slate-400"
                  }`}
                />
                {section.title}
                {activeSection === section.id && (
                  <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Authenticated Access</span>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="font-bold">Sahayata Docs</span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-0 z-50 bg-white dark:bg-slate-900 p-4">
            <nav className="space-y-2 mt-10">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-left font-medium"
                >
                  <section.icon className="w-5 h-5 text-blue-500" />
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Content Body */}
        <div className="max-w-4xl mx-auto p-6 lg:p-12 space-y-8">
          <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 text-white">
                <currentDoc.icon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {currentDoc.title}
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
              {currentDoc.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {currentDoc.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </header>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {currentDoc.content}
          </div>
          <div className="h-20" /> {/* Bottom spacer */}
        </div>
      </main>
    </div>
  );
}
