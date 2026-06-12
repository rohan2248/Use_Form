"use client";

import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, type SubmitHandler, type UseFormRegisterReturn } from "react-hook-form";

import { cn } from "~/lib/utils";

import { ThemeToggle } from "./theme-toggle";
import { useSignin } from "~/hooks/api/auth";
import { useRouter } from "next/dist/client/components/navigation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginFields = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginPageUi({
  productName = "FormCraft",
  onLogin,
}: {
  productName?: string;
  onLogin?: (data: LoginFields) => void | Promise<void>;
}) {
  const router = useRouter();
  const { signInUserWithEmailAndPasswordAsync } = useSignin();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    mode: "onBlur",
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit: SubmitHandler<LoginFields> = async (values) => {
    setSubmitError(null);
    try {
      const { id } = await signInUserWithEmailAndPasswordAsync({
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
    router.replace("/dashboard");
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground font-sans antialiased">
      <PaperGrain />

      {/* Top bar — brand + theme toggle */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-base font-semibold tracking-tight">{productName}</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-16 sm:px-10 lg:grid-cols-2 lg:gap-20">
        {/* LEFT — pitch */}
        <section className="hidden lg:block">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Welcome back
          </p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] tracking-tight">
            Forms that feel
            <br />
            <span className="italic text-violet-600 dark:text-violet-400">like paper.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Sign in to keep building thoughtful, on-brand forms — with themes that read like a
            magazine, not a spreadsheet.
          </p>

          <ThemeShowcase />
        </section>

        {/* RIGHT — form card */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div className="lg:hidden">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Welcome back
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                Sign in to {productName}
              </h1>
            </div>
            <h2 className="hidden font-serif text-2xl font-semibold tracking-tight lg:block">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your details to access your workspace.
            </p>

            <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <Field
                id="email"
                label="Email"
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.password}
                    className={inputClass(!!errors.password)}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Must be at least 6 characters" },
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
                {errors.password && (
                  <p role="alert" className="mt-1.5 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-border accent-violet-600"
                  {...register("remember")}
                />
                <span className="text-sm text-muted-foreground">Keep me signed in</span>
              </label>

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
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to {productName}?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
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

/** Subtle paper-grain — pure SVG noise as a CSS data URL, no extra assets needed. */
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

/** Quick visual cue at the bottom of the left column — three theme chips. */
function ThemeShowcase() {
  const chips = [
    {
      name: "Minimal",
      bg: "bg-zinc-50 dark:bg-zinc-900",
      ring: "ring-zinc-300 dark:ring-zinc-700",
    },
    {
      name: "Paper",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      ring: "ring-amber-300 dark:ring-amber-700/60",
    },
    {
      name: "Neon",
      bg: "bg-violet-50 dark:bg-violet-950/40",
      ring: "ring-violet-300 dark:ring-violet-700/60",
    },
  ];
  return (
    <div className="mt-10 flex items-center gap-3">
      {chips.map((c) => (
        <div
          key={c.name}
          className={cn(
            "flex h-20 w-24 flex-col items-start justify-between rounded-xl p-3 ring-1",
            c.bg,
            c.ring,
          )}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Theme
          </span>
          <span className="font-serif text-sm">{c.name}</span>
        </div>
      ))}
      <span className="ml-1 text-sm text-muted-foreground">+ 20 more</span>
    </div>
  );
}
