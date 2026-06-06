import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askGPT5(prompt) {
  const r = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-5",
    messages: [
      { role: "system", content: "You are an expert AI coding assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });
  return r.choices[0].message.content;
}

