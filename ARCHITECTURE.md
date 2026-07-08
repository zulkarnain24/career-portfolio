# Architecture — CareerOS

## Overview

CareerOS is a content-first resume and portfolio platform. It separates concerns into distinct layers: **content** (Markdown + YAML), **parsing** (loaders), **validation** (schemas), **normalization** (transformers), **templating** (Handlebars), and **rendering** (HTML/PDF/JSON).

The philosophy: **Single source of truth in Markdown and JSON. Multiple output formats.**

---

## Design Decisions

### 1. Markdown as the Source of Truth

**Why Markdown?**

* **Portable**: Human-readable, version-control friendly, no vendor lock-in.
* **Git-native**: Changes, branches, and PRs tell a story of career evolution.
* **Low friction**: Content authors don't need to learn complex tools.
* **Semantic**: Front matter (YAML) separates metadata from content.

**Example:**

```markdown
---
title: Senior Software Engineer
company: Eaton Corporation
duration: "2020 - Present"
priority: 1
visible: true
---

Led architecture and delivery of enterprise IoT and BLE Mesh solutions...
```

### 2. JSON Schema for Validation

**Why schemas?**

* **Fail fast**: Catch content errors before rendering.
* **Documentation**: Schemas serve as contracts and documentation.
* **Confidence**: AJV-based validation catches typos, missing fields, and format issues.
* **Versioning**: Schemas can evolve independently of content.

**Examples:**

```json
// profile.schema.json
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": { "type": "string" },
    "title": { "type": "string" }
  }
}
```

### 3. Normalized View Model

**Why transform the data?**

Raw markdown attributes may be inconsistent. The transformer normalizes them:

```javascript
// Input (raw attributes)
{ title: "Eaton", company: "CTO" }

// Output (normalized)
{
  id: "eaton-1",
  title: "Eaton",
  company: "CTO",
  priority: 1,
  visible: true,
  html: "<p>...</p>",
  meta: {}
}
```

This normalization:
* Ensures consistent shape for templates.
* Allows filtering and sorting without template logic.
* Supports multiple output formats (HTML, PDF, JSON Resume).

### 4. Plugin-Ready Architecture

**Future-proofing:**

The pipeline is extensible. New transformers, validators, and renderers can be added without modifying the core:

```
loaders/
├── contentLoader.js
├── projectLoader.js (future)
└── blogLoader.js (future)

validators/
├── resumeValidator.js
├── portfolioValidator.js (future)

transformers/
├── resumeTransformer.js
├── jsonResumeTransformer.js

renderers/
├── resumeRenderer.js
├── pdfRenderer.js (future)
└── docxRenderer.js (future)
```

---

## The Pipeline

```text
resume/src/
│
├── data/
│   ├── profile.json              # Personal metadata
│   ├── experience/*.md           # Job entries with YAML front matter
│   └── projects/*.md             # Project entries with YAML front matter
│
└── sections/*.md                 # Content sections (summary, skills, etc.)
            │
            ▼
    ContentLoader
    (reads all Markdown files, parses YAML)
            │
            ├── profile: { name, title, email, ... }
            ├── experience: [ { title, company, html, ... }, ... ]
            ├── projects: [ { title, technologies, html, ... }, ... ]
            └── sections: [ { title, body, html, ... }, ... ]
            │
            ▼
    ResumeValidator (AJV-based)
    (checks against resume/schema/v1/*.json)
            │
            ├── Validates profile shape
            ├── Validates experience entries
            ├── Validates projects
            └── Fails fast if any validation error
            │
            ▼
    ResumeTransformer
    (normalizes data into consistent shapes)
            │
            ├── Markdown → HTML conversion
            ├── Field defaults (priority, visible)
            ├── ID generation (slug-based or auto)
            ├── Exports normalized "viewModel" for templates
            └── Exports "jsonResume" (JSON Resume standard)
            │
            ▼
    ResumeRenderer (Handlebars)
    (compiles templates and injects view model)
            │
            ├── Loads partials from resume/components/*.hbs
            ├── Loads page template from resume/pages/resume.hbs
            ├── Compiles with viewModel data
            ├── Injects theme CSS into layout.html
            └── Outputs resume/dist/resume.html
            │
            ▼
    resume/dist/
    ├── resume.html               # Main rendered resume
    ├── viewModel.json            # Normalized internal model (for debugging)
    ├── resume.json               # JSON Resume export
    └── (future: resume.pdf, resume.docx)
```

