import { pipeline } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";

// Initialize the pipeline/call the model
const extractor = await pipeline("feature-extraction", "Supabase/gte-small");

type Section = {
  id: string;
  content: string;
};

type GenerateEmbeddingsInput = {
  sections: Section[];
  token: string;
  document_id: string;
};

export const generateEmbeddingsForSections = async ({
  sections,
  token,
  document_id,
}: GenerateEmbeddingsInput) => {
  const batch_size = 50;
  // 1. Initialize Supabase client (so RLS works) and model engine
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
      persistSession: false,
    },
  });

  // Batching or I like to call it, our delivery service for embeddings

  // Step 1. Slice the massive pile of packages into 50
  for (let i = 0; i < sections.length; i += batch_size) {
    const batches = sections.slice(i, i + batch_size);

    // Process 50 sections at once/Manager send out drivers with 50 packages each
    await Promise.all(
      batches.map(async (section) => {
        const { id: section_id, content } = section;

        const output = await extractor(content, {
          pooling: "mean",
          normalize: true,
        });

        const embedding = Array.from(output.data);

        const { error: deliveryFailure } = await supabase
          .from("document_sections")
          .update({ embedding })
          .eq("id", section_id);

        if (deliveryFailure)
          console.error(`Failed section ${section_id}:`, deliveryFailure);
      }),
    );
  }

  // Update documents status to completed
  await supabase
    .from("documents")
    .update({ status: "completed" })
    .eq("id", document_id);
};
