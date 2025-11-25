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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 group-hover:opacity-40 transition blur"></div>
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
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8 pb-10 pt-2">

      {/* Sidebar / Table of Contents */}
      <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">

        {/* Search Widget */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-1 flex items-center shadow-xl">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Ask or search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto pr-2 space-y-1">
          {filteredSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 group ${activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <span className="font-medium">{section.title}</span>
              </div>
              {activeSection === section.id && <ChevronRight className="w-4 h-4 opacity-80" />}
            </button>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center p-8 text-gray-400">
              <p>No docs found for "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="text-blue-500 hover:underline mt-2">Clear Search</button>
            </div>
          )}
        </nav>

        {/* Quick Stats Widget */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Book className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Knowledge Base</span>
          </div>
          <p className="text-2xl font-bold">{docSections.length} Topics</p>
          <p className="text-xs text-gray-400 mt-1">Last Updated: Just now</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 md:p-12 shadow-sm overflow-y-auto relative">

        {/* Content Header */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <currentDoc.icon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{currentDoc.title}</h1>
            <div className="flex gap-2 mt-2">
              {currentDoc.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-md font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose dark:prose-invert max-w-none animate-in fade-in duration-500">
          {currentDoc.content}
        </div>

      </main>
    </div>
  );
}