import { supabase } from "../utils/supabaseCliemt";
import toast from "react-hot-toast";

export async function login(email, password) {
  toast.loading("Logging in...");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  toast.dismiss();

  if (error) {
    toast.error(error.message);
    throw error;
  }

  toast.success("Your logged in!");

  return data.session;
}

export async function signup(email, password) {
  toast.loading("Creating account...");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  toast.dismiss();

  if (error) {
    toast.error(error.message);
    throw error;
  }

  toast.success("Account created!");
  toast("Check your email to verify your account 📩", {
    icon: "✉️",
    duration: 5000,
  });

  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}
