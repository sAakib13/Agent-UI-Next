export interface Organization {
  id: string; // UUID
  name: string;
  website?: string | null;
  industry: string;
  short_description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Agent {
  id: string; // UUID
  organization_id: string;
  name: string;
  language: string;
  tone: string;
  persona_prompt: string;
  task_prompt: string;
  trigger_code: string;
  allowed_actions: string[]; // JSONB maps to array of strings
  qr_code_base64?: string | null;
  greeting_message?: string | null;
}

// Optional: specific type for creating an agent (omitting auto-generated fields)
export type CreateAgentDTO = Omit<Agent, "id" | "qr_code_base64">;
