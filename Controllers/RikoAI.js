import fetch from "node-fetch";

const ollamaUrl = "http://82.112.235.182:11434";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { messages = [], model } = req.body || {};

    if (!messages.length) {
      return res.status(400).json({ error: "Messages are required" });
    }

    console.log(
      "📥 User Message:",
      messages[messages.length - 1]?.content
    );

    const payload = {
      model: model || "phi:latest",
      messages: [
        {
          role: "system",
          content: "You are Riko, a creative AI assistant."
        },
        ...messages
      ],
      stream: false 
    };

    console.log("🔄 Sending request to Ollama...");
    const startTime = Date.now();

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error: ${errorText}`);
    }

    const data = await response.json();
    const endTime = Date.now();

    const aiResponse =
      data?.message?.content ||
      data?.response ||
      "No response from model";

   
    console.log(
      "🤖 AI Response:",
      aiResponse.substring(0, 120) +
        (aiResponse.length > 120 ? "..." : "")
    );
    console.log(`⏱️ Response time: ${endTime - startTime}ms`);

    return res.status(200).json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error("❌ API Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
