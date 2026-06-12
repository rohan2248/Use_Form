"use client";
import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetForm, useSubmitForm } from "~/hooks/api/form";
import { ThemeToggle } from "~/components/ui/theme-toggle";

type FieldType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "select"
  | "checkbox"
  | "radio"
  | "yesno"
  | "multiselect";

type Field = {
  id: string;
  label: string;
  labelKey: string;
  fieldType: FieldType;
  placeholder: string | null;
  description: string | null;
  isRequired: boolean;
  index: string;
};

type FormValues = Record<string, string | boolean>;
type FormErrors = Record<string, string>;

// ─── FadeIn ───────────────────────────────────────────────────────────────────

function useInView(ref: React.RefObject<Element>, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Field input ──────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: Field;
  value: string | boolean;
  error?: string;
  onChange: (v: string | boolean) => void;
}) {
  const inputBase = `w-full border bg-white px-3.5 py-2.5 text-sm font-display placeholder:text-ink/25 focus:outline-none transition-colors ${
    error ? "border-red-400 focus:border-red-500" : "border-ink/20 focus:border-ink"
  }`;

  const renderInput = () => {
    switch (field.fieldType) {
      case "text":
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
            className={inputBase}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
            className={inputBase}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className={inputBase}
            style={{ colorScheme: "light" }}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? "name@example.com"}
            className={inputBase}
          />
        );

      case "checkbox":
        return (
          <button
            type="button"
            role="checkbox"
            aria-checked={!!value}
            onClick={() => onChange(!value)}
            className="flex items-center gap-3 mt-1 group"
          >
            <span
              style={{
                width: 20,
                height: 20,
                border: `1.5px solid ${value ? "#111827" : "rgba(17,24,39,0.25)"}`,
                background: value ? "#111827" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {value && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="#FAFAF8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: 14,
                color: "rgba(17,24,39,0.65)",
              }}
            >
              Yes, I agree
            </span>
          </button>
        );

      case "yesno":
        return (
          <div className="flex gap-2 mt-1">
            {(["Yes", "No"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                style={{
                  padding: "10px 32px",
                  border: `1px solid ${value === opt ? "#111827" : "rgba(17,24,39,0.18)"}`,
                  background: value === opt ? "#111827" : "#fff",
                  color: value === opt ? "#FAFAF8" : "rgba(17,24,39,0.6)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "select":
      case "radio":
      case "multiselect":
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? "Type your answer…"}
            className={inputBase}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
            className={inputBase}
          />
        );
    }
  };

  return (
    <div>
      {renderInput()}
      {field.description && !error && (
        <p
          style={{
            marginTop: 6,
            fontFamily: "'Roboto', sans-serif",
            fontSize: 12,
            color: "rgba(17,24,39,0.4)",
            fontWeight: 300,
          }}
        >
          {field.description}
        </p>
      )}
      {error && (
        <p
          style={{
            marginTop: 6,
            fontFamily: "'PT Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.06em",
            color: "#DC2626",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div>
      <div className="h-6 bg-ink/8 w-1/3 mb-4 animate-pulse" />
      <div className="h-9 bg-ink/8 w-2/3 mb-3 animate-pulse" />
      <div className="h-4 bg-ink/6 w-full mb-2 animate-pulse" />
      <div className="h-4 bg-ink/6 w-4/5 mb-12 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-8 pb-8 border-b border-ink/8">
          <div className="h-3 bg-ink/8 w-24 mb-3 animate-pulse" />
          <div className="h-11 bg-ink/6 w-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ formTitle }: { formTitle: string }) {
  return (
    <FadeIn>
      <div style={{ textAlign: "center", paddingTop: 64 }}>
        <div
          style={{
            width: 52,
            height: 52,
            background: "#111827",
            margin: "0 auto 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
            <path
              d="M1.5 8.5l7 7L20.5 1"
              stroke="#FAFAF8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            fontFamily: "'PT Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(17,24,39,0.35)",
            marginBottom: 14,
          }}
        >
          Submitted successfully
        </div>
        <h2
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Thank you!
        </h2>
        <p
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: 15,
            lineHeight: 1.7,
            color: "rgba(17,24,39,0.55)",
            fontWeight: 300,
            maxWidth: 360,
            margin: "0 auto",
          }}
        >
          Your response to <em>{formTitle}</em> has been recorded.
        </p>
      </div>
    </FadeIn>
  );
}

// ─── Not available screen ─────────────────────────────────────────────────────

function UnavailableScreen({ status }: { status: "draft" | "unpublished" | "not_found" | "limit_reached" }) {
  const messages = {
    not_found: {
      label: "404 — Not found",
      heading: "Form not found",
      body: "This form doesn't exist or the link may be broken.",
    },
    draft: {
      label: "Not published",
      heading: "Coming soon",
      body: "This form hasn't been published yet.",
    },
    unpublished: {
      label: "Closed",
      heading: "This form is closed",
      body: "The form owner has stopped accepting responses.",
    },
    limit_reached: {
      label: "Closed",
      heading: "No longer accepting responses",
      body: "This form has reached its response limit.",
    },
  };

  const { label, heading, body } = messages[status];

  return (
    <FadeIn>
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <div
          style={{
            display: "inline-block",
            border: "2px solid #111827",
            padding: "2px 10px",
            fontFamily: "'PT Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          {label}
        </div>
        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(24px, 5vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          {heading}
        </h1>
        <p
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: 15,
            color: "rgba(17,24,39,0.5)",
            fontWeight: 300,
            lineHeight: 1.7,
          }}
        >
          {body}
        </p>
        <div style={{ marginTop: 40 }}>
          <Link
            href="/"
            style={{
              background: "#111827",
              color: "#FAFAF8",
              border: "1px solid #111827",
              padding: "12px 28px",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "inline-block",
              transition: "background 0.2s",
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicFormPage() {
  const params = useParams();
  const formId = params?.form_id as string;
  const { form, isLoading, error } = useGetForm(formId);
  const { submitFormAsync } = useSubmitForm();

  const sorted = form
    ? [...form.fields].sort((a, b) => parseFloat(a.index) - parseFloat(b.index))
    : [];

  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getValue = (id: string, fieldType: FieldType): string | boolean => {
    const v = values[id];
    if (v !== undefined) return v;
    return fieldType === "checkbox" ? false : "";
  };

  const handleChange = (id: string, v: string | boolean) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    if (errors[id]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    for (const field of sorted) {
      if (!field.isRequired) continue;
      const v = getValue(field.id, field.fieldType as FieldType);
      if (field.fieldType === "checkbox") {
        if (!v) next[field.id] = "Please check this field to continue";
      } else if (!String(v).trim()) {
        next[field.id] = "This field is required";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fieldValues = sorted.map((field) => ({
        formFieldId: field.id,
        value: String(getValue(field.id, field.fieldType as FieldType)),
      }));
      await submitFormAsync({ formId, values: fieldValues });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: "#FAFAF8",
        color: "#111827",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&family=Roboto:wght@300;400;500&family=PT+Mono&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #111827; color: #FAFAF8; }
        .font-display { font-family: 'Montserrat', sans-serif; }
        .font-mono    { font-family: 'PT Mono', monospace; }
        .paper-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px; opacity: 0.5;
        }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
      `}</style>

      <div className="paper-grain" />

      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(17,24,39,0.1)",
          backgroundColor: "rgba(250,250,248,0.94)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "0 5vw",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: "-0.02em",
                color: "#111827",
              }}
            >
              Go
            </span>
            <span
              style={{
                border: "1.5px solid #111827",
                padding: "1px 6px",
                fontFamily: "'PT Mono', monospace",
                fontSize: 8,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#111827",
              }}
            >
              Form
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <Link
              href="/sign-up"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(17,24,39,0.45)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(17,24,39,0.45)")}
            >
              Create your own →
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          padding: "64px 5vw 100px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {isLoading ? (
            <FormSkeleton />
          ) : error || !form ? (
            <UnavailableScreen status="not_found" />
          ) : form.status === "draft" ? (
            <UnavailableScreen status="draft" />
          ) : form.status === "unpublished" ? (
            <UnavailableScreen status="unpublished" />
          ) : form.maxResponses !== null && form.responseCount >= form.maxResponses ? (
            <UnavailableScreen status="limit_reached" />
          ) : submitted ? (
            <SuccessScreen formTitle={form.title} />
          ) : (
            <>
              {/* Form header */}
              <FadeIn>
                <div
                  style={{
                    fontFamily: "'PT Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(17,24,39,0.32)",
                    marginBottom: 20,
                  }}
                >
                  {sorted.length} question{sorted.length !== 1 ? "s" : ""}
                </div>
                <h1
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(26px, 5vw, 44px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.025em",
                    marginBottom: form.description ? 20 : 52,
                  }}
                >
                  {form.title}
                </h1>
                {form.description && (
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.75,
                      color: "rgba(17,24,39,0.58)",
                      fontWeight: 300,
                      marginBottom: 52,
                      maxWidth: 520,
                    }}
                  >
                    {form.description}
                  </p>
                )}
              </FadeIn>

              {/* Fields */}
              <form onSubmit={handleSubmit} noValidate>
                <div>
                  {sorted.map((field, i) => (
                    <FadeIn key={field.id} delay={i * 55}>
                      <div
                        style={{
                          borderBottom: "1px solid rgba(17,24,39,0.07)",
                          paddingBottom: 32,
                          marginBottom: 32,
                        }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            marginBottom: 10,
                            color: "#111827",
                          }}
                        >
                          {field.label}
                          {field.isRequired && (
                            <span
                              style={{
                                color: "#DC2626",
                                marginLeft: 4,
                                fontFamily: "'PT Mono', monospace",
                              }}
                            >
                              *
                            </span>
                          )}
                        </label>
                        <FieldInput
                          field={field as Field}
                          value={getValue(field.id, field.fieldType as FieldType)}
                          error={errors[field.id]}
                          onChange={(v) => handleChange(field.id, v)}
                        />
                      </div>
                    </FadeIn>
                  ))}

                  {sorted.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "80px 0",
                        fontFamily: "'PT Mono', monospace",
                        fontSize: 11,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(17,24,39,0.3)",
                      }}
                    >
                      No fields have been added to this form yet
                    </div>
                  )}
                </div>

                {sorted.length > 0 && (
                  <FadeIn delay={Math.min(sorted.length * 55, 400)} className="mt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: submitting ? "rgba(17,24,39,0.55)" : "#111827",
                        color: "#FAFAF8",
                        border: "1px solid #111827",
                        padding: "14px 44px",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: 12,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: submitting ? "not-allowed" : "pointer",
                        transition: "background 0.2s, transform 0.15s",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting)
                          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            style={{ animation: "spin 0.7s linear infinite" }}
                          >
                            <circle
                              cx="7"
                              cy="7"
                              r="5.5"
                              stroke="rgba(250,250,248,0.4)"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5"
                              stroke="#FAFAF8"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          Submitting…
                        </>
                      ) : (
                        "Submit →"
                      )}
                    </button>
                    {Object.keys(errors).length > 0 && (
                      <p
                        style={{
                          marginTop: 14,
                          fontFamily: "'PT Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "0.06em",
                          color: "#DC2626",
                        }}
                      >
                        Please fill in all required fields above
                      </p>
                    )}
                    {submitError && (
                      <p
                        style={{
                          marginTop: 14,
                          fontFamily: "'PT Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "0.06em",
                          color: "#DC2626",
                        }}
                      >
                        {submitError}
                      </p>
                    )}
                    {Object.keys(errors).length === 0 && !submitError && (
                      <p
                        style={{
                          marginTop: 14,
                          fontFamily: "'PT Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          color: "rgba(17,24,39,0.28)",
                        }}
                      >
                        Fields marked * are required
                      </p>
                    )}
                  </FadeIn>
                )}
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(17,24,39,0.09)",
          padding: "22px 5vw",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "'PT Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(17,24,39,0.28)",
              }}
            >
              Powered by
            </span>
            <Link
              href="/"
              style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}
            >
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: 12,
                  letterSpacing: "-0.02em",
                  color: "#111827",
                }}
              >
                Go
              </span>
              <span
                style={{
                  border: "1px solid rgba(17,24,39,0.28)",
                  padding: "0 5px",
                  fontFamily: "'PT Mono', monospace",
                  fontSize: 7,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(17,24,39,0.38)",
                }}
              >
                Form
              </span>
            </Link>
          </div>
          <Link
            href="/sign-up"
            style={{
              fontFamily: "'PT Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "rgba(17,24,39,0.32)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(17,24,39,0.32)")}
          >
            Create your own form →
          </Link>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
