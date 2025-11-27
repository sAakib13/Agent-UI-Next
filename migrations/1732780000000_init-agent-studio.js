exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Ensure Schema Exists
  pgm.createSchema("agentstudio", { ifNotExists: true });

  // 2. Create Organizations Table
  pgm.createTable(
    { schema: "agentstudio", name: "organizations" },
    {
      id: {
        type: "uuid",
        default: pgm.func("gen_random_uuid()"),
        primaryKey: true,
      },
      name: { type: "varchar(255)", notNull: true, unique: true },
      website: { type: "text" },
      industry: { type: "varchar(100)" },
      short_description: { type: "text" },
      is_active: { type: "boolean", default: true },
      created_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
      updated_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    }
  );

  // 3. Create Agents Table
  pgm.createTable(
    { schema: "agentstudio", name: "agents" },
    {
      id: {
        type: "uuid",
        default: pgm.func("gen_random_uuid()"),
        primaryKey: true,
      },
      organization_id: {
        type: "uuid",
        notNull: true,
        references: { schema: "agentstudio", name: "organizations" },
        onDelete: "CASCADE",
      },
      name: { type: "varchar(255)", notNull: true, unique: true },
      language: { type: "varchar(50)", notNull: true },
      tone: { type: "varchar(50)", notNull: true },
      persona_prompt: { type: "text" },
      task_prompt: { type: "text" },
      trigger_code: { type: "varchar(100)", unique: true },
      allowed_actions: { type: "jsonb", default: "[]" },
      qr_code_base64: { type: "text" },
      greeting_message: { type: "text" },
      status: { type: "varchar(50)", default: "Training" },
      urls: { type: "jsonb", default: "[]" },
      document_refs: { type: "jsonb", default: "[]" },
      created_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
      updated_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    }
  );
};

exports.down = (pgm) => {
  pgm.dropTable({ schema: "agentstudio", name: "agents" });
  pgm.dropTable({ schema: "agentstudio", name: "organizations" });
  pgm.dropSchema("agentstudio");
};
