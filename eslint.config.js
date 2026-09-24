const js = require("@eslint/js");
const globals = require("globals");

// defaults.js 定义的共享顶层标识，由 manifest 保证先于其他脚本加载
const sharedGlobals = {
  AIToolsUtils: "readonly",
  DEFAULT_CONFIG: "readonly",
  DEFAULT_PROMPTS: "readonly",
  STORAGE_KEY_SETTINGS: "readonly",
  STORAGE_KEY_SHOW_PROMPT_BUTTONS: "readonly",
  cloneConfig: "readonly",
  mergeSettings: "readonly",
  matchSite: "readonly",
  readState: "readonly"
};

module.exports = [
  {
    ignores: ["node_modules/**", "Nunito-fonts/**", "images/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        ...globals.serviceworker
      }
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
          varsIgnorePattern: "^(DEFAULT_|STORAGE_KEY_|cloneConfig|mergeSettings|matchSite|readState)"
        }
      ],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
      "no-implicit-globals": "off"
    }
  },
  {
    files: ["**/*.js"],
    ignores: ["defaults.js"],
    languageOptions: {
      globals: sharedGlobals
    }
  },
  {
    files: ["tests/**/*.js", "eslint.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node, ...sharedGlobals }
    }
  }
];
