import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

const ROOT_URL = "http://127.0.0.1:8000/";
const SAFARI_URL = "http://127.0.0.1:4444/status";
const managedProcesses = [];

const steps = [
  ["npm", ["run", "validate"]],
  ["npm", ["run", "audit"]],
  ["npm", ["run", "verify:assets"]],
  ["npm", ["test"]],
];

try {
  for (const [command, args] of steps) {
    const label = `${command} ${args.join(" ")}`;
    console.log(`\n=== ${label} ===`);

    const result = spawnSync(command, args, {
      stdio: "inherit",
      shell: false,
    });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }

  const serverReady = await ensureService(ROOT_URL, ["python3", "-m", "http.server", "8000"]);
  const safariReady = serverReady ? await ensureService(SAFARI_URL, ["safaridriver", "-p", "4444"]) : false;

  if (serverReady && safariReady) {
    const smokeResult = spawnSync("npm", ["run", "smoke:ui"], {
      stdio: "inherit",
      shell: false,
    });

    if (smokeResult.status !== 0) {
      process.exit(smokeResult.status ?? 1);
    }
  } else {
    console.log("\nUI smoke was skipped because the local HTTP server or SafariDriver could not be prepared automatically.");
    console.log("Run `python3 -m http.server 8000`, `safaridriver -p 4444`, and `npm run smoke:ui` manually when needed.");
  }

  console.log("\nRelease verification completed successfully.");
} finally {
  managedProcesses.forEach((child) => {
    try {
      process.kill(child.pid, "SIGTERM");
    } catch {
      // ignore cleanup failures
    }
  });
}

async function ensureService(url, command) {
  if (await isReachable(url)) {
    return true;
  }

  const child = spawn(command[0], command.slice(1), {
    stdio: "ignore",
    detached: true,
  });
  child.unref();
  managedProcesses.push(child);

  const started = await waitUntilReachable(url, 8000);
  return started;
}

function isReachable(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode != null && res.statusCode < 500);
    });

    req.on("error", () => resolve(false));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitUntilReachable(url, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isReachable(url)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return false;
}
