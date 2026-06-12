"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { useSignup } from "~/hooks/api/auth";

import { AuthShell, TextField, PasswordField, FormAlert, SubmitButton } from "./auth/authShell";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupFields = {
  fullName: string;
  email: string;
  password: string;
};

export default function SignupPageUi({
  onNavigateToLogin,
}: {
  onNavigateToLogin?: () => void;
}) {
  const router = useRouter();
  const { createUserWithEmailAndPasswordAsync } = useSignup();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFields>({
    mode: "onBlur",
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const password = watch("password");

  const onSubmit: SubmitHandler<SignupFields> = async (values) => {
    setSubmitError(null);
    try {
      await createUserWithEmailAndPasswordAsync({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });
      router.replace("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Could not create your account. Try again.",
      );
    }
  };

  return (
    <AuthShell
      stamp="Start free"
      heading={
        <>
          Start setting <span className="stroke-word">type.</span>
        </>
      }
      sub="Create an account and publish your first form in minutes. Free plan, forever."
      altLink={{ label: "Sign in", href: "/login" }}
      aside={
        <ul
          className="fade-up"
          style={{
            listStyle: "none",
            margin: "44px 0 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            animationDelay: "0.3s",
          }}
        >
          {["Drag & drop builder", "JSON schema export", "Conditional logic"].map((item) => (
            <li key={item} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span className="mono-label" aria-hidden="true">
                ✓
              </span>
              <span className="body-muted" style={{ fontSize: 15 }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      }
    >
      <h1 className="card-title">Create your account</h1>
      <p className="card-sub body-muted">Free forever for side projects. No card required.</p>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 22 }}
      >
        <TextField
          id="fullName"
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          disabled={isSubmitting}
          error={errors.fullName?.message}
          registration={register("fullName", {
            required: "Your name is required",
            minLength: { value: 2, message: "That seems too short" },
          })}
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          error={errors.email?.message}
          registration={register("email", {
            required: "Email is required",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email" },
          })}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          disabled={isSubmitting}
          error={errors.password?.message}
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Use at least 8 characters" },
          })}
          meter={<PasswordStrength value={password} />}
        />

        {submitError && <FormAlert>{submitError}</FormAlert>}

        <SubmitButton busy={isSubmitting} busyLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <p className="cross-link body-muted">
        Already have an account?{" "}
        {onNavigateToLogin ? (
          <button
            type="button"
            onClick={onNavigateToLogin}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              font: "inherit",
              color: "var(--ink)",
              fontWeight: 500,
              textDecoration: "underline",
              textUnderlineOffset: 4,
            }}
          >
            Sign in
          </button>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </p>
    </AuthShell>
  );
}

/* ───────── password strength ───────── */

function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const labels = ["Too weak", "Weak", "Okay", "Strong"];
  const tone =
    score >= 4
      ? "var(--green)"
      : score >= 2
        ? "var(--ink)"
        : "color-mix(in srgb, var(--err) 80%, var(--ink))";
  return (
    <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", flex: 1, gap: 4, height: 4 }} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "100%",
              background:
                i < score ? tone : "color-mix(in srgb, var(--ink) 14%, transparent)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <span className="mono-label label-muted" style={{ fontSize: 10 }} role="status">
        {value ? labels[Math.max(0, score - 1)] : "Strength"}
      </span>
    </div>
  );
}

function scorePassword(v: string): number {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(4, s);
}
