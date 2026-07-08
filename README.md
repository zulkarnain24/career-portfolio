# CareerOS

> A production-grade resume and portfolio platform built with clean architecture, schema validation, and AI-assisted engineering practices.

**Turn your career narrative into a data-driven product.**

---

## 🎯 What is CareerOS?

CareerOS solves a real problem: **maintaining multiple, consistent resume variants** across different companies and roles.

Instead of manually editing Word documents:

```text
Your Resume
    ↓
Multiple Variants (Microsoft, Amazon, OpenAI)
    ↓
Different Formats (HTML, PDF, DOCX, JSON)
    ↓
Recruiters, LinkedIn, API Integrations
```

CareerOS does this through **a single Markdown source of truth**:

- Write your career story **once** in clean Markdown.
- Let the system handle **multiple outputs**.
- Deploy to GitHub Pages with one command.
- Version your career with Git branches.

---

## ✨ Features

### Content-First Architecture

- **Markdown + YAML**: Your resume is a Git repository, not a vendor file.
- **Single Source of Truth**: One resume, many outputs.
- **Version Control**: Track career changes with Git history.

### Build Pipeline

```text
Markdown Files
    ↓
Content Loader
    ↓
AJV Schema Validator
    ↓
Data Normalizer
    ↓
Handlebars Renderer
    ↓
HTML / PDF / JSON Resume
```

### Output Formats

- **HTML**: Responsive, print-optimized resume.
- **PDF**: Professional A4 layout via puppeteer.
- **JSON Resume**: Standard format for portability.
- **JSON ViewModel**: Debugging and API integration.

### Multiple Themes

- **Microsoft**: Corporate, professional.
- **OpenAI**: Minimal, typography-first.
- **Amazon**: Bold, leadership-focused.
- **Startup**: Modern, innovative.

### ATS-Friendly

- Valid semantic HTML.
- Proper heading hierarchy.
- No JavaScript dependencies in output.
- Clean, scannable formatting.

### CLI Configuration

```bash
npm run build                                    # Default build
npm run build -- --theme microsoft              # Theme-specific
npm run build -- --theme microsoft --format pdf # With PDF
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/zulkarnain24/career-os.git
cd career-os
npm install
```

### 2. Add Your Content

Edit files in `resume/src/`:

```text
resume/src/
├── data/
│   ├── profile.json               # Your name, email, links
│   ├── experience/                # Job history (.md files)
│   └── projects/                  # Featured projects (.md files)
├── sections/                      # Summary, skills, etc.
```

**Example: `resume/src/data/experience/current-job.md`**

```markdown
---
title: Senior Software Engineer
company: Your Company
duration: "2020 - Present"
location: City, Country
priority: 1
visible: true
---

Led architecture and delivery of enterprise solutions. Mentored 5+ engineers.

**Key Achievements:**
- Increased throughput by 40%
- Reduced incident response time by 60%
- Built systems serving 100k+ users
```

### 3. Build

```bash
npm run build
```

Output:
```
resume/dist/
├── resume.html                 # Rendered resume
├── resume.json                 # JSON Resume format
└── viewModel.json              # Internal model
```

### 4. View Locally

```bash
open resume/dist/resume.html
```

