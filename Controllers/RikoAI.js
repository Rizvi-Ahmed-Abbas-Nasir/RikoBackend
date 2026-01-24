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
- Emojis: Use relevant emojis strategically (1-2 per response)`
        },
        ...messages,
      ],
      stream: false, // Changed from true to false
    };

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Ollama API responded with status: ${response.status}`);
    }

    // Get the complete response
    const data = await response.json();
    
    // Set proper headers for JSON response
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    
    // Send the complete response
    res.json({
      success: true,
      message: data.message?.content || data.content || data.response || "No response generated",
      fullResponse: data // Optional: include full response if needed
    });

  } catch (err) {
    console.error("RikoAI Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: err.message,
        details: "Failed to process AI request"
      });
    }
  }
}