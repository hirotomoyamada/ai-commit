import type { Config } from "jest"

const config: Config = {
  collectCoverageFrom: ["packages/**/*.{ts}"],
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|js)?$": ["@swc-node/jest", { module: "commonjs" }],
  },
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(ts|js)$"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
}

export default config
