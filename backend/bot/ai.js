const axios = require('axios');
const { SYSTEM_PROMPT } = require('./prompt');
const fs = require('fs');
const path = require('path');

// Dynamically load training chats / few-shot examples if they exist
let goldenExamples = '';
try {
  const examplesPath = path.join(__dirname, 'training_chats/examples.js');
  if (fs.existsSync(examplesPath)) {
    const { GOLDEN_CHATS } = require(examplesPath);
    if (GOLDEN_CHATS && GOLDEN_CHATS.length > 0) {
      goldenExamples = '\n\n=== GOLDEN CONVERSATION EXAMPLES (Speak exactly in this tone & structure) ===\n';
      GOLDEN_CHATS.forEach(example => {
        goldenExamples += `\n[Example flow: ${example.title}]\n`;
        example.chat.forEach(msg => {
          goldenExamples += `${msg.role.toUpperCase()}: ${msg.content}\n`;
        });
      });
    }
  }
} catch (e) {
  // Fail-safe: ignore loading errors
}

async function getAIReply(chatHistory, customerInfo = {}) {
  // Build context about customer if we have it
  let contextNote = '';
  if (customerInfo.wedding_date || customerInfo.venue) {
    contextNote = `\n\n[CONTEXT: Customer details collected so far — `;
    if (customerInfo.name) contextNote += `Name: ${customerInfo.name}, `;
    if (customerInfo.wedding_date) contextNote += `Wedding Date: ${customerInfo.wedding_date}, `;
    if (customerInfo.venue) contextNote += `Venue: ${customerInfo.venue}, `;
    if (customerInfo.package_interested) contextNote += `Interested in: ${customerInfo.package_interested}, `;
    if (customerInfo.owner_confirmed === 'available') contextNote += `AVAILABILITY: CONFIRMED ✅ — now focus on closing the booking, `;
    if (customerInfo.owner_confirmed === 'unavailable') contextNote += `AVAILABILITY: NOT AVAILABLE for this date — sympathetically suggest nearby dates or different package, `;
    contextNote += `]`;
  }

  const systemInstructionText = SYSTEM_PROMPT + contextNote + goldenExamples;

  // Map chat history to Gemini role/part structure
  // Gemini roles MUST be 'user' or 'model'
  const contents = chatHistory.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.message }]
  }));

  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        },
        contents,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 400
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    return reply.trim();
  } catch (error) {
    console.error('❌ Gemini API Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { getAIReply };
