#!/usr/bin/env node

/**
 * Main Build Script
 *
 * Entry point for the resume build system.
 * Run with: npm run build
 */

const fs = require("fs-extra");
const path = require("path");
const ResumeBuilder = require("./resume");
const config = require("./config");
const { ensureOutputDir, writeFile } = require("./utils");

async function main() {
  try {
    // Ensure output directory
    await ensureOutputDir(config.output.dist);

    // Build resume data
    const builder = new ResumeBuilder();
    const data = await builder.build();

    console.log("\n✓ All data loaded successfully\n");

    // TODO: Phase 4.2 - HTML Generation
    // TODO: Phase 4.3 - PDF Generation
    // TODO: Phase 4.4 - DOCX Generation

    console.log("🚀 Next: HTML Template Generation (Phase 4.2)\n");

    // For now, just output the data structure
    console.log("📊 Resume Data Structure:", {
      profile: data.profile.name,
      sections: data.sections.length,
      experience: data.experience.length,
      projects: data.projects.length,
    });
  } catch (error) {
    console.error("\n✗ Build failed:", error.message);
    process.exit(1);
  }
}

main();
