import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 2,
  use: { baseURL: "http://127.0.0.1:8787", headless: true, screenshot: "on", trace: "retain-on-failure" },
  webServer: { command: "npm run start", url: "http://127.0.0.1:8787", reuseExistingServer: false, timeout: 30_000 },
});
