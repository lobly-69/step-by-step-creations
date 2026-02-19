import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? "";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[supabase] URL ou Anon Key em falta. Variáveis tentadas: VITE_SUPABASE_URL / SUPABASE_URL, VITE_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY. A correr em modo offline."
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
