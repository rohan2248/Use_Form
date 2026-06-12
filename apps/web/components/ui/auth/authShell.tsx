"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { ThemeToggle } from "~/components/ui/theme-toggle";
import { Logo } from "~/components/ui/logo";

/**
 * Shared shell for the auth pages. Carries the same scoped token contract as
 * the home page (.gfl) so /login and /sign-up read as the same world: paper
 * grain, ruled left panel, stamp badges, Montserrat display, offset-shadow
 * raised card, and the .dark flip via next-themes.
 */
export function AuthShell({
  stamp,
  heading,
  sub,
  aside,
  altLink,
  children,
}: {
  stamp: string;
  heading: React.ReactNode;
  sub: string;
  aside?: React.ReactNode;
  altLink: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="gauth">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- app router; React 19 hoists this to <head> */}
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&family=Roboto:wght@300;400&family=PT+Mono&display=swap"
      />
      <style>{`
        .gauth {
          --ink: #111827;
          --paper: #FAFAF8;
          --raised: #FFFFFF;
          --alt: #F5F4F0;
          --green: #15803D;
          --err: #B91C1C;
          font-family: 'Roboto', sans-serif;
          background-color: var(--paper);
          color: var(--ink);
          min-height: 100vh;
        }
        .dark .gauth {
          --ink: #F2F3EE;
          --paper: #111827;
          --raised: #19202E;
          --alt: #0D121C;
          --green: #4ADE80;
          --err: #F87171;
        }
        .gauth ::selection { background: var(--ink); color: var(--paper); }
        .gauth :is(a, button, input):focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }

        .gauth .paper-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.5;
        }

        .gauth .stamp {
          display: inline-block;
          border: 2px solid var(--ink);
          padding: 2px 10px;
          font-family: 'PT Mono', monospace;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
        }
        .gauth .mono-label {
          font-family: 'PT Mono', monospace;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .gauth .large-display {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900; line-height: 1.05;
          letter-spacing: -0.03em;
          text-wrap: balance;
          overflow-wrap: break-word;
        }
        .gauth .stroke-word {
          color: transparent;
          -webkit-text-stroke: 2px var(--ink);
        }
        .gauth .body-muted { color: color-mix(in srgb, var(--ink) 72%, transparent); }
        .gauth .label-muted { color: color-mix(in srgb, var(--ink) 65%, transparent); }

        .gauth .auth-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          padding: 0 5vw;
          background-color: color-mix(in srgb, var(--paper) 94%, transparent);
          border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
          backdrop-filter: blur(8px);
        }
        .gauth .auth-nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .gauth .nav-logo {
          display: flex; align-items: center; gap: 8px;
          color: var(--ink); text-decoration: none;
        }
        .gauth .nav-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--ink) 70%, transparent);
          text-decoration: none;
          padding: 8px 0;
          transition: color 0.2s;
        }
        .gauth .nav-link:hover { color: var(--ink); }

        .gauth .auth-main {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          min-height: 100vh;
          display: grid; grid-template-columns: 1fr;
          align-items: center;
          gap: 48px;
          padding: 104px 5vw 64px;
        }
        .gauth .auth-pitch { display: none; }
        @media (min-width: 1024px) {
          .gauth .auth-main { grid-template-columns: 1.05fr 0.95fr; gap: 80px; }
          .gauth .auth-pitch { display: block; }
        }
        .gauth .auth-pitch.ruled-bg {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 31px,
            color-mix(in srgb, var(--ink) 6%, transparent) 31px,
            color-mix(in srgb, var(--ink) 6%, transparent) 32px
          );
        }

        .gauth .auth-card {
          background-color: var(--raised);
          border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
          box-shadow: 8px 8px 0 color-mix(in srgb, var(--ink) 8%, transparent);
          padding: clamp(28px, 4vw, 44px);
          max-width: 460px;
          margin: 0 auto;
          width: 100%;
        }
        .gauth .card-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700; font-size: 24px;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .gauth .card-sub {
          font-size: 14px; line-height: 1.6;
          margin: 8px 0 0;
        }

        .gauth .f-label {
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 7px;
        }
        .gauth .f-input {
          display: block; width: 100%;
          background-color: var(--paper);
          border: 1px solid color-mix(in srgb, var(--ink) 25%, transparent);
          color: var(--ink);
          padding: 11px 14px;
          font-family: 'Roboto', sans-serif;
          font-size: 15px;
          transition: border-color 0.2s;
        }
        .gauth .f-input::placeholder { color: color-mix(in srgb, var(--ink) 60%, transparent); }
        .gauth .f-input:focus { outline: none; border-color: var(--ink); }
        .gauth .f-input[aria-invalid="true"] { border-color: var(--err); }
        .gauth .f-input:disabled { opacity: 0.55; cursor: not-allowed; }
        .gauth .f-err {
          margin: 7px 0 0;
          font-size: 12.5px;
          color: var(--err);
        }
        .gauth .pw-wrap { position: relative; }
        .gauth .pw-toggle {
          position: absolute; top: 0; bottom: 0; right: 0;
          display: flex; align-items: center;
          padding: 0 12px;
          background: transparent; border: none; cursor: pointer;
          color: color-mix(in srgb, var(--ink) 65%, transparent);
          transition: color 0.2s;
        }
        .gauth .pw-toggle:hover { color: var(--ink); }

        .gauth .form-alert {
          border: 1px solid color-mix(in srgb, var(--err) 40%, transparent);
          background-color: color-mix(in srgb, var(--err) 9%, transparent);
          color: var(--err);
          padding: 10px 14px;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .gauth .ink-btn {
          background: var(--ink); color: var(--paper);
          border: 1px solid var(--ink);
          width: 100%;
          padding: 13px 28px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500; font-size: 13px; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
        }
        .gauth .ink-btn:hover:not(:disabled) {
          background: color-mix(in srgb, var(--ink) 86%, var(--paper));
          transform: translateY(-1px);
        }
        .gauth .ink-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .gauth .cross-link {
          margin: 28px 0 0;
          text-align: center;
          font-size: 14px;
        }
        .gauth .cross-link a {
          color: var(--ink);
          font-weight: 500;
          text-underline-offset: 4px;
        }

        .gauth .spin { animation: gauth-spin 0.9s linear infinite; }
        @keyframes gauth-spin { to { transform: rotate(360deg); } }
        @keyframes gauth-fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gauth .fade-up {
          opacity: 0;
          animation: gauth-fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .gauth .fade-up { animation: none; opacity: 1; }
          .gauth .spin { animation-duration: 1.5s; }
          .gauth .ink-btn, .gauth .f-input, .gauth .nav-link, .gauth .pw-toggle { transition: none; }
          .gauth .ink-btn:hover:not(:disabled) { transform: none; }
        }
      `}</style>

      <div className="paper-grain" aria-hidden="true" />

      <header className="auth-nav">
        <div className="auth-nav-inner">
          <Link href="/" className="nav-logo">
            <Logo size={18} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ThemeToggle />
            <Link href={altLink.href} className="nav-link">
              {altLink.label}
            </Link>
          </div>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-pitch ruled-bg" style={{ padding: "32px 0 48px" }}>
          <div className="fade-up">
            <span className="stamp">{stamp}</span>
          </div>
          <p
            className="large-display fade-up"
            style={{ fontSize: "clamp(40px, 4.5vw, 64px)", marginTop: 28, animationDelay: "0.1s" }}
          >
            {heading}
          </p>
          <p
            className="body-muted fade-up"
            style={{
              maxWidth: 400,
              fontSize: 17,
              lineHeight: 1.7,
              marginTop: 24,
              fontWeight: 300,
              animationDelay: "0.2s",
            }}
          >
            {sub}
          </p>
          {aside}
        </section>

        <section className="fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="auth-card">{children}</div>
        </section>
      </main>
    </div>
  );
}

export function TextField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  error,
  registration,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div>
      <label htmlFor={id} className="f-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="f-input"
        {...registration}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="f-err">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  disabled,
  error,
  registration,
  meter,
}: {
  id: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  registration: UseFormRegisterReturn;
  /** Optional strength meter, rendered when there is no validation error. */
  meter?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="f-label">
        {label}
      </label>
      <div className="pw-wrap">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="f-input"
          style={{ paddingRight: 44 }}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="pw-toggle"
        >
          {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="f-err">
          {error}
        </p>
      ) : (
        meter
      )}
    </div>
  );
}

export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="form-alert">
      {children}
    </div>
  );
}

export function SubmitButton({
  busy,
  busyLabel,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button type="submit" disabled={busy} className="ink-btn">
      {busy ? (
        <>
          <Loader2 size={15} className="spin" aria-hidden="true" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
