import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const processes = [
  spawn("node", ["upload-server.mjs"], { stdio: "inherit", shell: isWindows }),
  spawn(npmCommand, ["run", "dev:vite"], { stdio: "inherit", shell: isWindows }),
];

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

for (const child of processes) {
  child.on("exit", (code) => {
    if (!shuttingDown && code !== 0) shutdown(code || 1);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
