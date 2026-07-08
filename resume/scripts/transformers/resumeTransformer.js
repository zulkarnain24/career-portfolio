const { markdownToHtml, extractPlainText } = require("../markdown");

class ResumeTransformer {
  constructor(options = {}) {
    this.options = options;
  }

  normalizeItems(items) {
    return items
      .map((it, i) => {
        const attrs = it.attributes || {};
        return {
          id: attrs.id || attrs.slug || `item-${i}`,
          title: attrs.title || attrs.name || "",
          priority: attrs.priority != null ? attrs.priority : 999,
          visible: attrs.visible != null ? attrs.visible : true,
          meta: attrs.meta || {},
          html: markdownToHtml(it.body || ""),
        };
      })
      .sort((a, b) => a.priority - b.priority);
  }

  transform(data) {
    const profile = data.profile || {};

    const sections = this.normalizeItems(data.sections || []);
    const experience = (data.experience || [])
      .map((it, i) => {
        const attrs = it.attributes || {};
        return {
          id: attrs.id || attrs.slug || `exp-${i}`,
          title: attrs.title || attrs.role || attrs.company || "",
          company: attrs.company || "",
          location: attrs.location || "",
          duration: attrs.duration || "",
          priority: attrs.priority != null ? attrs.priority : 999,
          visible: attrs.visible != null ? attrs.visible : true,
          html: markdownToHtml(it.body || ""),
          meta: attrs.meta || {},
        };
      })
      .sort((a, b) => a.priority - b.priority);

    const projects = (data.projects || [])
      .map((it, i) => {
        const attrs = it.attributes || {};
        return {
          id: attrs.id || attrs.slug || `proj-${i}`,
          title: attrs.title || "",
          company: attrs.company || "",
          technologies: attrs.technologies || [],
          featured: attrs.featured || false,
          priority: attrs.priority != null ? attrs.priority : 999,
          visible: attrs.visible != null ? attrs.visible : true,
          html: markdownToHtml(it.body || ""),
          meta: attrs.meta || {},
        };
      })
      .sort((a, b) => a.priority - b.priority);

    const viewModel = {
      profile: profile,
      sections,
      experience,
      projects,
    };

    // JSON Resume export (basic shape)
    const jsonResume = {
      basics: {
        name: profile.name || "",
        label: profile.title || "",
        email: profile.email || "",
        website: profile.website || "",
        summary: extractPlainText(profile.summary || ""),
      },
      work: experience.map((e) => ({
        name: e.company,
        position: e.title,
        startDate: e.meta && e.meta.startDate,
        endDate: e.meta && e.meta.endDate,
        summary: extractPlainText(e.html || ""),
        highlights: [],
      })),
      projects: projects.map((p) => ({
        name: p.title,
        description: extractPlainText(p.html || ""),
        keywords: p.technologies || [],
        url: p.meta && p.meta.url,
      })),
    };

    return { viewModel, jsonResume };
  }
}

module.exports = ResumeTransformer;
