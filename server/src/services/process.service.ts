import { createClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";
import { processMarkdown } from "../utils/markdown-parser.js";

type ProcessServiceInput = {
  document_id: string;
  token: string;
};

export const processService = async ({
  token,
  document_id,
}: ProcessServiceInput) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // Step 1: Grab the Supabase environment variables, perform a type check for best practice
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing environment variables");
  }

  // Step 2: Create Supabase client using token and configure it to inherit the original user’s permissions via the authorization header.
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

  await supabase
    .from("documents")
    .update({ status: "processing" })
    .eq("id", document_id);

  // Step : Grab the documents and query it.
  const { data: document } = await supabase
    .from("documents_with_storage_path")
    .select()
    .eq("id", document_id)
    .single();

  // Step 4: Check if the document actually exists in the DB
  if (!document?.storage_path) {
    throw new Error("Failed to find uploaded document");
  }

  // Step 5: Download the file from Supabase Storage
  const { data: file } = await supabase.storage
    .from("files")
    .download(document.storage_path);

  if (!file) {
    throw new Error("Failed to download uploaded file");
  }

  // Convert from Blob to arrayBuffer
  const fileBlob = await file.arrayBuffer();

  // 2. Convert directly to Uint8Array (instead of Buffer)
  const uint8Array = new Uint8Array(fileBlob);

  // 3. Pass the Uint8Array to the parser
  const fileParser = new PDFParse(uint8Array);

  // Extract text from the PDF
  const extractFileText = await fileParser.getText();

  // Get file contents
  const fileContents = extractFileText.text;

  // Step 6: Process the markdown file and store the resulting subsections into the document_sections table.

  const processedMd = processMarkdown(fileContents);

  const { data: insertedSections, error } = await supabase
    .from("document_sections")
    .insert(
      processedMd.sections.map(({ content }) => ({
        document_id,
        content,
      })),
    )
    .select("id, content");

  if (error) {
    throw new Error("Failed to store processed documents");
  }

  // Step 7: Return success
  await supabase
    .from("documents")
    .update({ status: "embedding_pending" })
    .eq("id", document_id);

  console.log(
    `Saved ${insertedSections.length} sections for file '${document.name}'`,
  );

  return insertedSections;
};
