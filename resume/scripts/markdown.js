/**
 * Markdown Engine
 *
 * Handles markdown parsing and HTML conversion.
 */

const MarkdownIt = require("markdown-it");
const hljs = require("highlight.js");

// Initialize markdown-it with syntax highlighting
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: (code, lang) => {
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  },
});

/**
 * Convert markdown string to HTML
 */
function markdownToHtml(markdown) {
  if (!markdown) return "";
  return md.render(markdown);
}

/**
 * Extract plain text from markdown (for previews, etc.)
 */
function extractPlainText(markdown, maxLength = 200) {
  if (!markdown) return "";
  const text = markdown
    .replace(/#+\s/g, "")
    .replace(/[*_]/g, "")
    .replace(/\[([^\]]+)\]/g, "$1")
    .trim();
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

module.exports = {
  markdownToHtml,
  extractPlainText,
  md,
};
