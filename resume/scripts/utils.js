/**
 * Utility Functions
 *
 * Common utilities for the build system.
 */

const fs = require("fs-extra");
const path = require("path");
const { globSync } = require("glob");
const frontMatter = require("front-matter");

/**
 * Read a file and parse YAML front matter
 * Returns { attributes, body }
 */
function parseMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = frontMatter(content);
    return {
      path: filePath,
      attributes: parsed.attributes || {},
      body: parsed.body || "",
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return {
      path: filePath,
      attributes: {},
      body: "",
    };
  }
}

/**
 * Read all files matching a glob pattern
 */
function readGlobFiles(pattern) {
  try {
    const files = globSync(pattern);
    return files || [];
  } catch (error) {
    console.error(`Error reading glob pattern ${pattern}:`, error.message);
    return [];
  }
}

/**
 * Sort files by priority (from front matter)
 */
function sortByPriority(files) {
  return files.sort((a, b) => {
    const priorityA = (a.attributes && a.attributes.priority) || 999;
    const priorityB = (b.attributes && b.attributes.priority) || 999;
    return priorityA - priorityB;
  });
}

/**
 * Filter visible items (front matter: visible: true)
 */
function filterVisible(items) {
  return items.filter((item) => {
    // If no attributes, include by default
    if (!item.attributes) return true;
    // If visible is explicitly set to false, exclude
    return item.attributes.visible !== false;
  });
}

/**
 * Ensure output directory exists
 */
function ensureOutputDir(dirPath) {
  return fs.ensureDir(dirPath);
}

/**
 * Write file safely
 */
function writeFile(filePath, content) {
  return fs.writeFile(filePath, content, "utf8");
}

module.exports = {
  parseMarkdownFile,
  readGlobFiles,
  sortByPriority,
  filterVisible,
  ensureOutputDir,
  writeFile,
};
