"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { login, signup, type AuthResult } from "@/app/actions";

export default function AuthForm({ mode, notice }: { mode: "login" | "signup"; notice?: string }) {
  const [result, setResult] = useState<AuthResult | null>(null);
  const [pending, startTransition] = useTransition();
  const isLogin = mode === "login";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      // On success the server sends the browser to the right page by itself.
      const res = await (isLogin ? login(formData) : signup(formData));
      if (res) setResult(res);
    });
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <h1>{isLogin ? "Log in" : "Create your account"}</h1>
      <p className="muted">
        {isLogin
          ? "See your appointments, or manage the clinic's bookings if you are on the Star Pets team."
          : "Track your bookings and cancel them online. You can still book without an account."}
      </p>

      {notice && (
        <p className="form-error" role="alert">
          {notice}
        </p>
      )}
      {result && (
        <p className={result.ok ? "form-success" : "form-error"} role={result.ok ? "status" : "alert"}>
          {result.message}
        </p>
      )}

      {!isLogin && (
        <>
          <div className="field">
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" name="full_name" type="text" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Mobile number</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="98765 43210" />
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={isLogin ? undefined : 8}
        />
        {!isLogin && <p className="muted small">At least 8 characters.</p>}
      </div>

      <button type="submit" className="btn btn-navy btn-block" disabled={pending}>
        {pending ? (isLogin ? "Logging in…" : "Creating account…") : isLogin ? "Log in" : "Create account"}
      </button>

      <p className="auth-switch">
        {isLogin ? (
          <>
            New here? <Link href="/signup">Create an account</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        )}
      </p>
    </form>
  );
}
