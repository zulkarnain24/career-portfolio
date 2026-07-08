const path = require("path");
const fs = require("fs-extra");
const { parseMarkdownFile, readGlobFiles } = require("../utils");

class ContentLoader {
  constructor(config) {
    this.config = config;
  }

  async loadProfile() {
    try {
      const profile = await fs.readJSON(this.config.input.profile);
      console.log("✓ Profile loaded");
      return profile;
    } catch (err) {
      throw new Error("Error loading profile: " + err.message);
    }
  }

  loadCollection(dirPattern) {
    const files = readGlobFiles(dirPattern);
    return files.map((file) => {
      const parsed = parseMarkdownFile(file);
      return {
        file,
        attributes: parsed.attributes || {},
        body: parsed.body || "",
      };
    });
  }

  async loadSections() {
    try {
      const pattern = path.join(this.config.input.sections, "*.md");
      const items = this.loadCollection(pattern);
      console.log(`✓ Loaded ${items.length} sections`);
      return items;
    } catch (err) {
      throw new Error("Error loading sections: " + err.message);
    }
  }

  async loadExperience() {
    try {
      const pattern = path.join(this.config.input.experience, "*.md");
      const items = this.loadCollection(pattern);
      console.log(`✓ Loaded ${items.length} experience entries`);
      return items;
    } catch (err) {
      throw new Error("Error loading experience: " + err.message);
    }
  }

  async loadProjects() {
    try {
      const pattern = path.join(this.config.input.projects, "*.md");
      const items = this.loadCollection(pattern);
      console.log(`✓ Loaded ${items.length} projects`);
      return items;
    } catch (err) {
      throw new Error("Error loading projects: " + err.message);
    }
  }

  async loadAll() {
    const profile = await this.loadProfile();
    const sections = await this.loadSections();
    const experience = await this.loadExperience();
    const projects = await this.loadProjects();

    return { profile, sections, experience, projects };
  }
}

module.exports = ContentLoader;
