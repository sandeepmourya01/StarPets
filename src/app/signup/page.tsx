import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/account");

  return (
    <>
      <Header />
      <main className="auth-page">
        <AuthForm mode="signup" />
      </main>
      <Footer />
    </>
  );
}
