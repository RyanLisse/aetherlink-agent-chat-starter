import { spawn } from "node:child_process";

const server = spawn(process.execPath, ["--env-file-if-exists=.env", "server/index.mjs"], { stdio: "inherit" });
const vite = spawn("npx", ["vite"], { stdio: "inherit", shell: true });
const stop = (code = 0) => { server.kill("SIGTERM"); vite.kill("SIGTERM"); process.exit(code); };
server.on("exit", (code) => { if (code && !vite.killed) stop(code); });
vite.on("exit", (code) => stop(code || 0));
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
