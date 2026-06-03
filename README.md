# GFL IA

Sitio estático con funciones serverless listas para Vercel. El chat usa OpenAI desde `/api/chat`, graba voz con el micrófono, transcribe el audio con `/api/transcribe` y responde con voz femenina desde `/api/speech`.

## Deploy en Vercel

1. Importa este repositorio en Vercel.
2. Configura la variable de entorno `OPENAI_API_KEY`.
3. Opcionalmente configura estas variables:
   - `OPENAI_MODEL`: modelo de chat. Predeterminado: `gpt-5.4-mini`.
   - `OPENAI_TTS_MODEL`: modelo de voz. Predeterminado: `gpt-4o-mini-tts`.
   - `OPENAI_TTS_VOICE`: voz de respuesta. Predeterminado: `nova`.
   - `OPENAI_TRANSCRIBE_MODEL`: modelo de transcripción. Predeterminado: `gpt-4o-mini-transcribe`.
   - `OPENAI_MAX_COMPLETION_TOKENS`: límite de salida del chat. Predeterminado: `700`.
4. Publica el proyecto.

## Desarrollo local

```bash
npm run check
npx vercel dev
```

El micrófono requiere HTTPS en producción o `localhost` en desarrollo.
