import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import Bytez from "bytez.js";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Bytez API Key from environment
  const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;
  
  if (!BYTEZ_API_KEY) {
    console.warn("BYTEZ_API_KEY environment variable not set. Bytez features will not work.");
  }
  
  const client = new OpenAI({
    apiKey: BYTEZ_API_KEY || "dummy-key",
    baseURL: "https://api.bytez.com/models/v2/openai/v1"
  });

  const sdk = new Bytez(BYTEZ_API_KEY || "dummy-key");

  app.post("/api/bytez/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      const response = await client.chat.completions.create({
        model: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        messages: messages,
        temperature: 0.7
      });

      res.json({ output: response.choices[0].message.content });
    } catch (error: any) {
      console.error("Bytez API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bytez/image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const model = sdk.model("stabilityai/stable-diffusion-2-1");
      const { error, output } = await model.run(prompt);
      if (error) throw new Error(error);
      res.json({ output });
    } catch (error: any) {
      console.error("Bytez Image API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bytez/qa", async (req, res) => {
    try {
      const { context, question } = req.body;
      const model = sdk.model("Intel/dynamic_tinybert");
      const { error, output } = await model.run({ context, question });
      if (error) throw new Error(error);
      res.json({ output });
    } catch (error: any) {
      console.error("Bytez QA API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
