import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const ollamaUrl = "http://82.112.235.182:11434";

app.post("/api/RikoChat", async (req, res) => {
  try {
    const { messages = [], model } = req.body;

    if (!messages.length) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const payload = {
      model: model || "phi:latest",
      messages: [
        { role: "system", content: "You are Riko, a creative AI assistant." },
        ...messages,
      ],
      stream: false,
    };

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error: ${errorText}`);
    }

    const data = await response.json();

    const aiResponse =
      data?.message?.content || data?.response || "No response from model";

    res.json({ success: true, response: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => console.log("Backend running on port 3001"));
