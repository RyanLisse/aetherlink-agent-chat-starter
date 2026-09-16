import { test, expect } from "@playwright/test";

test("demo mode sends a deterministic draft", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Make the route visible/ })).toBeVisible();
  await expect(page.getByText("Demo fixture")).toBeVisible();
  await page.getByRole("textbox", { name: "Message coordinator" }).fill("Prepare the draft route");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText('"ticket_id": "WL-1026"')).toBeVisible();
  await expect(page.getByText('"human_approval_required": true')).toBeVisible();
  await page.screenshot({ path: "test-results/chat-demo-full.png", fullPage: true });
});
