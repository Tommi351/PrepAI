import { createClient } from "@supabase/supabase-js";

type InsertDocumentInput = {
  filePath: string;
  fileName: string;
  token: string;
};

export const getDocumentsFromFiles = async ({ token }: { token: string }) => {
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

  // 1. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: documents, error } = await supabase
    .from("documents")
    .select()
    .eq("created_by", user.id);

  if (error) throw error; // Let the controller's catch block handle it

  return documents || []; // Always return an array
};

export const insertFilesIntoDocument = async ({
  filePath,
  fileName,
  token,
}: InsertDocumentInput) => {
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

  // 1. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 3. Insert into documents table
  const { data, error } = await supabase
    .from("documents")
    .insert({
      name: fileName,
      created_by: user.id,
      storage_path: filePath,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    document_id: data.id,
  };
};
