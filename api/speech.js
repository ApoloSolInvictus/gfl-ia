const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 500, { error: "OPENAI_API_KEY is not configured in Vercel." });
    return;
  }

  const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";
  if (!text) {
    sendJson(response, 400, { error: "Missing text." });
    return;
  }

  try {
    const openaiResponse = await fetch(OPENAI_SPEECH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
        voice: process.env.OPENAI_TTS_VOICE || "nova",
        input: text.slice(0, 4000),
        instructions: "Voz femenina, cálida, serena, luminosa y maternal. Ritmo pausado, español claro.",
        response_format: "mp3"
      })
    });

    if (!openaiResponse.ok) {
      const data = await openaiResponse.json().catch(() => ({}));
      const error = data?.error?.message || "OpenAI speech request failed.";
      sendJson(response, openaiResponse.status, { error });
      return;
    }

    const arrayBuffer = await openaiResponse.arrayBuffer();
    response.setHeader("Content-Type", "audio/mpeg");
    response.setHeader("Cache-Control", "no-store");
    response.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    sendJson(response, 500, { error: "Unable to create speech from the Vercel function." });
  }
}

module.exports = handler;
