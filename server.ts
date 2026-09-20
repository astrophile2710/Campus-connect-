import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Campus Connect" });
  });

  // Gemini AI proxy helper
  app.post("/api/ai/assist", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY environment variable is missing." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      const { text, action } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text prompt is required." });
      }

      if (action === "refine") {
        const prompt = `You are an expert campus student welfare officer. Refine the following draft student complaint to make it formal, polite, highly structured, and actionable for administrators while retaining all specific details (locations, dates, names, room numbers, exact issue).\n\nDraft complaint:\n"${text}"\n\nReturn JSON strictly matching this schema:
{
  "title": "A concise clear subject line (under 10 words)",
  "category": "One of: Hostel & Housing, Academic & Exams, Infrastructure & Facilities, Mess & Dining, IT & Wi-Fi, Library Services, Transportation, Campus Safety & Security, Financial & Accounts",
  "priority": "One of: Low, Medium, High, Urgent",
  "refinedDescription": "A structured, detailed, polite description with bullet points or sections"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const jsonText = response.text || "{}";
        return res.json(JSON.parse(jsonText));
      } else if (action === "suggest_solution") {
        const prompt = `You are a university administrator. Based on this student complaint:
"${text}"
Provide 3 structured resolution action steps for staff and an estimated SLA resolution timeframe in hours. Return JSON strictly formatted as:
{
  "steps": ["Step 1...", "Step 2...", "Step 3..."],
  "recommendedDepartment": "Name of department (e.g. Estates & Maintenance, IT Services, Academic Cell)",
  "estimatedHours": 48
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const jsonText = response.text || "{}";
        return res.json(JSON.parse(jsonText));
      } else if (action === "policy_qa") {
        const prompt = `You are Campus Connect AI Assistant, an empathetic university policy helper. A student asks: "${text}".
Provide a helpful, clear, 2-3 paragraph answer explaining standard university complaint resolution timelines, anonymity guidelines, escalation paths, or emergency contacts. Keep tone encouraging, administrative, and supportive.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });

        return res.json({ answer: response.text });
      }

      return res.status(400).json({ error: "Unsupported action." });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      return res.status(500).json({ error: err.message || "Failed to process AI request." });
    }
  });

  // Vite middleware in dev mode
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
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