---

## Themes

### Theme Structure

```
resume/themes/
│
├── tokens.css                    # Global design variables
├── variables.css                 # Exported vars for legacy support
├── typography.css                # Font settings, heading styles
├── layout.css                    # Grid, spacing utilities
├── components.css                # Component styles (header, timeline, cards)
├── print.css                     # Print-safe overrides
│
└── microsoft/
    ├── theme.css                 # Microsoft-specific overrides (color, spacing)
    └── print.css                 # Print layout (A4, margins, page breaks)
```

### Adding a New Theme

1. Create `resume/themes/{theme-name}/` folder.
2. Add `theme.css` and `print.css`.
3. Update `resume/config/{theme-name}.json` with settings.
4. Reference in `resume/templates/layout.html`:

```html
<link rel="stylesheet" href="../themes/{{theme}}.css" />
```

### Theme Configuration

```json
// resume/config/microsoft.json
{
  "theme": "microsoft",
  "showProjects": true,
  "showBlog": false,
  "maxProjects": 4,
  "maxExperience": 4
}
```

CLI usage:

```bash
npm run build -- --theme microsoft
npm run build -- --config amazon
```

---

## Versioning Strategy

### Resume Versions

Store multiple resume variants in `resume/versions/`:

```
resume/versions/
├── microsoft.json                # Microsoft-optimized (focus on enterprise)
├── amazon.json                   # Amazon-optimized (focus on scale, leadership)
├── openai.json                   # OpenAI-optimized (focus on AI/research)
└── startup.json                  # Startup-optimized (focus on speed, innovation)
```

Each version controls:
* Which sections are visible
* Project selection (featured vs. all)
* Summary wording
* Focus areas

### Implementation

```javascript
// In ResumeTransformer
const filterByVersion = (data, version) => {
  const versionConfig = require(`../versions/${version}.json`);
  return {
    sections: data.sections.filter(s => versionConfig.showSections.includes(s.id)),
    projects: data.projects.filter(p => versionConfig.projects.includes(p.id)),
    experience: data.experience.filter(e => versionConfig.experience.includes(e.id))
  };
};
```

CLI usage:

```bash
npm run build -- --version microsoft --output dist/microsoft/
npm run build -- --version amazon --output dist/amazon/
```

---

## Validation Pipeline

### Schema-First Approach

1. **Profile Schema** (`schema/v1/profile.schema.json`):
   - Ensures `name` is present.
   - Validates email format (optional).

2. **Experience Schema** (`schema/v1/experience.schema.json`):
   - Ensures `title` or `company`.
   - Validates `priority` is numeric.

3. **Project Schema** (`schema/v1/project.schema.json`):
   - Ensures `title` is present.
   - Validates `technologies` is an array.

### Error Reporting

When validation fails:

```
ERROR: Validation failed

experience/eaton.md [Line 5]
  Missing required field: title

See: resume/schema/v1/experience.schema.json
```

---

## CLI and Configuration

### Command-Line Interface

```bash
# Default build (all content)
npm run build

# Theme-specific
npm run build -- --theme microsoft

# Version-specific (future)
npm run build -- --version microsoft

# Custom output directory
npm run build -- --output dist/custom/

# Combined
npm run build -- --theme microsoft --version amazon --output dist/amazon-theme/
```

### Config Precedence

1. CLI flags (highest priority)
2. Config file (`resume/config/{name}.json`)
3. Default config (`resume/scripts/config.js`)

---

## Output Formats (Roadmap)

### Current (v1.0)

* **HTML**: Full responsive resume with print CSS.
* **JSON**: Normalized view model for debugging.
* **JSON Resume**: Standard format for portability.

### Planned

* **PDF**: Print-optimized via puppeteer.
* **DOCX**: Microsoft Word format.
* **Markdown**: Export back to markdown for editing.
* **JSON**: Additional formats (LinkedIn, OpenAI API).

