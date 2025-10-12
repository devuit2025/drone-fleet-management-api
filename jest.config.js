/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  collectCoverageFrom: [
    "src/**/*.(t|j)s",
    "!src/**/*.spec.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/main.ts",
    "!src/seeders/**",
  ],
  coverageDirectory: "coverage",
};
