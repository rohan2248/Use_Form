"use client";

import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, type SubmitHandler, type UseFormRegisterReturn } from "react-hook-form";

import { useSignup } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";

import { ThemeToggle } from "./theme-toggle";
import { useRouter } from "next/dist/client/components/navigation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupFields = {
  fullName: string;
  email: string;
  password: string;
  terms: boolean;
};

export default function SignupPageUi({
  productName = "FormCraft",
  onNavigateToLogin,
}: {
  productName?: string;
  onNavigateToLogin?: () => void;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createUserWithEmailAndPasswordAsync } = useSignup();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFields>({
    mode: "onBlur",
    defaultValues: { fullName: "", email: "", password: "", terms: false },
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
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not create your account. Try again.",
      );
    }
    router.replace("/dashboard");
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground font-sans antialiased">
      <PaperGrain />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-base font-semibold tracking-tight">{productName}</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-16 sm:px-10 lg:grid-cols-2 lg:gap-20">
        {/* LEFT — pitch + bullets */}
        <section className="hidden lg:block">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Start free — no credit card
          </p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] tracking-tight">
            Build forms with
            <br />
            <span className="italic text-violet-600 dark:text-violet-400">soul, not styling.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            One question at a time. Beautiful themes baked in. Ship a form your audience actually
            finishes.
          </p>

          <ul className="mt-10 space-y-3.5">
            {[
              "20+ designer-made themes — paper, neon, minimal, more",
              "Logic jumps, hidden fields, conditional flows",
              "Live response analytics & CSV export",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* RIGHT — form */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div className="lg:hidden">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Start free
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                Create your account
              </h1>
            </div>
            <h2 className="hidden font-serif text-2xl font-semibold tracking-tight lg:block">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free forever for personal projects.
            </p>

            <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <Field
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

              <Field
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                disabled={isSubmitting}
                error={errors.email?.message}
                registration={register("email", {
                  required: "Email is required",
                  pattern: { value: EMAIL_PATTERN, message: "Enter a valid email" },
                })}
              />

              <div>
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.password}
                    className={inputClass(!!errors.password)}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Use at least 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p role="alert" className="mt-1.5 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                ) : (
                  <PasswordStrength value={password} />
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-violet-600"
                  {...register("terms", { required: "Please accept the terms to continue" })}
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && (
                <p role="alert" className="-mt-3 text-xs text-destructive">
                  {errors.terms.message}
                </p>
              )}

              {submitError && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "group inline-flex w-full items-center justify-center gap-2 rounded-lg",
                  "bg-foreground px-4 py-2.5 text-sm font-semibold text-background",
                  "shadow-sm transition-all hover:opacity-90",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              {onNavigateToLogin ? (
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              ) : (
                <Link
                  href="/login"
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              )}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ───────── shared bits ───────── */

function Field({
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
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        className={cn("mt-1.5", inputClass(!!error))}
        {...registration}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "block w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm",
    "placeholder:text-muted-foreground/70",
    "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-60",
    hasError
      ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
      : "border-border focus:border-violet-500 focus:ring-violet-500/30",
  );
}

function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const labels = ["Too weak", "Weak", "Okay", "Strong"];
  const tones = ["bg-zinc-200 dark:bg-zinc-800", "bg-amber-500", "bg-violet-500", "bg-emerald-500"];
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex h-1.5 flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 rounded-full transition-colors",
              i < score ? tones[score - 1] : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
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

function BrandMark() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M5 4h11a3 3 0 0 1 3 3v13l-3-2-3 2-3-2-3 2-3-2V7a3 3 0 0 1 3-3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function PaperGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-screen"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
