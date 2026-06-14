import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { AIProjectClient } from "@azure/ai-projects";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";

dotenv.config();

// Fallback to loading from .env.example if key foundry variables are not set in process.env or .env is deleted
if (!process.env.FOUNDRY_PROJECT_ENDPOINT) {
  try {
    const examplePath = path.join(process.cwd(), ".env.example");
    if (fs.existsSync(examplePath)) {
      console.log("[dotenv fallback] Reading variables from .env.example...");
      const content = fs.readFileSync(examplePath, "utf-8");
      const parsed = dotenv.parse(content);
      for (const key of Object.keys(parsed)) {
        if (!process.env[key] && parsed[key]) {
          process.env[key] = parsed[key];
        }
      }
    }
  } catch (err: any) {
    console.warn("Could not read .env.example fallback:", err.message);
  }
}

const app = express();
const PORT = 3000;

// Setup parser with increased limit to handle receipt image base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize the Google GenAI SDK lazily as recommended
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_FALLBACK_IF_UNDEFINED",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper function to lazily initialize and query the Azure AI Foundry Agent service
async function askFoundryAgent(
  messages: any[], 
  systemPrompt: string, 
  config: { endpoint?: string; agentName?: string; agentVersion?: string; isolationKey?: string }
): Promise<string> {
  const endpoint = config.endpoint || process.env.FOUNDRY_PROJECT_ENDPOINT;
  const agentName = config.agentName || process.env.FOUNDRY_AGENT_NAME;
  const agentVersion = config.agentVersion || process.env.FOUNDRY_AGENT_VERSION || "1.0";
  const isolationKey = config.isolationKey || process.env.FOUNDRY_ISOLATION_KEY;

  if (!endpoint || !agentName || !isolationKey) {
    throw new Error(
      "Missing Azure AI Foundry Agent configurations. Please verify your connection details in the parameters drawer or set FOUNDRY_PROJECT_ENDPOINT, FOUNDRY_AGENT_NAME, and FOUNDRY_ISOLATION_KEY environment variables."
    );
  }

  console.log(`[Azure AI Projects] Active Connection to ${endpoint} with Agent ${agentName}`);

  // Create Project Client
  const projectClient = new (AIProjectClient as any)(
    endpoint,
    new AzureKeyCredential(isolationKey) as any
  );

  const cleanMessages = messages.map(m => ({
    role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
    content: m.content || ""
  }));

  const finalMessages = [
    { role: "system", content: systemPrompt },
    ...cleanMessages
  ];

  let replyText = "";

  // Strategy A: Use OpenAI client proxy from the Client SDK (Standard pattern)
  try {
    console.log("[Azure AI Projects] Strategy A: Attempting OpenAI Client binding...");
    let openaiClient: any = null;
    
    // Check camelCase and snake_case API signatures
    if (typeof (projectClient as any).getOpenAIClient === "function") {
      openaiClient = await (projectClient as any).getOpenAIClient();
    } else if (typeof (projectClient as any).get_openai_client === "function") {
      openaiClient = await (projectClient as any).get_openai_client({ agent_name: agentName });
    }

    if (openaiClient) {
      console.log(`[Azure AI Projects] OpenAI Proxy client loaded. Running chat completion on model: ${agentName}...`);
      const completion = await openaiClient.chat.completions.create({
        model: agentName,
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 1500
      });
      replyText = completion.choices?.[0]?.message?.content || "";
      if (replyText) {
        console.log("[Azure AI Projects] Strategy A completed successfully.");
        return replyText;
      }
    }
  } catch (err: any) {
    console.warn("[Azure AI Projects] Strategy A failed or skipped in this environment:", err.message);
  }

  // Strategy B: Use session creator API (create_session pattern)
  if (!replyText) {
    try {
      console.log("[Azure AI Projects] Strategy B: Attempting Session create_session binding...");
      let session: any = null;
      const betaAgents = (projectClient as any).beta?.agents || (projectClient as any).agents;

      if (betaAgents) {
        if (typeof betaAgents.create_session === "function") {
          session = await betaAgents.create_session({
            agent_name: agentName,
            agent_version: agentVersion
          });
        } else if (typeof betaAgents.createSession === "function") {
          session = await betaAgents.createSession({
            agentName,
            agentVersion
          });
        }
      }

      if (session) {
        console.log(`[Azure AI Projects] Session created in Foundry with ID: ${session.id || "unknown"}. Initiating runtime input...`);
        if (typeof session.sendMessage === "function") {
          const response = await session.sendMessage(messages[messages.length - 1]?.content || "");
          replyText = response.content || response.text || "";
          if (replyText) return replyText;
        }
      }
    } catch (err: any) {
      console.warn("[Azure AI Projects] Strategy B session runner failed or skipped:", err.message);
    }
  }

  // Strategy C: Thread and Run Agents Execution API as absolute fallback
  if (!replyText) {
    try {
      console.log("[Azure AI Projects] Strategy C: Instantiating explicit Thread & Message queues...");
      
      const agentsApi = (projectClient as any).agents;
      if (!agentsApi) {
        throw new Error("Agents API is missing on current Project Client instance");
      }

      // 1. Create unique thread
      const thread = await agentsApi.createThread();
      console.log(`[Azure AI Projects] Thread structured: ${thread.id}`);

      // 2. Post messages sequentially to thread
      for (const msg of cleanMessages) {
        await agentsApi.createMessage(thread.id, {
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        });
      }

      // 3. Initiate Run sequence with Agent constraints
      console.log(`[Azure AI Projects] Requesting execution queue run for agent ID/name: ${agentName}`);
      let run = await agentsApi.createRun(thread.id, agentName, {
        instructions: systemPrompt
      });

      console.log(`[Azure AI Projects] Run queue status: ${run.status}. Starting poll ticks...`);
      
      let attempts = 0;
      while ((run.status === "queued" || run.status === "in_progress") && attempts < 45) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await agentsApi.getRun(thread.id, run.id);
        attempts++;
      }

      if (run.status === "completed") {
        console.log("[Azure AI Projects] Run resolved! Pulling latest thread data...");
        const threadMessages = await agentsApi.listMessages(thread.id);
        const assistantMsg = threadMessages.data?.find((m: any) => m.role === "assistant");
        
        if (assistantMsg && assistantMsg.content && assistantMsg.content[0]) {
          replyText = (assistantMsg.content[0] as any).text?.value || "";
          if (replyText) return replyText;
        }
      } else {
        throw new Error(`Run completed with raw unresolved status: ${run.status}`);
      }
    } catch (err: any) {
      console.error("[Azure AI Projects] Strategy C execution failure:", err);
      throw err;
    }
  }

  if (!replyText) {
    throw new Error("Azure AI Foundry Agent processed successfully but returned an empty completion stream.");
  }

  return replyText;
}

