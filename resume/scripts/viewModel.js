/**
 * ViewModel
 *
 * Normalize parsed markdown into a clean JSON view model for templates.
 */
const ResumeBuilder = require("./resume");

async function buildViewModel() {
  const builder = new ResumeBuilder();
  const data = await builder.build();

  // Normalize sections: ensure key fields
  const sections = data.sections.map((s, i) => ({
    id: s.id || `section-${i}`,
    title: s.title || "",
    priority: s.priority || 999,
    html: s.html || "",
    meta: s.meta || {},
  }));

  const experience = data.experience.map((e, i) => ({
    id: e.id || `exp-${i}`,
    title: e.title || e.company || "",
    company: e.company || "",
    location: e.location || "",
    duration: e.duration || "",
    priority: e.priority || 999,
    html: e.html || "",
    meta: e.meta || {},
  }));

  const projects = data.projects.map((p, i) => ({
    id: p.id || `proj-${i}`,
    title: p.title || "",
    company: p.company || "",
    technologies: p.technologies || [],
    featured: p.featured || false,
    priority: p.priority || 999,
    html: p.html || "",
    meta: p.meta || {},
  }));

  return {
    profile: data.profile || {},
    sections,
    experience,
    projects,
  };
}

module.exports = buildViewModel;
