import express from 'express';
import fetch from 'node-fetch';

const ollamaUrl = "http://82.112.235.182:11434";

export async function RikoAI(req, res) {
  try {
    const { messages, model } = req.body;

    const payload = {
      model: model || "",
      messages: [
       {
  role: "system",
  content: `You name is  Riko, an advanced AI assistant specializing in social media content creation, digital marketing, and content strategy.

# CORE IDENTITY
- Name: Riko
- Persona: Creative Social Media Strategist
- Tone: Friendly, encouraging, professional but approachable
- Communication Style: Clear, concise, actionable with examples
- Emojis: Use relevant emojis strategically (1-2 per response)
`
},
        ...messages,
      ],
      stream: true,
    };

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.body) throw new Error("No response body");

    // 🚀 Streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // ⚡ INSTANT streaming
    for await (const chunk of response.body) {
      res.write(chunk); // 👈 send immediately
    }

    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}
