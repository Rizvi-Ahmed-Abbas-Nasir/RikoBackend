import express from 'express';
import fetch from 'node-fetch';

const app = express();
const ollamaUrl = "http://ec2-3-92-55-191.compute-1.amazonaws.com:11434";

app.use(express.json());

export async function RikoAI(req, res) {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "No messages provided or invalid format" });
    }

    const payload = {
      model: model || "llama3.2",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant specialized in answering educational and technical queries.",
        },
        ...messages,
      ],
    };

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.body) {
      throw new Error("Ollama API response does not contain a body.");
    }

    res.setHeader("Content-Type", "application/json");

    let buffer = ""; 

    for await (const chunk of response.body) {
      const decodedChunk = chunk.toString(); 
      buffer += decodedChunk; 

      const lines = buffer.split("\n");
      buffer = lines.pop(); 

      lines.forEach((line) => {
        if (line.trim()) {
          try {
            const jsonLine = JSON.parse(line); 
            if (jsonLine.message && jsonLine.message.content) {
              res.write(
                JSON.stringify({
                  role: "assistant",
                  content: jsonLine.message.content,
                }) + "\n"
              );
            }
          } catch (err) {
            console.error("Error parsing JSON line:", err, line);
          }
        }
      });
    }

    res.end(); 
  } catch (error) {
    console.error("[API ERROR]:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Uncomment to enable testing locally
// const port = 3000;
// app.post("/api/chat", RikoAI);
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