or

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/resume/dist/resume.html`.

---

## 📋 Project Structure

```
career-os/
├── resume/
│   ├── src/                    # Content (Markdown + JSON)
│   │   ├── data/
│   │   │   ├── profile.json    # Your profile
│   │   │   ├── experience/     # Job entries
│   │   │   └── projects/       # Project showcase
│   │   └── sections/           # Summary, skills, etc.
│   │
│   ├── scripts/                # Build pipeline
│   │   ├── loaders/            # Content readers
│   │   ├── validators/         # AJV validation
│   │   ├── transformers/       # Data normalization
│   │   ├── renderers/          # Handlebars rendering
│   │   ├── cli.js              # CLI argument parser
│   │   └── build.js            # Main entry point
│   │
│   ├── schema/v1/              # JSON Schemas
│   ├── config/                 # Theme configs
│   ├── components/             # Handlebars partials
│   ├── pages/                  # Page templates
│   ├── templates/              # Base layout
│   ├── themes/                 # CSS (tokens, components, print)
│   └── dist/                   # Build output
│
├── tests/                      # Test suite
├── ARCHITECTURE.md             # Design decisions
├── ROADMAP.md                  # Planned features
└── package.json
```

---

## 🏗️ Architecture Highlights

### Separation of Concerns

Each layer has one responsibility:

| Layer | Responsibility |
|-------|-----------------|
| **Loader** | Read Markdown files |
| **Validator** | Check shape with JSON Schema |
| **Transformer** | Normalize into consistent format |
| **Renderer** | Compile Handlebars + output |

### Schema Validation

Content is validated before rendering. Catch typos and missing fields early:

```bash
npm run build
# ERROR: experience/job.md is missing required field: title
# See: resume/schema/v1/experience.schema.json
```

### Design Tokens

All styling uses CSS variables:

```css
:root {
  --color-primary: #0f172a;
  --space-md: 16px;
  --font-sans: Inter, system-ui;
}
```

Never hardcode colors or spacing. This makes theming trivial.

---

## 🎨 Customization

### Add a New Theme

1. Create `resume/themes/{theme-name}/theme.css`:

```css
@import '../tokens.css';

/* Override tokens */
:root {
  --color-primary: #ff6b35;
  --color-accent: #004e89;
}
```

2. Create `resume/config/{theme-name}.json`:

```json
{
  "theme": "theme-name",
  "showProjects": true,
  "maxProjects": 5
}
```

3. Build:

```bash
npm run build -- --theme theme-name
```

### Modify Content

Edit any Markdown file in `resume/src/` and rebuild. Changes are reflected in the output immediately.

---

## 📦 npm Scripts

```bash
npm run build                      # Build resume (default)
npm run render                     # Render Handlebars templates
npm run clean                      # Remove build artifacts
npm run test                       # Run tests (placeholder)
npm run deploy                     # Deploy to GitHub Pages (future)
```

---

## 🔮 Roadmap

### v1.0 (Current)

- ✅ Markdown parser
- ✅ AJV schema validation
- ✅ HTML renderer
- ✅ Microsoft theme
- ✅ JSON Resume export
- ⏳ PDF export
- ⏳ GitHub Pages
- ⏳ Documentation

### v1.1

- Portfolio homepage
- Project showcase pages
- Blog integration
- Dark mode

### v2.0

- DOCX export
- Plugin system
- Multiple career versions
- npm package (`npx career-os new`)

---

## 🎓 Why This Matters

### For You (Portfolio)

CareerOS demonstrates:

- **System Design**: Modular pipeline with clear separation of concerns.
- **Software Architecture**: Loader → Validator → Transformer → Renderer.
- **Schema Validation**: AJV-based validation and fail-fast principles.
- **Git Workflow**: Branches, commits, and versioning as part of career evolution.
- **DevOps Mindset**: Build, test, deploy automatically.

### For Recruiters

When they ask, "Tell me about your projects":

> "I built CareerOS to manage my resume across multiple companies. It uses Markdown as the source of truth, validates content with JSON Schemas, transforms it into a normalized data model, and renders ATS-friendly HTML and PDF outputs. The architecture is modular and extensible, with clear separation of concerns."

That's a compelling engineering story.

---

## 📚 Learn More

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Design decisions, pipeline, themes, versioning.
- **[ROADMAP.md](./ROADMAP.md)**: Planned features and milestones.

---

## 🛠️ Development

### Running Tests

```bash
npm run test
```

### Building with Debug Output

```bash
npm run build -- --debug
```

### Checking Git Status

```bash
git status
git log --oneline feature/resume-content
```

---

## 📄 License

MIT — Feel free to fork, modify, and share.

---

## 🤝 Contributing

Contributions are welcome! This project is designed to be extensible:

1. **Add a Loader**: Read from new sources (LinkedIn, HackerRank, etc.).
2. **Add a Theme**: Create a new visual design.
3. **Add a Renderer**: Output to new formats (DOCX, Markdown, etc.).

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design details.

---

## 📞 Questions?

Open an issue or start a discussion. This is as much a learning project as a practical tool.

---

**Built with attention to detail, clean code, and the philosophy that your resume deserves better than a Word document.**
