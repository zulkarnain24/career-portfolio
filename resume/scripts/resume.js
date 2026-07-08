/**
 * Resume Builder
 *
 * Main orchestrator for building the resume.
 */

const path = require("path");
const Handlebars = require("handlebars");
const config = require("./config");
const {
  parseMarkdownFile,
  readGlobFiles,
  sortByPriority,
  filterVisible,
  ensureOutputDir,
  writeFile,
} = require("./utils");
const { markdownToHtml } = require("./markdown");

class ResumeBuilder {
  constructor() {
    this.profile = {};
    this.sections = [];
    this.experience = [];
    this.projects = [];
  }

  /**
   * Load profile.json
   */
  async loadProfile() {
    try {
      const fs = require("fs-extra");
      this.profile = await fs.readJSON(config.input.profile);
      console.log("✓ Profile loaded");
    } catch (error) {
      console.error("✗ Error loading profile:", error.message);
    }
  }

  /**
   * Load all section files
   */
  async loadSections() {
    try {
      const pattern = path.join(config.input.sections, "*.md");
      const files = readGlobFiles(pattern);

      this.sections = files
        .map((file) => parseMarkdownFile(file))
        .map((parsed) => ({
          ...parsed.attributes,
          html: markdownToHtml(parsed.body),
        }));

      this.sections = filterVisible(this.sections);
      this.sections = sortByPriority(this.sections);

      console.log(`✓ Loaded ${this.sections.length} sections`);
    } catch (error) {
      console.error("✗ Error loading sections:", error.message);
    }
  }

  /**
   * Load all experience files
   */
  async loadExperience() {
    try {
      const pattern = path.join(config.input.experience, "*.md");
      const files = readGlobFiles(pattern);

      this.experience = files
        .map((file) => parseMarkdownFile(file))
        .map((parsed) => ({
          ...parsed.attributes,
          html: markdownToHtml(parsed.body),
        }));

      this.experience = filterVisible(this.experience);
      this.experience = sortByPriority(this.experience);

      console.log(`✓ Loaded ${this.experience.length} experience entries`);
    } catch (error) {
      console.error("✗ Error loading experience:", error.message);
    }
  }

  /**
   * Load all project files
   */
  async loadProjects() {
    try {
      const pattern = path.join(config.input.projects, "*.md");
      const files = readGlobFiles(pattern);

      this.projects = files
        .map((file) => parseMarkdownFile(file))
        .map((parsed) => ({
          ...parsed.attributes,
          html: markdownToHtml(parsed.body),
        }));

      this.projects = filterVisible(this.projects);
      this.projects = sortByPriority(this.projects);

      console.log(`✓ Loaded ${this.projects.length} projects`);
    } catch (error) {
      console.error("✗ Error loading projects:", error.message);
    }
  }

  /**
   * Build complete resume data
   */
  async build() {
    console.log("\n📄 Building Resume...\n");

    await this.loadProfile();
    await this.loadSections();
    await this.loadExperience();
    await this.loadProjects();

    return {
      profile: this.profile,
      sections: this.sections,
      experience: this.experience,
      projects: this.projects,
    };
  }
}

module.exports = ResumeBuilder;
