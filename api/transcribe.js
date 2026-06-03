const OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function extensionFromMimeType(mimeType) {
  if (/mp4|m4a/i.test(mimeType)) return "m4a";
  if (/mpeg|mp3/i.test(mimeType)) return "mp3";
  if (/ogg/i.test(mimeType)) return "ogg";
  if (/wav/i.test(mimeType)) return "wav";
  return "webm";
}

function audioBufferFromDataUrl(dataUrl) {
  const audio = typeof dataUrl === "string" ? dataUrl : "";
  const base64 = audio.includes(",") ? audio.split(",").pop() : audio;
  return Buffer.from(base64, "base64");
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

  const mimeType = typeof request.body?.mimeType === "string" ? request.body.mimeType : "audio/webm";
  const buffer = audioBufferFromDataUrl(request.body?.audio);

  if (!buffer.length) {
    sendJson(response, 400, { error: "Missing audio." });
    return;
  }

  if (buffer.length > 9 * 1024 * 1024) {
    sendJson(response, 413, { error: "Audio is too large." });
    return;
  }

  try {
    const form = new FormData();
    const filename = `gfl-voice.${extensionFromMimeType(mimeType)}`;
    form.append("file", new Blob([buffer], { type: mimeType }), filename);
    form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
    form.append("language", "es");
    form.append("response_format", "json");

    const openaiResponse = await fetch(OPENAI_TRANSCRIPTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      const error = data?.error?.message || "OpenAI transcription request failed.";
      sendJson(response, openaiResponse.status, { error });
      return;
    }

    sendJson(response, 200, { text: data.text || "" });
  } catch (error) {
    sendJson(response, 500, { error: "Unable to transcribe audio from the Vercel function." });
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};
