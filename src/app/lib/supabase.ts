import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton Supabase client for frontend auth
export const supabase = createClient(supabaseUrl, publicAnonKey);
