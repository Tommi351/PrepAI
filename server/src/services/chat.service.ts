import dotenv from "dotenv";
dotenv.config();

import { pipeline } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const extractor = await pipeline("feature-extraction", "Supabase/gte-small");

export const chatService = async ({ token, message, document_id, mode }) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false, // Don't worry about cookies
    },
  });

  const config = {
    explain: { limit: 7, threshold: 0.75 }, // Balanced
    test: { limit: 12, threshold: 0.85 }, // High precision for facts
    study_guide: { limit: 15, threshold: 0.65 }, // Broad for capturing everything
    default: { limit: 5, threshold: 0.7 },
  };

  const { limit, threshold } = config[mode] || config.default;

  const output = await extractor(message, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = Array.from(output.data);

  const { data: documents, error: matchError } = await supabase
    .rpc("match_document_sections", {
      embedding,
      match_threshold: threshold,
      input_document_id: document_id,
    })
    .limit(limit);

  if (matchError) {
    console.error(matchError);
  }

  const injectedDocs =
    documents && documents.length > 0
      ? documents.map(({ content }) => content).join("\n\n")
      : "No relevant documents were found.";

  let systemPrompt;

  switch (mode) {
    case "explain":
      systemPrompt =
        "You are a teacher for students who are trying to excel. Explain concepts clearly and answer questions based on the provided material";
      break;
    case "test":
      systemPrompt =
        "You are a strict exam generator. Create questions only based on the provided material and explain why each option in a question is right or wrong";
      break;
    case "study_guide":
      systemPrompt =
        "You create structured study guides from provided material.";
      break;

    default:
      systemPrompt = "You are a helpful study assistant";
  }

  const contextPrompt = `You're an AI assistant who answers questions about documents.

          You're a chat bot, so keep your replies succinct.

          You're only allowed to use the documents below to answer the question.

          If the question isn't related to these documents, say:
          "Sorry, I couldn't find any information on that."

          If the information isn't available in the below documents, say:
          "Sorry, I couldn't find any information on that."

          Do not go off topic.

          Documents:
          ${injectedDocs}
        `;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: contextPrompt + "\n\nQuestion: " + message },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", // better + cheaper
    messages,
    temperature: 0.3,
    max_tokens: 1030,
  });

  return {
    answer:
      response.choices[0]?.message?.content ??
      "Sorry, I couldn't generate an answer",
  };
};
