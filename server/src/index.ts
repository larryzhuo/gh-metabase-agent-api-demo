import express from "express";
import cors from "cors";
import {
  ToolLoopAgent,
  pipeAgentUIStreamToResponse,
  UIMessage,
  stepCountIs,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createZhipu } from "zhipu-ai-provider";
import { systemPrompt } from "./prompt.js";
import { agentTools } from "./tools.js";
import { getConfig, writeConfig, loadEnv } from "./config.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// GET config endpoint
app.get("/api/config", async (_req, res) => {
  const config = await loadEnv();
  res.json(config);
});

// POST config endpoint
app.post("/api/config", async (req, res) => {
  try {
    await writeConfig(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to write config:", error);
    res.status(500).json({ error: "Failed to save configuration" });
  }
});

// Multi-provider agent cache
const agents = new Map<string, ToolLoopAgent<any, any>>();

// Create agent for a specific model (reads config in real-time)
async function createAgent(
  modelId: string,
): Promise<ToolLoopAgent<any, any> | null> {
  const config = await getConfig();

  // Check which provider based on model ID
  if (modelId.startsWith("claude-") || modelId.startsWith("anthropic-")) {
    if (!config.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY not configured");
      return null;
    }
    return new ToolLoopAgent({
      model: anthropic(modelId),
      instructions: systemPrompt,
      tools: agentTools,
      stopWhen: stepCountIs(15),
    });
  }

  if (modelId.startsWith("glm-")) {
    if (!config.ZHIPU_API_KEY) {
      console.warn("ZHIPU_API_KEY not configured");
      return null;
    }
    const zhipuProvider = createZhipu({ apiKey: config.ZHIPU_API_KEY });
    return new ToolLoopAgent({
      model: zhipuProvider(modelId),
      instructions: systemPrompt,
      tools: agentTools,
      stopWhen: stepCountIs(15),
    });
  }

  console.warn(`Unknown model: ${modelId}`);
  return null;
}

// Get or create agent for a model
async function getAgent(
  modelId: string,
): Promise<ToolLoopAgent<any, any> | null> {
  if (!agents.has(modelId)) {
    const config = await getConfig();
    if (!config.METABASE_API_KEY) {
      console.error(`METABASE_API_KEY null`);
      return null;
    }
    const agent = await createAgent(modelId);
    if (agent) {
      agents.set(modelId, agent);
    }
    return agent;
  }
  return agents.get(modelId) || null;
}

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Missing 'messages' array" });
    return;
  }

  // Read model from config in real-time
  const config = await getConfig();
  const modelId = config.selectedModel;
  if (!modelId) {
    res.status(500).json({
      error: "No model configured. Please select a model in Settings.",
    });
    return;
  }

  const agent = await getAgent(modelId);
  if (!agent) {
    res.status(500).json({
      error: "Model not configured. Please check your API keys in Settings.",
    });
    return;
  }

  await pipeAgentUIStreamToResponse({
    response: res,
    agent,
    uiMessages: messages as UIMessage[],
  });
});

// Serve static files from client/dist
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../../client/dist");
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Initialize and start server
async function main() {
  const config = await getConfig();
  const PORT = parseInt(config.SERVER_PORT);

  const missingVars = Object.entries(config)
    .filter(
      ([k, v]) => v === "" && k !== "selectedModel" && k !== "SERVER_PORT",
    )
    .map(([k, _]) => k);

  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missingVars.join(", ")}`,
    );
    console.warn("Please configure API keys in the Settings page.");
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
