// RikoAI.js
import express from 'express';
import fetch from 'node-fetch';


export async function RikoAI(req, res) {
  try {
    const { messages, model } = req.body;

    const payload = {
      model: model || "deepseek-r1:1.5b",
      stream: true,
      messages: [
     {
  role: "system",
  content: "You are Riko, a concise social media content strategist."
}
,

        ...messages
      ]
    };

    const response = await fetch("http://82.112.235.182:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders?.();

    let buffer = "";

    for await (const chunk of response.body) {
      buffer += chunk.toString();

      let index;
      while ((index = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);

        if (!line) continue;

        const parsed = JSON.parse(line);

        if (parsed.message?.content) {
          res.write(JSON.stringify({
            message: { content: parsed.message.content }
          }) + "\n");
          res.flush?.();
        }

        if (parsed.done) {
          res.write(JSON.stringify({ done: true }) + "\n");
          res.end();
          return;
        }
      }
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}
