import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");

// Cache for env values to avoid excessive file reads
let envCache: Record<string, string> | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000; // 1 second cache

// Parse .env file content
function parseEnvContent(content: string): Record<string, string> {
  return Object.fromEntries(
    content.split("\n")
      .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
      .map((line) => {
        const idx = line.indexOf("=");
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
  );
}

// Read and parse .env file (with caching)
export async function loadEnv(): Promise<Record<string, string>> {
  const now = Date.now();
  if (envCache && (now - cacheTime) < CACHE_TTL) {
    return envCache;
  }

  try {
    const content = await fs.readFile(envPath, "utf-8");
    envCache = parseEnvContent(content);
  } catch {
    envCache = {};
  }
  cacheTime = now;
  return envCache;
}

// Get a single env value (for synchronous access in metabase.ts)
export function getEnvSync(key: string): string {
  if (envCache) {
    return envCache[key] || "";
  }
  // Fallback to process.env if cache is empty (shouldn't happen after init)
  return process.env[key] || "";
}

// Get all config values
export async function getConfig(): Promise<{
  METABASE_INSTANCE_URL: string;
  METABASE_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  ZHIPU_API_KEY: string;
  selectedModel: string;
  SERVER_PORT: string;
}> {
  const env = await loadEnv();
  return {
    METABASE_INSTANCE_URL: env.METABASE_INSTANCE_URL || "",
    METABASE_API_KEY: env.METABASE_API_KEY || "",
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY || "",
    ZHIPU_API_KEY: env.ZHIPU_API_KEY || "",
    selectedModel: env.selectedModel || "",
    SERVER_PORT: env.SERVER_PORT || "30100",
  };
}

// Write config to .env and invalidate cache
export async function writeConfig(config: Record<string, string>): Promise<void> {
  const lines = Object.entries(config)
    .filter(([_, v]) => v !== "") // Skip empty values
    .map(([k, v]) => `${k}=${v}`);
  await fs.writeFile(envPath, lines.join("\n") + "\n");

  // Invalidate cache
  envCache = null;
  cacheTime = 0;
}

// Initialize cache on module load
loadEnv().catch(() => {});
