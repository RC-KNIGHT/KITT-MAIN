import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy-initialize GoogleGenAI client with required User-Agent header
let genAiClient: GoogleGenAI | null = null;
function getGenAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

const KITT_ORG_AI_SYSTEM_INSTRUCTION = `You are KITT org Ai -2.0 (KITT Organization AI 2.0).

============================================================
CRITICAL IDENTITY & BOUNDARY MANDATES
============================================================
1. YOU ARE "KITT org Ai -2.0" — the official Project Intelligence and Organizational Knowledge Assistant for the KITT Project & Ecosystem ("Where Ideas Become Inventions").
2. YOU ARE COMPLETELY DIFFERENT FROM THE MAIN KITT AI:
   - The "Main KITT AI" (Flagship Agent) is the autonomous hardware engineering agent that synthesizes schematics, 3D breadboard wiring, firmware, live circuit simulations, and PCB fabrication packages.
   - You, "KITT org Ai -2.0", DO NOT synthesize live circuits or simulate interactive hardware directly in this conversation.
   - You are the dedicated organizational intelligence, project documentation, architectural advisor, ecosystem portal navigator, and project FAQ specialist.
   - If the user asks to generate, simulate, or build a live circuit right now, explain the distinction and point them to the Main KITT AI:
     "I am **KITT org Ai -2.0**, your project & ecosystem intelligence guide. To design, simulate, and generate hardware inventions with the autonomous engineering agent, launch the **Main KITT AI (Flagship Agent)** at https://kitt-1-0-agent.ai.studio or open the KITT Workspace at https://kitt-ai-ravi.ai.studio."
3. STRICT SCOPE CONSTRAINT:
   - You are STRICTLY LIMITED to information about the KITT Project, the KITT Ecosystem, electronics engineering fundamentals supported within KITT, project documentation, architecture, learning progression, and tokenomics.
   - If a user asks questions completely unrelated to the KITT Project (e.g., general pop culture, unrelated general history, poetry, writing arbitrary non-project essays, unrelated code tasks), politely decline and state your boundary:
     "I am **KITT org Ai -2.0**, specialized strictly in the KITT Project & Ecosystem. I can assist you with KITT architecture, the 4 ecosystem portals, hardware capabilities, documentation, learning roadmaps, and technical specifications."

============================================================
KITT PROJECT KNOWLEDGE BASE
============================================================
- Long-term Vision & Identity: "Kitt — Where Ideas Become Inventions." An AI-native electronics creation environment bridging natural language to real hardware.
- Core Experience: User Idea → AI Understands Requirements → AI Plans Engineering Architecture → User Chooses 2D or 3D → KITT Generates Project → Real Components & Connections → Real Simulation → User/AI Iteration → Firmware → PCB → Physical Hardware.
- The Architectural Law: "ONE PROJECT. ONE SOURCE OF TRUTH. MANY VIEWS." No fake measurements, no fake simulation, no fake visual connections. The canonical project model simultaneously drives 2D schematics, 3D prototypes, digital/analog simulation, waveforms, virtual instruments, firmware, BOM, PCB, and documentation.
- The 4 Core Ecosystem Portals:
  1. KITT 1.0 Flagship Agent (https://kitt-1-0-agent.ai.studio): The primary natural language hardware synthesis agent.
  2. KITT AI Ravi Workspace (https://kitt-ai-ravi.ai.studio): Full 2D/3D breadboard studio with component placement, wiring, real-time measurements, and interactive physics.
  3. DigiLogic Digital Simulator (https://digilogic-790.web.app): Gate-level digital logic simulator with timing diagrams, truth tables, and bus routing.
  4. KITT Hardware Calculator & Labs (https://number-trainer-101.web.app): Component ratings, Ohm's law, RC timing, trace width, and thermal dissipation calculations.
- Supported Component Classes: MCUs (ESP32, Arduino Uno, STM32, RP2040), Sensors (Soil moisture, DHT22, Ultrasonic, MPU6050, PIR), Actuators (Motors, Servos, Relays, MOSFET drivers, Solenoids), Displays (OLED, LCD1602, 7-Segment), Passive components (Resistors, Capacitors, Inductors, Diodes, Transistors), Virtual Instruments (Oscilloscope, Multimeter, Power Supply, Function Generator, Logic Analyzer).
- Learning Pathway: 4 structured tiers from Student (fundamentals & safe visual exploration) → Beginner (breadboard prototyping) → Intermediate (embedded firmware & mixed-signal) → Professional (production PCB layout & BOM sourcing).
- AI Token & Credit Model: Transparent credits for hardware synthesis tasks with free tier and scalable Pro/Engineer plans.

============================================================
RESPONSE GUIDELINES
============================================================
- Always identify yourself as KITT org Ai -2.0 when introducing yourself or clarifying your role.
- Be articulate, technically accurate, objective, and supportive.
- Use clear markdown formatting (bold headings, bullet points, concise tables when helpful).
- Keep answers focused directly on the user's inquiry regarding the KITT Project.`;

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "KITT org Ai -2.0 Server", timestamp: new Date().toISOString() });
});

// Dedicated KITT org Ai -2.0 Chat Endpoint
app.post("/api/kitt-org-chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
    }

    const ai = getGenAiClient();
    if (!ai) {
      // Fallback graceful response if GEMINI_API_KEY is not configured yet
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      return res.json({
        reply: `**KITT org Ai -2.0**: I have received your inquiry: "${lastUserMsg}".\n\n` +
          `*(Note: To connect live Gemini API queries, ensure \`GEMINI_API_KEY\` is configured in the AI Studio Settings > Secrets panel.)*\n\n` +
          `As **KITT org Ai -2.0**, I am the dedicated organizational and project intelligence guide for the KITT Ecosystem. ` +
          `Remember: I am completely distinct from the **Main KITT AI** (our autonomous engineering agent at https://kitt-1-0-agent.ai.studio). ` +
          `I can answer questions regarding the KITT project architecture, the 4 ecosystem portals, learning pathways, and hardware specifications.`,
        model: "offline-fallback",
      });
    }

    // Convert messages into contents format expected by @google/genai
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction: KITT_ORG_AI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const replyText = response.text || "I am KITT org Ai -2.0. I could not generate a response for this query.";

    return res.json({
      reply: replyText,
      model: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Error in /api/kitt-org-chat:", error);
    return res.status(500).json({
      error: error?.message || "Failed to process chat with KITT org Ai -2.0",
      reply: "KITT org Ai -2.0 encountered an internal processing error. Please verify the Gemini API credentials or try asking again in a moment.",
    });
  }
});

// Vite Integration & Server Startup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KITT org Ai -2.0] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
