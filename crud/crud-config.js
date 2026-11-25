const configurations = new Map();

/**
 * Register a reusable CRUD configuration.
 *
 * Required:
 *   id, table, fields
 * Optional:
 *   primaryKey, select, orderBy, actions, title, emptyMessage
 */
export function registerCrudConfig(configuration) {
  if (!configuration || typeof configuration !== "object") {
    throw new TypeError("CRUD configuration must be an object.");
  }
  if (!configuration.id || !configuration.table) {
    throw new Error("CRUD configuration requires both id and table.");
  }
  if (!Array.isArray(configuration.fields) || configuration.fields.length === 0) {
    throw new Error("CRUD configuration requires at least one field.");
  }

  const normalized = {
    primaryKey: "id",
    select: "*",
    actions: ["create", "read", "update", "delete"],
    ...configuration,
    fields: configuration.fields.map(field => ({ ...field }))
  };

  const fieldNames = new Set();
  for (const field of normalized.fields) {
    if (!field.name || field.name === normalized.primaryKey) {
      throw new Error("Each CRUD field needs a name different from the primary key.");
    }
    if (fieldNames.has(field.name)) {
      throw new Error(`Duplicate CRUD field: ${field.name}`);
    }
    fieldNames.add(field.name);
  }

  configurations.set(normalized.id, Object.freeze(normalized));
  return normalized;
}

export function getCrudConfig(id) {
  return configurations.get(id) || null;
}

export function removeCrudConfig(id) {
  return configurations.delete(id);
}

export function listCrudConfigs() {
  return [...configurations.values()];
}