---

## Future Extensibility

### Plugin System

```javascript
// plugins/qrcode/index.js
module.exports = {
  name: 'qr-code',
  hooks: {
    afterTransform: (viewModel) => {
      viewModel.qrCode = generateQR(viewModel.profile.website);
      return viewModel;
    }
  }
};
```

### Build Hooks

```javascript
// Available hooks
beforeLoad()
afterLoad()
beforeValidate()
afterValidate()
beforeTransform()
afterTransform()
beforeRender()
afterRender()
```

---

## Project Structure

```
career-os/
│
├── resume/
│   ├── src/                      # Content (Markdown + JSON)
│   │   ├── data/
│   │   │   ├── profile.json
│   │   │   ├── experience/
│   │   │   └── projects/
│   │   ├── sections/             # Summary, skills, etc.
│   │   
│   ├── scripts/                  # Build pipeline
│   │   ├── loaders/
│   │   ├── validators/
│   │   ├── transformers/
│   │   ├── renderers/
│   │   ├── cli.js
│   │   ├── build.js
│   │   └── config.js
│   │
│   ├── schema/                   # JSON Schemas
│   │   └── v1/
│   │
│   ├── config/                   # Theme and version configs
│   │   ├── microsoft.json
│   │   └── amazon.json
│   │
│   ├── components/               # Handlebars partials
│   │   ├── Header.hbs
│   │   ├── Timeline.hbs
│   │   ├── ProjectCard.hbs
│   │   └── Footer.hbs
│   │
│   ├── pages/                    # Page templates
│   │   └── resume.hbs
│   │
│   ├── templates/                # Base layout
│   │   └── layout.html
│   │
│   ├── themes/                   # CSS and design tokens
│   │   ├── tokens.css
│   │   ├── variables.css
│   │   ├── microsoft/
│   │   └── amazon/
│   │
│   └── dist/                     # Build outputs
│       ├── resume.html
│       ├── resume.json
│       └── viewModel.json
│
├── tests/                        # Test suite
├── ARCHITECTURE.md               # This file
├── README.md
├── ROADMAP.md
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Actions
```

---

## Design Philosophy

### Separation of Concerns

Each layer has one job:

* **Loader**: Read files.
* **Validator**: Check shape and completeness.
* **Transformer**: Normalize and prepare for rendering.
* **Renderer**: Compile templates and output.

This makes the system:
* **Testable**: Each layer can be tested independently.
* **Maintainable**: Changes to one layer don't affect others.
* **Extensible**: New loaders, validators, or renderers can be added.

### Content-First

The system prioritizes content. Every feature serves the content, not the other way around. Markdown + YAML is the single source of truth.

### Production-Ready

From day one, the output is:
* **ATS-friendly**: Valid HTML, semantic markup.
* **Print-safe**: Print CSS ensures A4 layouts and proper page breaks.
* **SEO-optimized**: Structured data, meta tags, og:image.

---

## Roadmap

### v1.0 (Current)

* ✅ Loader, Validator, Transformer, Renderer.
* ✅ HTML output with responsive design.
* ✅ Microsoft theme.
* ✅ JSON Resume export.
* ⏳ PDF export (puppeteer).
* ⏳ GitHub Pages deployment.
* ⏳ Documentation.

### v1.1

* Portfolio homepage.
* Project showcase pages.
* Blog integration.
* Dark mode theme.

### v2.0

* DOCX export.
* Plugin system (finalized).
* Multiple career versions (Microsoft, Amazon, OpenAI, Startup).
* npm package (`npx career-os new`).

---

## Contributing

To add a feature:

1. **Identify the layer** it belongs to (loader, validator, transformer, renderer).
2. **Write tests** for the layer.
3. **Update schemas** if needed.
4. **Update this document** to explain the change.

---

## Interview Discussion Points

* **Why Markdown?** Portability, version control, low friction.
* **Why JSON Schemas?** Validation, documentation, confidence.
* **Why normalize?** Consistency, testability, multi-format support.
* **Why separate layers?** Maintainability, extensibility, testability.
* **Scalability?** The system scales to hundreds of projects and themes by design.

