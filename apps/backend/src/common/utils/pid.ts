import { writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import * as path from "node:path";

export const writePidFile = (dir: string): void => {
  const pidDir = path.resolve(dir);
  mkdirSync(pidDir, { recursive: true });
  const pidFile = path.join(pidDir, "lentil.pid");
  writeFileSync(pidFile, String(process.pid));

  const cleanup = () => {
    try {
      unlinkSync(pidFile);
    } catch {
      /* already removed */
    }
  };
  process.on("exit", cleanup);
  process.on("SIGTERM", () => {
    cleanup();
    process.exit();
  });
  process.on("SIGINT", () => {
    cleanup();
    process.exit();
  });
};
