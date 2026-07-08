const fs = require("fs");
const path = require("path");
const Ajv = require("ajv").default;
const addFormats = require("ajv-formats");

class ResumeValidator {
  constructor(schemasDir) {
    this.schemasDir =
      schemasDir || path.join(__dirname, "..", "..", "schema", "v1");
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.loadAllSchemas();
  }

  loadAllSchemas() {
    try {
      const files = fs.readdirSync(this.schemasDir);
      files.forEach((f) => {
        if (f.endsWith(".json")) {
          const p = path.join(this.schemasDir, f);
          const schema = JSON.parse(fs.readFileSync(p, "utf8"));
          this.ajv.addSchema(schema, schema.$id || f);
        }
      });
    } catch (e) {
      // ignore
    }
  }

  validateProfile(profile) {
    const validate =
      this.ajv.getSchema("profile.schema.json") || this.ajv.compile({});
    const valid = validate(profile);
    return { valid: !!valid, errors: validate.errors || [] };
  }

  validateEntries(entries, schemaId) {
    const validate = this.ajv.getSchema(schemaId) || this.ajv.compile({});
    const errors = [];
    entries.forEach((e, i) => {
      const attrs = e.attributes || {};
      const ok = validate(attrs);
      if (!ok) {
        errors.push({ index: i, errors: validate.errors });
      }
    });
    return errors;
  }

  validate(data) {
    const profileRes = this.validateProfile(data.profile);
    const expRes = this.validateEntries(
      data.experience || [],
      "experience.schema.json",
    );
    const projRes = this.validateEntries(
      data.projects || [],
      "project.schema.json",
    );
    const errors = [];
    if (!profileRes.valid) errors.push({ profile: profileRes.errors });
    if (expRes.length) errors.push({ experience: expRes });
    if (projRes.length) errors.push({ projects: projRes });
    return { valid: errors.length === 0, errors };
  }
}

module.exports = ResumeValidator;
