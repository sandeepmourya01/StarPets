import { cache } from "react";
import { createClient } from "./supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: "customer" | "admin";
};

/** The signed-in person (with their role), or null if signed out. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: (claims.email as string | undefined) ?? "",
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    role: profile?.role === "admin" ? "admin" : "customer",
  };
});
