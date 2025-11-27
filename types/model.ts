// --- 1. Database Row Schema (snake_case) ---
// This interface MUST match the column names and types returned DIRECTLY from PostgreSQL.
export interface IAgentDBRow {
  // Agent Fields (from agentstudio.agents)
  id: string; // UUID
  organization_id: string; // UUID FK
  name: string;
  language: string;
  tone: string;
  persona_prompt: string;
  task_prompt: string;
  trigger_code: string;
  status: string;
  qr_code_base64: string | null;
  greeting_message: string | null;

  // JSONB fields (will be strings in raw SQL response before parsing)
  allowed_actions: string | Record<string, boolean>; // JSONB (e.g., {"updateContactTable": true})
  urls: string | string[]; // JSONB
  document_refs: string | string[]; // JSONB

  // Audit Fields
  created_at: Date;
  updated_at: Date;

  // Organization Fields (Joined via the GET query)
  business_name: string;
  industry: string;
  short_description: string;
  business_url: string; // Mapped from 'website' or 'business_url' column
}

// --- 2. Client Configuration Schema (camelCase) ---
// This is the clean structure used by React components and the API request payload.
export interface IAgentClientConfig {
  // Core Identity
  id: string;
  agentName: string;
  triggerCode: string;
  status: "Active" | "Inactive" | "Training";

  // Organization / Business Profile
  businessName: string;
  industry: string;
  shortDescription: string;
  businessURL: string;

  // Core Behavior
  language: string;
  tone: string;
  personaPrompt: string; // Mapped from persona_prompt
  taskPrompt: string; // Mapped from task_prompt

  // Knowledge & Capabilities
  urls: string[];
  documentRefs: string[]; // Document file names/paths
  possibleActions: { updateContactTable: boolean; delegateToHuman: boolean }; // Mapped from allowed_actions

  // Deployment
  qrCodeBase64: string | null;
}

// --- 3. Mapping Utility (Used in the API Route's GET Handler) ---

/**
 * Parses JSON fields if they are strings, otherwise returns the object/array.
 */
const parseJson = (value: string | unknown, fallback: any) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value || fallback;
};

/**
 * Transforms a database row (snake_case) into a client-friendly configuration (camelCase).
 */
export function mapDbRowToClientConfig(row: IAgentDBRow): IAgentClientConfig {
  const actions = parseJson(row.allowed_actions, {});
  const urls = parseJson(row.urls, []);
  const documentRefs = parseJson(row.document_refs, []);

  return {
    id: row.id,
    agentName: row.name,
    triggerCode: row.trigger_code,
    status: row.status as IAgentClientConfig["status"],

    // Business
    businessName: row.business_name,
    industry: row.industry,
    shortDescription: row.short_description,
    businessURL: row.business_url || "",

    // Core Behavior
    language: row.language,
    tone: row.tone,
    personaPrompt: row.persona_prompt,
    taskPrompt: row.task_prompt,

    // Knowledge & Capabilities
    urls: Array.isArray(urls) ? urls : [],
    documentRefs: Array.isArray(documentRefs) ? documentRefs : [],
    possibleActions: {
      updateContactTable: Boolean(actions.updateContactTable),
      delegateToHuman: Boolean(actions.delegateToHuman),
    },

    // Deployment
    qrCodeBase64: row.qr_code_base64,
  };
}
