/**
 * numin-chat.ts
 * Real AI chat handler for Numin.
 *
 * Priority:
 *  1. VITE_NUMIN_PROXY_URL  → hardware install, calls local OpenClaw gateway proxy
 *  2. VITE_GEMINI_API_KEY   → cloud software, calls Gemini directly
 *
 * Both support streaming. Falls back gracefully if one fails.
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const PROXY_URL     = import.meta.env.VITE_NUMIN_PROXY_URL as string | undefined;
const GEMINI_KEY    = import.meta.env.VITE_GEMINI_API_KEY  as string | undefined;
const GEMINI_MODEL  = (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-2.0-flash";

const SYSTEM_PROMPT = `You are NUMIN, an intelligent AI business operating system assistant. You help business owners manage their operations, answer questions, track tasks, understand their business data, and make smart decisions. You are professional, concise, and proactive. Always refer to yourself as NUMIN. Be warm but efficient — no unnecessary filler.`;

// ─── OpenClaw Hardware Proxy ──────────────────────────────────────────────────

async function streamFromProxy(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  try {
    const res = await fetch(`${PROXY_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hermes-agent-id": "main",
      },
      body: JSON.stringify({
        model: "hermes",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
        user: `numin_client_${Date.now()}`,
      }),
    });

    if (!res.ok) throw new Error(`Proxy error ${res.status}`);
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.replace(/^data: /, "").trim();
        if (!trimmed || trimmed === "[DONE]") continue;
        try {
          const json = JSON.parse(trimmed);
          const chunk = json.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch {
          // skip malformed chunks
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : String(err));
  }
}

// ─── Gemini Cloud ─────────────────────────────────────────────────────────────

async function streamFromGemini(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  try {
    // Build Gemini contents format
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.replace(/^data: /, "").trim();
        if (!trimmed) continue;
        try {
          const json = JSON.parse(trimmed);
          const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (chunk) onChunk(chunk);
        } catch {
          // skip
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : String(err));
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a message and stream the response.
 * @param messages  Full conversation history
 * @param onChunk   Called with each streamed text chunk
 * @param onDone    Called when streaming completes
 * @param onError   Called on failure
 */
export async function sendMessage(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  if (PROXY_URL) {
    return streamFromProxy(messages, onChunk, onDone, onError);
  }
  if (GEMINI_KEY) {
    return streamFromGemini(messages, onChunk, onDone, onError);
  }
  onError("No AI backend configured. Set VITE_NUMIN_PROXY_URL or VITE_GEMINI_API_KEY.");
}
