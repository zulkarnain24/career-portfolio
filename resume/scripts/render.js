/**
 * Renderer
 *
 * Compile Handlebars templates and output HTML pages using the ViewModel.
 */
const fs = require("fs-extra");
const path = require("path");
const Handlebars = require("handlebars");
const glob = require("glob");
const buildViewModel = require("./viewModel");
const config = require("./config");

function registerPartials(dir) {
  const files = glob.sync(path.join(dir, "*.hbs"));
  files.forEach((file) => {
    const name = path.basename(file, ".hbs");
    const content = fs.readFileSync(file, "utf8");
    Handlebars.registerPartial(name, content);
  });
}

async function render() {
  try {
    await fs.ensureDir(config.output.dist);

    // Register components
    const componentsDir = path.join("resume", "components");
    if (fs.existsSync(componentsDir)) registerPartials(componentsDir);

    // Load layout
    const layoutPath = config.templates.layout;
    const layoutSrc = await fs.readFile(layoutPath, "utf8");
    const layout = Handlebars.compile(layoutSrc);

    // Load page template (basic resume page)
    const pagePath = path.join("resume", "pages", "resume.hbs");
    let pageTemplate = "{{{content}}}";
    if (fs.existsSync(pagePath)) {
      const src = await fs.readFile(pagePath, "utf8");
      pageTemplate = Handlebars.compile(src);
    }

    // Build view model
    const vm = await buildViewModel();

    // Render page content using page template
    const pageHtml = pageTemplate(vm);

    // Render final layout
    const html = layout({
      title: vm.profile.title || "Resume",
      name: vm.profile.name || "",
      content: pageHtml,
      theme: config.themes.default || "microsoft",
    });

    const outPath = path.join(config.output.dist, "resume.html");
    await fs.writeFile(outPath, html, "utf8");
    console.log("✓ resume.html generated at", outPath);
  } catch (err) {
    console.error("✗ Render failed:", err.message);
    throw err;
  }
}

if (require.main === module) {
  render().catch((e) => process.exit(1));
}

module.exports = render;
