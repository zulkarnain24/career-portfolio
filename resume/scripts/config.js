/**
 * Build Configuration
 *
 * Central configuration for the resume build system.
 */

module.exports = {
  input: {
    sections: "resume/src/sections",
    experience: "resume/src/data/experience",
    projects: "resume/src/data/projects",
    profile: "resume/src/data/profile.json",
  },
  output: {
    dist: "resume/dist",
    html: "resume/dist/resume.html",
    pdf: "resume/dist/resume.pdf",
    docx: "resume/dist/resume.docx",
  },
  templates: {
    layout: "resume/templates/layout.html",
    resume: "resume/templates/resume.html",
  },
  themes: {
    default: "microsoft",
    available: ["microsoft", "amazon", "openai", "startup", "classic"],
  },
  markdown: {
    html: true,
    breaks: true,
    linkify: true,
  },
};
