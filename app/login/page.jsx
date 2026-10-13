"use client";

import { useEffect, useState } from "react";
import { SignInWithApixis } from "../../components/SignInWithApixis.tsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error")) setError("Your sign-in link expired or could not be verified. Please sign in again.");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), next: new URLSearchParams(window.location.search).get("next") }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "request_failed");
      }

      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <header className="top">
        <div>
          <div className="logo">LAUNCHIXIS</div>
          <h1>Welcome to your<br/><em>next chapter.</em></h1>
          <SignInWithApixis />
          <p className="lede">
            Magic link login for existing accounts. Enter your email — we'll send you a
            one-click sign-in link. New here? Create your account with Sign in with Apixis.
          </p>
        </div>
      </header>

      {sent ? (
        <div className="login-success">
          <h2>Check your email</h2>
          <p>
            We sent a magic link to <strong>{email}</strong>. Click the link in
            the email to sign in.
          </p>
          <p style={{ marginTop: 12, color: "var(--dim)", fontSize: 14 }}>
            Didn't receive it? Check spam, or{" "}
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--gold)",
                textDecoration: "underline",
                cursor: "pointer",
                font: "inherit",
                padding: 0,
              }}
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="err" role="alert">{error}</p>}
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading || !email.trim()}>
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}

      <div className="login-footer">
        <a href="/">← Back to board</a>
      </div>

      <style jsx>{`
        .login-form {
          max-width: 400px;
          margin: 24px 0;
        }

        .login-form > div {
          margin-bottom: 16px;
        }

        .login-success {
          max-width: 500px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }

        .login-success h2 {
          font-size: 18px;
          color: var(--gold-2);
          margin: 0 0 12px 0;
        }

        .login-success p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
          margin: 8px 0;
        }

        .login-success strong {
          color: var(--text);
        }

        .login-footer {
          margin-top: 24px;
        }

        .login-footer a {
          color: var(--gold);
          text-decoration: none;
          font-size: 14px;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
