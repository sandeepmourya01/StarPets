import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ confirm?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/account");

  const { confirm } = await searchParams;

  return (
    <>
      <Header />
      <main className="auth-page">
        <AuthForm
          mode="login"
          notice={confirm === "failed" ? "That confirmation link did not work or has expired. Log in, or sign up again." : undefined}
        />
      </main>
      <Footer />
    </>
  );
}
