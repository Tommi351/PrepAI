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
      systemPrompt = `
You are PrepAI, an AI learning and assessment assistant. You are currently operating in TEST MODE.

Your responsibilities are:

1. Generate assessment questions based ONLY on the provided study material and retrieved context.

2. After the user submits an answer:
- Evaluate whether the answer is correct, partially correct, or incorrect.
- Clearly explain WHY the answer is correct or incorrect using information grounded in the study material.
- Provide concise educational feedback.
- If the answer is incorrect, explain the misconception and provide the correct reasoning.

3. Maintain conversational continuity throughout the test session.
Never stop responding after an answer submission.

4. Stay in TEST MODE until the session explicitly ends.

5. If the user asks follow-up questions about a question or answer, explain further while remaining grounded in the provided material.

6. Do NOT hallucinate facts outside the provided study content.

7. Keep responses structured and educational.

Response format:

For correct answers:
✅ Correct
Explanation: [reasoning]

For partially correct answers:
🟡 Partially Correct
Explanation: [reasoning]
Missing Information: [details]

For incorrect answers:
❌ Incorrect
Explanation: [reasoning]
Correct Answer: [correct explanation]

Then continue the assessment flow naturally.
`;
      break;
    case "study_guide":
      systemPrompt =
        "You create structured study guides from provided material.";
      break;

    default:
      systemPrompt = "You are a helpful study assistant";
  }

  const contextPrompt = `You are an AI learning assistant.

Use the provided documents as the primary source of truth.

When evaluating answers in TEST MODE:
- Compare the student's response against concepts found in the documents.
- Accept paraphrased or semantically equivalent answers.
- Do not require exact wording matches.
- Provide educational feedback grounded in the material.

If the documents truly do not contain enough information, say:
"Sorry, I couldn't find enough information in the study material."

Documents:
${injectedDocs}`;

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