// API endpoint for VoyagerIQ travel concierge chat assistance
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, foundryConfig } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array provided." });
    }

    // Determine config credentials matching both standard env and localStorage overrides
    const config = {
      endpoint: foundryConfig?.endpoint || process.env.FOUNDRY_PROJECT_ENDPOINT,
      agentName: foundryConfig?.agentName || process.env.FOUNDRY_AGENT_NAME,
      agentVersion: foundryConfig?.agentVersion || process.env.FOUNDRY_AGENT_VERSION || "1.0",
      isolationKey: foundryConfig?.isolationKey || process.env.FOUNDRY_ISOLATION_KEY,
    };

    const isFoundryConfigured = !!(config.endpoint && config.isolationKey && config.agentName);

    // Prepare custom high-precision system instructions
    const systemPrompt = `You are VoyagerIQ, a premium, hyper-intelligent enterprise AI travel concierge custom-built for Archita Sen (VP of Global Strategy, email: archita0314@gmail.com).
Be extremely professional, concise, polished, and structured. Use formatting such as bullet points, bold headers, and exact estimates. Always incorporate standard travel policy guidelines, preferred hotels, flight statuses, and silent executive dining reservations.
Always format your response utilizing complete markdown. At the end, list 1 or 2 relevant citations or sources clearly.`;

    if (isFoundryConfigured) {
      console.log("[Azure AI Projects] Routing chat query directly to Azure AI Foundry Agent Service using configured credentials...");
      try {
        const replyText = await askFoundryAgent(messages, systemPrompt, config);
        const citations = ["[1] Deployed Azure Foundry Agent Studio Knowledge Base", "[2] VoyagerIQ Enterprise Directory"];
        return res.json({ text: replyText, citations });
      } catch (azureErr: any) {
        console.warn("[Azure AI Projects] Direct API call to Azure Agent Service failed:", azureErr.message);
        throw azureErr;
      }
    }

    // FALLBACK CHAT OPTION IF AZURE KEYS ARE EMPTY OR OFFLINE DURING TRANSIT
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const lower = lastUserMsg.toLowerCase();
    
    let reply = "Hello! I am VoyagerIQ, your premium travel concierge. I detected that my Azure AI Foundry Agent endpoint is not fully connected. However, my local workspace core is primed and ready to assist you!\n\nHow can I help you plan your itinerary, manage your expenses, or track your executive flights today?";
    let citations = ["[1] VoyagerIQ Local Intelligence Cache"];

    if (lower.includes("atlanta") || lower.includes("itinerary") && lower.includes("atlanta")) {
      reply = `Here is your curated corporate travel schedule for **Atlanta, Georgia**:

- **Flight Logistics**: Flight **DL 1886** ground-runway tracking active.
- **Accommodation**: **The Ritz-Carlton Atlanta** Plazas (preferred corporate partner rate loaded).
- **Core Meetings**: Strategic strategy sessions scheduled at downtown executive hubs.
- **Dining Recommendations**: Elite networking dinners pre-cleared at **Bacchanalia** or **The Sun Dial** (quiet alcoves reserved).`;
      citations = ["[1] Atlanta Corporate Transit Registry", "[2] VoyagerIQ Executive Travel Directory"];
    } else if (lower.includes("singapore")) {
      reply = `Here is your curated corporate travel dossier for **Singapore**:

- **Flight Logistics**: Flight **SQ 317** live logistics monitoring enabled.
- **Accommodation**: **Marina Bay Sands Executive Suites** (business class pre-approved).
- **Dining Recommendations**: Elite Michelin-starred business dinner booked at **Odette** (preferred VIP seating).`;
      citations = ["[1] Singapore Business Travel Digest", "[2] VoyagerIQ Directory"];
    } else if (lower.includes("london") || lower.includes("canary wharf")) {
      reply = `Here is your curated corporate travel plan for **London**:

- **Accommodation**: Executive flat reservations at **Canary Wharf Business Gateway**.
- **Dining Recommendations**: Business dining at **The Plateau** (Canada Square). Elegant views, minimal background noise.
- **Transit**: Heathrow Express ticket pre-linked to enterprise calendaring system.`;
      citations = ["[1] London Michelin Guide", "[2] Yelp Quiet-Dining Score 2026"];
    } else if (lower.includes("policy") || lower.includes("expense") || lower.includes("rules")) {
      reply = `According to standard **Enterprise VIP Travel Policy v2026**:

1. Flight bookings exceeding 4 continuous hours qualify for Business Class upgrades.
2. Standard daily dining stipend is capped securely at $150.00 USD.
3. Keep all transaction logs. All scanned receipts will automatically calculate reimbursable status using the built-in VoyagerIQ OCR processor.`;
      citations = ["[1] Corporate Compliance Manual v2"];
    }

    return res.json({ text: reply, citations });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during AI processing." });
  }
});

