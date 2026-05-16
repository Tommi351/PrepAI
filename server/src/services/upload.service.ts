import { createClient } from "@supabase/supabase-js";

type UploadServiceInput = {
  file: Express.Multer.File;
  token: string;
};

export const uploadService = async ({ file, token }: UploadServiceInput) => {
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

  // Step 3: Extract user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Step 4: Build correct file path
  const filePath = `${user.id}/${crypto.randomUUID()}-${file.originalname}`;

  // Step 5: Upload file
  const uploadFile = await supabase.storage
    .from("files")
    .upload(filePath, file.buffer);

  if (uploadFile.error) throw uploadFile.error;

  // Step 6: Return result
  return { filePath, uploadFile };
};
