/**
 * Simple CLI parser for build options.
 * Accepts: --theme, --company, --format, --profile, --config, --output
 */
const path = require("path");

/**
 * @typedef {Object} BuildConfig
 * @property {string} [theme]
 * @property {string} [company]
 * @property {string} [format]
 * @property {string} [profile]
 * @property {string} [config]
 * @property {string} [output]
 */

function parseArgv(argv) {
  const args = argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith("--")) continue;
    const key = a.replace(/^--/, "");
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function loadConfigFromFile(name) {
  try {
    const cfgPath = path.join("resume", "config", `${name}.json`);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(path.resolve(cfgPath));
  } catch (e) {
    return null;
  }
}

/**
 * Merge CLI args and optional config file into a BuildConfig
 * @returns {BuildConfig}
 */
function getBuildConfig() {
  const cli = parseArgv(process.argv);
  const cfg = {};
  if (cli.config) {
    const file = loadConfigFromFile(cli.config);
    if (file) Object.assign(cfg, file);
  }
  // CLI overrides
  if (cli.theme) cfg.theme = cli.theme;
  if (cli.company) cfg.company = cli.company;
  if (cli.format) cfg.format = cli.format;
  if (cli.profile) cfg.profile = cli.profile;
  if (cli.output) cfg.output = cli.output;

  return cfg;
}

module.exports = { parseArgv, getBuildConfig };
