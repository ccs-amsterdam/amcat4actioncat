const nextJest = require("next/jest");
const createJestConfig = nextJest({
  dir: "./",
});
const customJestConfig = {
  verbose: false,
  //setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    /*
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
    "^@/ui/(.*)$": "<rootDir>/ui/$1",
    "^@/api/(.*)$": "<rootDir>/api/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/context/(.*)$": "<rootDir>/context/$1",
    "^@/styles/(.*)$": "<rootDir>/styles/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/utils/(.*)$": "<rootDir>/utils/$1",*/
  },
};

module.exports = createJestConfig(customJestConfig);
