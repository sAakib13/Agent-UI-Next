'use client';

import React, { useState } from 'react';
import {
  Book, Code, Database, Server, Layers, Search,
  ChevronRight, Terminal, FileJson, Shield, Bot
} from 'lucide-react';

// --- AI Context Prompt (The "Brain" for Cursor) ---
const aiContextPrompt = `
YOU ARE WORKING ON PROJECT: SAHAYATA AGENT

--- TECH STACK ---
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- Components: Functional React Components (Client & Server)
- Data Fetching: React Hooks (useEffect/useState) for Client, Direct DB calls for API Routes.

--- DATABASE SCHEMA (PostgreSQL) ---
- Host: 52.186.169.156
- Schema: "agentstudio"
- Table: "agents"
- SQL Definition:
  CREATE TABLE IF NOT EXISTS agentstudio.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    persona TEXT,
    task TEXT,
    status VARCHAR(50) DEFAULT 'Training',
    urls JSONB DEFAULT '[]'::jsonb,
    actions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

--- API ROUTES ---
1. CREATE/UPDATE AGENT
   - Endpoint: POST /api/agents
   - Description: Upserts agent config based on 'name'.
   - Body: { agentName, persona, task, urls, possibleActions, status }

--- CODING RULES ---
1. Use 'use client' for any component using hooks (useState, useEffect).
2. Never expose DB credentials in client components; use API routes.
3. Use Lucide-React for all icons.
4. Use Tailwind for all styling (no CSS modules).
`.trim();

// --- Documentation Content Data ---

type DocSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
  tags: string[];
};

