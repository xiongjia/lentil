import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  rootDir: "src",
  testMatch: ["**/*.spec.ts"],
};

export default config;
