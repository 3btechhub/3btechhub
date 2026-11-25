/**
 * Configuration-based CRUD data engine.
 * Pass a Supabase-compatible client and a registered configuration.
 */
export class CrudCore {
  constructor(client, configuration) {
    if (!client || typeof client.from !== "function") {
      throw new TypeError("CrudCore requires a Supabase-compatible client.");
    }
    if (!configuration?.table) {
      throw new Error("CrudCore requires a table configuration.");
    }

    this.client = client;
    this.config = configuration;
    this.primaryKey = configuration.primaryKey || "id";
  }

  assertAction(action) {
    const actions = this.config.actions || ["create", "read", "update", "delete"];
    if (!actions.includes(action)) {
      throw new Error(`CRUD action "${action}" is not enabled for this configuration.`);
    }
  }

  getPayload(values) {
    const payload = {};
    for (const field of this.config.fields || []) {
      if (Object.prototype.hasOwnProperty.call(values, field.name)) {
        payload[field.name] = values[field.name];
      }
    }
    return payload;
  }

  async read(filters = {}) {
    this.assertAction("read");
    let query = this.client.from(this.config.table).select(this.config.select || "*");

    for (const [column, value] of Object.entries(filters)) {
      query = value === null
        ? query.is(column, null)
        : query.eq(column, value);
    }

    if (this.config.orderBy) {
      const order = typeof this.config.orderBy === "string"
        ? { column: this.config.orderBy, ascending: true }
        : this.config.orderBy;
      query = query.order(order.column, { ascending: order.ascending !== false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async create(values) {
    this.assertAction("create");
    const payload = this.getPayload(values);
    const { data, error } = await this.client
      .from(this.config.table)
      .insert(payload)
      .select(this.config.select || "*")
      .single();

    if (error) throw error;
    return data;
  }

  async update(record, values) {
    this.assertAction("update");
    const id = record?.[this.primaryKey];
    if (id === undefined || id === null) {
      throw new Error("Cannot update a record without its primary key.");
    }

    const payload = this.getPayload(values);
    const { data, error } = await this.client
      .from(this.config.table)
      .update(payload)
      .eq(this.primaryKey, id)
      .select(this.config.select || "*")
      .single();

    if (error) throw error;
    return data;
  }

  async delete(record) {
    this.assertAction("delete");
    const id = record?.[this.primaryKey];
    if (id === undefined || id === null) {
      throw new Error("Cannot delete a record without its primary key.");
    }

    const { error } = await this.client
      .from(this.config.table)
      .delete()
      .eq(this.primaryKey, id);

    if (error) throw error;
    return true;
  }

  /**
   * Record state determines the interface mode.
   * A record with a primary-key value is an existing record.
   */
  getMode(record) {
    return record && record[this.primaryKey] !== undefined &&
      record[this.primaryKey] !== null
      ? "edit"
      : "create";
  }
}
