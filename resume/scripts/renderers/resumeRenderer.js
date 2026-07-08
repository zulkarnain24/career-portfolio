const fs = require("fs-extra");
const path = require("path");
const Handlebars = require("handlebars");
const glob = require("glob");
const config = require("../config");

function registerPartials(dir) {
  const files = glob.sync(path.join(dir, "*.hbs"));
  files.forEach((file) => {
    const name = path.basename(file, ".hbs");
    const content = fs.readFileSync(file, "utf8");
    Handlebars.registerPartial(name, content);
  });
}

class ResumeRenderer {
  constructor(options = {}) {
    this.options = options;
  }

  renderToHtml(viewModel, outDir) {
    outDir = outDir || config.output.dist;
    // Ensure out dir
    fs.ensureDirSync(outDir);

    // Register components
    const componentsDir = path.join("resume", "components");
    if (fs.existsSync(componentsDir)) registerPartials(componentsDir);

    // Layout
    const layoutPath = config.templates.layout;
    const layoutSrc = fs.readFileSync(layoutPath, "utf8");
    const layout = Handlebars.compile(layoutSrc);

    // Page template
    const pagePath = path.join("resume", "pages", "resume.hbs");
    let pageTemplate = Handlebars.compile("{{{content}}}");
    if (fs.existsSync(pagePath)) {
      const pageSrc = fs.readFileSync(pagePath, "utf8");
      pageTemplate = Handlebars.compile(pageSrc);
    }

    const pageHtml = pageTemplate(viewModel);
    const html = layout({
      title: viewModel.profile.title || "Resume",
      name: viewModel.profile.name || "",
      content: pageHtml,
      theme: config.themes.default || "microsoft",
    });

    const outPath = path.join(outDir, "resume.html");
    fs.writeFileSync(outPath, html, "utf8");
    console.log("✓ resume.html generated at", outPath);
    return outPath;
  }
}

module.exports = ResumeRenderer;
