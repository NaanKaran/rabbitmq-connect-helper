export default {
  preset: "ts-jest", // Use ts-jest to handle TypeScript
  testEnvironment: "node", // Set test environment to Node.js
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Transform TypeScript files
  },
  moduleFileExtensions: ["ts", "js"], // Recognize these extensions
  testMatch: [
    "<rootDir>/src/test/test.ts", // Main test file
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ], // Additional test patterns
  moduleDirectories: ["node_modules", "src"], // Resolve modules
  transformIgnorePatterns: [
    "/node_modules/", // Ignore transformations in node_modules
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/test/**", // Don't include test files in coverage
    "!src/index.ts" // Don't include barrel files in coverage
  ],
};