const docSections: DocSection[] = [
  {
    id: 'ai-context',
    title: 'AI / Cursor Context',
    icon: Bot,
    tags: ['cursor', 'llm', 'prompt', 'context', 'rules', '.cursorrules'],
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          To make Cursor (or any AI assistant) understand this project immediately, copy the context block below. You can paste this into your <strong>.cursorrules</strong> file in the root directory, or use it as the initial prompt for a new chat session.
        </p>

        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-xl opacity-20 group-hover:opacity-40 transition blur"></div>
          <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                <Bot className="w-3 h-3" />
                <span>System Context / .cursorrules</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(aiContextPrompt)}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md transition-colors font-medium flex items-center gap-2"
              >
                Copy Context
              </button>
            </div>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap h-[400px] overflow-y-auto custom-scrollbar p-1">
              {aiContextPrompt}
            </pre>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
          <h5 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-1">Why this works?</h5>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            AI tools usually have to "guess" your schema or read multiple files to understand relationships. By providing this "Master Prompt", you forcefully align the AI's understanding with your actual database structure (`agentstudio.agents`) and API patterns (`/api/agents`) instantly.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'stack',
    title: 'Technology Stack',
    icon: Layers,
    tags: ['nextjs', 'react', 'typescript', 'tailwind', 'frontend'],
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          The Sahayata Agent platform is built on a modern, type-safe, and high-performance stack designed for enterprise scalability.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-500" /> Frontend Framework
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li><strong>Next.js 14</strong> (App Router) for server-side rendering and routing.</li>
              <li><strong>React 18</strong> for component-based UI architecture.</li>
              <li><strong>TypeScript</strong> for static typing and developer experience.</li>
              <li><strong>Tailwind CSS</strong> for utility-first, responsive styling.</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-green-500" /> Backend & Data
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li><strong>Next.js API Routes</strong> for serverless backend logic.</li>
              <li><strong>PostgreSQL</strong> as the primary relational database.</li>
              <li><strong>node-postgres (pg)</strong> for direct database connections.</li>
              <li><strong>Recharts</strong> for data visualization and analytics.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'database',
    title: 'Database Schema',
    icon: Database,
    tags: ['postgres', 'sql', 'schema', 'agents', 'data'],
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          The application connects to a PostgreSQL instance hosted at <code>52.186.169.156</code>. The primary table is <code>agentstudio.agents</code>.
        </p>
        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
          <pre className="text-sm text-blue-300 font-mono">
            {`CREATE TABLE IF NOT EXISTS agentstudio.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  persona TEXT,
  task TEXT,
  status VARCHAR(50) DEFAULT 'Training',
  urls JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);`}
          </pre>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded border border-yellow-200 dark:border-yellow-800">
            Schema: agentstudio
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
            User: sb_devs
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Terminal,
    tags: ['api', 'endpoints', 'rest', 'telerivet'],
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Internal Endpoints</h4>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded uppercase">POST</span>
              <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/agents</code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Creates a new agent or updates an existing one based on the <code>name</code> unique constraint.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs font-mono text-gray-500 mb-1">Payload:</p>
              <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                {`{
  "agentName": "String",
  "persona": "String",
  "task": "String",
  "urls": ["String"],
  "possibleActions": { ... }
}`}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">External Integrations (Telerivet)</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            The <strong>Client Dashboard</strong> visualizes data directly from Telerivet's REST API.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                <code>GET /projects/&#123;id&#125;/messages</code> - Used for Traffic Charts & Recent Logs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                <code>GET /projects/&#123;id&#125;</code> - Fetches balance and timezone.
              </span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'security',
    title: 'Security & Environment',
    icon: Shield,
    tags: ['env', 'security', 'variables', 'deployment'],
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Application security is managed through environment variables and Next.js built-in protections.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
          <h5 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Important
          </h5>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Never commit <code>.env.local</code> files containing database passwords or API keys. The Postgres credentials currently in the code are for development only and should be moved to environment variables in production.
          </p>
        </div>
        <div className="space-y-2">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Required Environment Variables:</h5>
          <code className="block w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300">
            PG_HOST=52.186.169.156<br />
            PG_USER=sb_devs<br />
            PG_PASSWORD=********<br />
            PG_DATABASE=db_sbdev
          </code>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>(docSections[0].id);

  // Filter sections based on search
  const filteredSections = docSections.filter(section => {
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.tags.some(tag => tag.includes(query)) ||
      // Simple content check (react elements make this tricky, mainly relying on tags/title for robust search)
      JSON.stringify(section.tags).includes(query)
    );
  });

  const currentDoc = docSections.find(s => s.id === activeSection) || docSections[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-blue-500/30 blur-[160px] opacity-70 dark:bg-blue-700/20" />
      <div className="pointer-events-none absolute top-1/3 -left-44 h-80 w-80 rounded-full bg-violet-400/30 blur-[180px] dark:bg-violet-700/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.05),_transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_40%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section className="rounded-[32px] border border-white/60 bg-white/70 px-6 py-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:border-white/10 dark:text-slate-300">
                Docs
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Live
              </span>
              <div>
                <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl dark:text-white">
                  Build, scale, and operate the Sahayata Agent confidently.
                </h1>
                <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
                  Interactive documentation with instant context, database references, and the exact AI prompt we use to bootstrap Cursor.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 dark:border-white/10">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  Next.js 14
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 dark:border-white/10">
                  <Database className="h-3.5 w-3.5 text-green-500" />
                  PostgreSQL
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 dark:border-white/10">
                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                  Secure APIs
                </span>
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 md:w-auto">
              <div className="rounded-2xl border border-white/50 bg-white/80 p-4 text-slate-900 shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:text-white">
                <p className="text-sm text-slate-500 dark:text-slate-400">Docs Coverage</p>
                <p className="mt-2 text-3xl font-bold">{docSections.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">core topics linked to product areas</p>
              </div>
              <div className="rounded-2xl border border-white/50 bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white shadow-lg dark:border-white/10">
                <p className="text-sm text-white/80">AI Context Prompt</p>
                <p className="mt-2 text-3xl font-bold">1</p>
                <p className="text-xs text-white/80">copyable master prompt for Cursor</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-8 pb-10 md:flex-row">
          {/* Sidebar / Table of Contents */}
          <aside className="w-full shrink-0 space-y-6 md:w-80">
            {/* Search Widget */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-blue-500/30 opacity-70 blur-2xl transition duration-500 group-hover:opacity-100 dark:from-blue-600/40 dark:via-indigo-600/40" />
              <div className="relative flex items-center gap-3 rounded-3xl border border-white/60 bg-white/80 px-4 py-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Ask or search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
                />
                <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-300">
                  ⌘K
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {["stack", "api", "security", "cursor"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className="rounded-full border border-slate-200/80 px-3 py-1 text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >
                  #{chip}
                </button>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-full border border-red-200/80 px-3 py-1 text-red-500 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  Clear
                </button>
              )}
            </div>

            <nav className="flex-1 space-y-2 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${activeSection === section.id
                    ? "border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
                    : "border-white/40 bg-white/70 text-slate-600 hover:border-blue-200 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:text-white"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <section.icon
                        className={`h-5 w-5 ${activeSection === section.id
                          ? "text-white"
                          : "text-slate-400 group-hover:text-blue-500"
                          }`}
                      />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    {activeSection === section.id && <ChevronRight className="h-4 w-4 opacity-80" />}
                  </div>
                </button>
              ))}

              {filteredSections.length === 0 && (
                <div className="text-center rounded-2xl border border-dashed border-slate-200/80 p-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <p>No docs found for "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery("")} className="mt-2 text-blue-500 hover:underline dark:text-blue-300">
                    Clear search
                  </button>
                </div>
              )}
            </nav>

            {/* Quick Stats Widget */}
            <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 p-5 text-white shadow-2xl dark:border-white/5 dark:from-indigo-950 dark:via-slate-950 dark:to-slate-900">
              <div className="flex items-center gap-2 mb-3 text-white/70">
                <Book className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Knowledge graph</span>
              </div>
              <div className="flex items-end gap-4">
                <p className="text-4xl font-bold">{docSections.length}</p>
                <p className="text-sm text-white/70">sections documented</p>
              </div>
              <p className="mt-3 text-xs text-white/60">Updated automatically when you edit docs content.</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="relative flex-1 overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 md:p-12">
            <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-10 h-32 w-32 rounded-full bg-indigo-500/15 blur-3xl" />

            {/* Content Header */}
            <div className="relative flex flex-wrap items-center gap-6 border-b border-white/70 pb-8 dark:border-white/10">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-blue-600 shadow-inner dark:border-white/10 dark:bg-blue-500/10 dark:text-blue-300">
                <currentDoc.icon className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{currentDoc.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentDoc.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200/80 px-3 py-1 text-xs font-mono uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="relative mt-10 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
              <div className="prose prose-slate max-w-none leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-100">
                {currentDoc.content}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}