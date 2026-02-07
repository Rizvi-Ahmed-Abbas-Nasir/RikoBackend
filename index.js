import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// Configure CORS properly
const corsOptions = {
  origin: "*", // Or specify domains: ["https://your-frontend.com", "http://localhost:3000"]
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Accept", 
    "Origin", 
    "X-Requested-With",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin"
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options("*", cors(corsOptions));

// OR handle OPTIONS specifically for your route
app.options("/api/RikoChat", cors(corsOptions));

app.use(express.json());

// const ollamaUrl = "http://82.112.235.182:11434";

const OLLAMA_URL = "http://127.0.0.1:11434";


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

app.post("/api/RikoChat", async (req, res) => {
  try {
    console.log("📥 Received request:", req.body);
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");

    const { messages = [], model } = req.body;

    if (!messages.length) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const payload = {
      model: model || "phi:latest",
      messages: [
        { 
          role: "system", 
          content: "You are Riko, a creative AI assistant." 
        },
        ...messages,
      ],
      stream: false,
    };

    console.log("📤 Sending to Ollama:", { 
      url: ollamaUrl, 
      model: payload.model,
      messageCount: payload.messages.length 
    });

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    console.log("✅ Ollama response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ollama error:", errorText);
      throw new Error(`Ollama error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("🤖 Ollama response data:", data);

    const aiResponse = data?.message?.content || data?.response || data?.content || "No response from model";

    console.log("📝 Extracted AI response:", aiResponse.substring(0, 100) + "...");

    res.json({ 
      success: true, 
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("💥 Error in /api/RikoChat:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Riko Chat API is running" 
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    service: "Riko Chat API",
    version: "1.0.0",
    endpoints: {
      chat: "POST /api/RikoChat",
      health: "GET /health"
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/RikoChat`);
});