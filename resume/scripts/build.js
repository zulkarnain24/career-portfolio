#!/usr/bin/env node

/**
 * Main Build Script
 *
 * Entry point for the resume build system.
 * Run with: npm run build
 */

const fs = require("fs-extra");
const path = require("path");
const ContentLoader = require("./loaders/contentLoader");
const ResumeValidator = require("./validators/resumeValidator");
const ResumeTransformer = require("./transformers/resumeTransformer");
const ResumeRenderer = require("./renderers/resumeRenderer");
const config = require("./config");
const { ensureOutputDir, writeFile } = require("./utils");

async function main() {
  try {
    // Ensure output directory
    await ensureOutputDir(config.output.dist);

    // New pipeline: Loader -> Validator -> Transformer -> Renderer
    const cli = require("./cli");
    const cliCfg = cli.getBuildConfig();
    const buildConfig = Object.assign({}, config, { cli: cliCfg });

    const loader = new ContentLoader(buildConfig);
    const validator = new ResumeValidator();
    const transformer = new ResumeTransformer();
    const renderer = new ResumeRenderer();

    // Load raw content
    const raw = await loader.loadAll();

    // Validate
    const validation = validator.validate(raw);
    if (!validation.valid) {
      console.error("\n✗ Validation errors:", validation.errors);
      process.exit(1);
    }

    // Transform into normalized view model and a JSON Resume export
    const { viewModel, jsonResume } = transformer.transform(raw);

    // Write normalized JSON for debugging/consumers
    const vmPath = path.join(config.output.dist, "viewModel.json");
    await fs.writeJSON(vmPath, viewModel, { spaces: 2 });
    const jrPath = path.join(config.output.dist, "resume.json");
    await fs.writeJSON(jrPath, jsonResume, { spaces: 2 });

    console.log("\n✓ All data loaded and transformed successfully\n");

    // Render HTML
    renderer.renderToHtml(viewModel, config.output.dist);
  } catch (error) {
    console.error("\n✗ Build failed:", error.message);
    process.exit(1);
  }
}

main();
