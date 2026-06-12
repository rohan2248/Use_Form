"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { useSignin } from "~/hooks/api/auth";

import { AuthShell, TextField, PasswordField, FormAlert, SubmitButton } from "./auth/authShell";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginFields = {
  email: string;
  password: string;
};

export default function LoginPageUi() {
  const router = useRouter();
  const { signInUserWithEmailAndPasswordAsync } = useSignin();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFields> = async (values) => {
    setSubmitError(null);
    try {
      await signInUserWithEmailAndPasswordAsync({
        email: values.email,
        password: values.password,
      });
      router.replace("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message ? err.message : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <AuthShell
      stamp="Welcome back"
      heading={
        <>
          Back to
          <br />
          the <span className="stroke-word">press.</span>
        </>
      }
      sub="Your forms, drafts, and responses are exactly where you left them."
      altLink={{ label: "Create account", href: "/sign-up" }}
      aside={
        <div
          className="fade-up"
          style={{ display: "flex", gap: "24px 48px", flexWrap: "wrap", marginTop: 48, animationDelay: "0.3s" }}
        >
          {[
            ["12 000+", "Forms created"],
            ["98%", "Uptime SLA"],
          ].map(([val, label]) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "-0.02em",
                }}
              >
                {val}
              </div>
              <div className="mono-label label-muted" style={{ marginTop: 4 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      }
    >
      <h1 className="card-title">Sign in</h1>
      <p className="card-sub body-muted">Enter your details to open your workspace.</p>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 22 }}
      >
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
          autoComplete="current-password"
          placeholder="Your password"
          disabled={isSubmitting}
          error={errors.password?.message}
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Must be at least 6 characters" },
          })}
        />

        {submitError && <FormAlert>{submitError}</FormAlert>}

        <SubmitButton busy={isSubmitting} busyLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="cross-link body-muted">
        New to Use Form? <Link href="/sign-up">Create an account</Link>
      </p>
    </AuthShell>
  );
}