// AI Expense Scanner - interprets receipt data base64 and extracts details in structured JSON
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType, foundryConfig } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data in request." });
    }

    const endpoint = foundryConfig?.endpoint || process.env.FOUNDRY_PROJECT_ENDPOINT;
    const agentName = foundryConfig?.agentName || process.env.FOUNDRY_AGENT_NAME;
    const isolationKey = foundryConfig?.isolationKey || process.env.FOUNDRY_ISOLATION_KEY;

    const isFoundryConfigured = !!(endpoint && isolationKey && agentName);

    if (isFoundryConfigured) {
      console.log("Routing receipt image OCR scanning to Azure AI Project Client Vision model...");
      
      const projectClient = new (AIProjectClient as any)(
        endpoint,
        new AzureKeyCredential(isolationKey) as any
      );

      let openaiClient: any = null;
      if (typeof (projectClient as any).getOpenAIClient === "function") {
        openaiClient = await (projectClient as any).getOpenAIClient();
      } else if (typeof (projectClient as any).get_openai_client === "function") {
        openaiClient = await (projectClient as any).get_openai_client({ agent_name: agentName });
      }

      const promptText = `Perform high-precision scanning of this corporate receipt image and extract details strictly in JSON matching the exact schema:
{
  "vendor": "Name of store/vendor as string",
  "amount": numerical amount as float,
  "currency": "Currency abbreviation code string e.g. USD, EUR, SGD",
  "category": "Food | Hotel | Transport | Other",
  "explanation": "Context description string",
  "date": "YYYY-MM-DD format string",
  "reimbursable": boolean
}
Return ONLY a raw, parsable JSON object. No raw markup, no word explanation outside of JSON block.`;

      if (openaiClient) {
        console.log(`[Azure Vision] Dispatching vision request to ${agentName}...`);
        const response = await openaiClient.chat.completions.create({
          model: agentName,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        });

        let resText = response.choices?.[0]?.message?.content || "";
        resText = resText.replace(/```json/i, "").replace(/```/g, "").trim();
        try {
          const parsed = JSON.parse(resText);
          return res.json(parsed);
        } catch (parseErr) {
          console.warn("Retrying parse on raw substring matches...");
          const jsonMatch = resText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return res.json(JSON.parse(jsonMatch[0]));
          }
          throw parseErr;
        }
      }
    }

    // Default mock / Gemini fallback
    const ai = getGenAI();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("Mock scanning receipt image...");
      return res.json({
        vendor: "World of Coca-Cola Corporate Dining",
        amount: 385.40,
        currency: "USD",
        category: "Food",
        explanation: "Global strategy VP banquet dinner - Atlanta Hub Group (Mock Extraction).",
        date: new Date().toISOString().split("T")[0],
        reimbursable: true,
      });
    }

    // Continue with standard Gemini Flash receipt OCR
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    };

    const promptText = "Perform high-precision scanning of this corporate receipt and extract the details strictly matching the schema.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, promptText],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendor: { type: Type.STRING, description: "Name of the merchant or store." },
            amount: { type: Type.NUMBER, description: "Total numerical price computed." },
            currency: { type: Type.STRING, description: "The currency code, e.g. USD, SGD, EUR, GBP." },
            category: { type: Type.STRING, description: "Budget category: Food, Hotel, Transport, or Other." },
            explanation: { type: Type.STRING, description: "Brief description of the context based on receipts items." },
            date: { type: Type.STRING, description: "Standard ISO format date (YYYY-MM-DD)." },
            reimbursable: { type: Type.BOOLEAN, description: "Whether this represents a business/reimbursable expense." },
          },
          required: ["vendor", "amount", "currency", "category", "explanation", "date", "reimbursable"],
        },
      },
    });

    const parsedGemini = JSON.parse(response.text || "{}");
    res.json(parsedGemini);
  } catch (error: any) {
    console.error("API Error in /api/scan-receipt:", error);
    res.status(500).json({ error: error.message || "Failed to parse receipt image." });
  }
});

// Integrate with Vite Dev Server / Serve production files
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VoyagerIQ Server listening at http://0.0.0.0:${PORT}`);
  });
}

initServer();
