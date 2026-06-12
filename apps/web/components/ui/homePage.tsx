"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "~/components/ui/theme-toggle";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "Explore", href: "/explore" },
];

const FEATURES = [
  {
    icon: "✦",
    title: "Drag & drop, zero friction",
    desc: "Compose forms the way you'd lay out a newspaper. Fields snap into place with typographic precision.",
  },
  {
    icon: "◈",
    title: "JSON schema export",
    desc: "Every form you build outputs clean, portable JSON. Own your data, integrate anywhere.",
  },
  {
    icon: "◎",
    title: "Live preview",
    desc: "What you design is exactly what your respondents see. No surprises, no re-renders, no guesswork.",
  },
  {
    icon: "⬡",
    title: "Conditional logic",
    desc: "Branch and skip with simple rules. Build smart flows without touching a single line of code.",
  },
  {
    icon: "◇",
    title: "Paper-native styling",
    desc: "Forms inherit your brand's typographic system. Serif, sans, monospace — all tuned to perfection.",
  },
  {
    icon: "⊕",
    title: "Submission analytics",
    desc: "Completion rates, drop-off points, time per field. The numbers that actually help you improve.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add fields",
    desc: "Drag text, date, dropdown, or file fields onto your canvas.",
  },
  {
    step: "02",
    title: "Style it",
    desc: "Set typography, spacing, and accent color to match your brand.",
  },
  {
    step: "03",
    title: "Publish",
    desc: "Share a link or embed an iframe. Submissions flow in instantly.",
  },
];

const PRICING = [
  {
    tier: "Sketch",
    price: "0",
    period: "forever",
    tagline: "For tinkerers and side projects.",
    features: ["3 active forms", "100 submissions / mo", "JSON export", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    tier: "Press",
    price: "18",
    period: "per month",
    tagline: "For teams shipping real products.",
    features: [
      "Unlimited forms",
      "10 000 submissions / mo",
      "Conditional logic",
      "Webhook & Zapier",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    tier: "Edition",
    price: "64",
    period: "per month",
    tagline: "For organizations with custom needs.",
    features: [
      "Everything in Press",
      "Unlimited submissions",
      "SSO & audit logs",
      "Custom domain",
      "Dedicated onboarding",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "Switched from Typeform in an afternoon. The output JSON is so clean.",
    name: "Arjun M.",
    role: "Product Engineer, Fintech",
  },
  {
    quote:
      "Finally a form builder that respects typography. Our brand guidelines translate perfectly.",
    name: "Sara L.",
    role: "Design Lead, Agency",
  },
  {
    quote: "Conditional logic used to be a weekend task. Now it's ten minutes.",
    name: "Daniel K.",
    role: "Ops Manager, SaaS Co.",
  },
];

function useInView(ref: React.RefObject<Element>, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e && e.isIntersecting) setInView(true);
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
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [hoveredPricing, setHoveredPricing] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setActiveNav(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const annualPrice = (p: string) => (p === "0" ? "0" : Math.round(parseInt(p) * 0.8).toString());

  return (
    <div
      style={{ fontFamily: "'Roboto', sans-serif", backgroundColor: "#FAFAF8", color: "#111827" }}
      className="min-h-screen"
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&family=Roboto:wght@300;400;500&family=PT+Mono&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #111827; color: #FAFAF8; }
        .paper-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.5;
        }
        .ruled-bg {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 31px,
            rgba(17,24,39,0.06) 31px,
            rgba(17,24,39,0.06) 32px
          );
        }
        .ink-btn {
          background: #111827; color: #FAFAF8;
          border: 1px solid #111827;
          padding: 12px 28px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500; font-size: 13px; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          display: inline-block;
        }
        .ink-btn:hover { background: #2d3748; transform: translateY(-1px); }
        .ghost-btn {
          background: transparent; color: #111827;
          border: 1px solid #111827;
          padding: 11px 28px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500; font-size: 13px; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          display: inline-block;
        }
        .ghost-btn:hover { background: #111827; color: #FAFAF8; transform: translateY(-1px); }
        .stamp {
          display: inline-block;
          border: 2px solid #111827;
          padding: 2px 10px;
          font-family: 'PT Mono', monospace;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
        }
        .rule-top { border-top: 1px solid rgba(17,24,39,0.15); }
        .rule-bottom { border-bottom: 1px solid rgba(17,24,39,0.15); }
        .section-num {
          font-family: 'PT Mono', monospace;
          font-size: 11px; letter-spacing: 0.1em; color: rgba(17,24,39,0.35);
        }
        .large-display {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900; line-height: 1.0;
          letter-spacing: -0.03em;
        }
        .toggle-track {
          width: 44px; height: 24px;
          background: #111827; border-radius: 12px;
          position: relative; cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .toggle-thumb {
          position: absolute; top: 3px;
          width: 18px; height: 18px;
          background: #FAFAF8; border-radius: 50%;
          transition: left 0.2s;
        }
        .feature-card {
          border: 1px solid rgba(17,24,39,0.12);
          background: #FFFFFF;
          padding: 28px 24px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .feature-card:hover {
          border-color: #111827;
          box-shadow: 4px 4px 0 #111827;
          transform: translate(-2px, -2px);
        }
        .pricing-card {
          border: 1px solid rgba(17,24,39,0.12);
          background: #FFFFFF;
          padding: 36px 32px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          position: relative;
        }
        .pricing-card.active {
          border: 2px solid #111827;
          box-shadow: 6px 6px 0 #111827;
          transform: translate(-3px, -3px);
        }
        .marquee-wrap { overflow: hidden; white-space: nowrap; }
        .marquee-inner {
          display: inline-block;
          animation: marquee 22s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .step-num {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900; font-size: 64px;
          line-height: 1; color: rgba(17,24,39,0.07);
          position: absolute; top: -8px; right: 16px;
          pointer-events: none; user-select: none;
        }
      `}</style>

      <div className="paper-grain" />

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: activeNav ? "rgba(250,250,248,0.95)" : "transparent",
          borderBottom: activeNav ? "1px solid rgba(17,24,39,0.1)" : "1px solid transparent",
          backdropFilter: activeNav ? "blur(8px)" : "none",
          transition: "all 0.3s ease",
          padding: "0 5vw",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              Go
            </span>
            <span className="stamp" style={{ fontSize: 9, padding: "1px 6px" }}>
              Form
            </span>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#111827",
                  textDecoration: "none",
                  opacity: 0.65,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.65")}
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
            <Link href="/sign-up" className="ink-btn" style={{ padding: "9px 20px", fontSize: 11 }}>
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="ruled-bg"
        style={{
          paddingTop: 160,
          paddingBottom: 120,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ opacity: 0, animation: "fadeUp 0.8s ease 0.1s forwards" }}>
            <style>{`@keyframes fadeUp { to { opacity:1; transform:translateY(0); } from { opacity:0; transform:translateY(32px); } }`}</style>
            <span className="stamp">Beta — Now open</span>
          </div>
          <div style={{ marginTop: 32, maxWidth: 840 }}>
            <h1
              className="large-display"
              style={{
                fontSize: "clamp(52px, 9vw, 108px)",
                opacity: 0,
                animation: "fadeUp 0.9s ease 0.2s forwards",
              }}
            >
              Forms,
              <br />
              <span style={{ color: "transparent", WebkitTextStroke: "2px #111827" }}>
                set in
              </span>{" "}
              type.
            </h1>
          </div>
          <p
            style={{
              maxWidth: 480,
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(17,24,39,0.6)",
              marginTop: 32,
              fontWeight: 300,
              opacity: 0,
              animation: "fadeUp 0.9s ease 0.35s forwards",
            }}
          >
            A form builder for people who care about craft. Minimal interface, maximum control.
            Inspired by the discipline of the printed page.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 48,
              flexWrap: "wrap",
              opacity: 0,
              animation: "fadeUp 0.9s ease 0.45s forwards",
            }}
          >
            <Link href="/sign-up" className="ink-btn">
              Start building free
            </Link>
            <button className="ghost-btn">See it in action</button>
          </div>
          <div
            style={{
              marginTop: 80,
              display: "flex",
              gap: 40,
              opacity: 0,
              animation: "fadeUp 0.9s ease 0.55s forwards",
            }}
          >
            {[
              ["12 000+", "Forms created"],
              ["98%", "Uptime SLA"],
              ["< 0.3s", "Avg load time"],
            ].map(([val, label]) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: 28,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontFamily: "'PT Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "rgba(17,24,39,0.45)",
                    marginTop: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* decorative element */}
        <div
          style={{
            position: "absolute",
            right: "5vw",
            top: "50%",
            transform: "translateY(-50%)",
            width: 320,
            height: 400,
            border: "1px solid rgba(17,24,39,0.12)",
            backgroundColor: "#FFFFFF",
            padding: 24,
            boxShadow: "8px 8px 0 rgba(17,24,39,0.08)",
            opacity: 0,
            animation: "fadeUp 1s ease 0.5s forwards",
          }}
          className="hidden lg:block"
        >
          <div
            style={{
              fontFamily: "'PT Mono', monospace",
              fontSize: 10,
              color: "rgba(17,24,39,0.35)",
              marginBottom: 20,
              letterSpacing: "0.1em",
            }}
          >
            FORM PREVIEW — DRAFT
          </div>
          {[
            { label: "Full name", type: "text", value: "Rohan Sharma" },
            { label: "Email", type: "email", value: "rohan@example.com" },
            { label: "Company size", type: "select", value: "11–50 people" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  color: "#111827",
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  borderBottom: "1px solid #111827",
                  paddingBottom: 8,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 14,
                  color: "rgba(17,24,39,0.7)",
                }}
              >
                {f.value}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 32 }}>
            <div
              style={{
                background: "#111827",
                color: "#FAFAF8",
                padding: "10px 20px",
                display: "inline-block",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Submit →
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              fontFamily: "'PT Mono', monospace",
              fontSize: 9,
              color: "rgba(17,24,39,0.25)",
              letterSpacing: "0.08em",
            }}
          >
            GO FORM v2
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div
        className="rule-top rule-bottom"
        style={{ padding: "14px 0", backgroundColor: "#111827" }}
      >
        <div className="marquee-wrap">
          <div className="marquee-inner">
            {Array(2)
              .fill([
                "Drag & Drop Builder",
                "JSON Export",
                "Conditional Logic",
                "Live Preview",
                "Webhook Integrations",
                "Submission Analytics",
                "Custom Domains",
                "Team Collaboration",
              ])
              .flat()
              .map((t, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#FAFAF8",
                    marginRight: 48,
                  }}
                >
                  {t} <span style={{ marginRight: 48, opacity: 0.3 }}>◆</span>
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <span className="section-num">§ 01 — Features</span>
            <h2
              className="large-display"
              style={{ fontSize: "clamp(32px, 5vw, 56px)", marginTop: 12, maxWidth: 480 }}
            >
              Every tool you need, nothing you don't.
            </h2>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 1,
              marginTop: 56,
              backgroundColor: "rgba(17,24,39,0.1)",
            }}
          >
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="feature-card" style={{ height: "100%" }}>
                  <div style={{ fontSize: 22, marginBottom: 16, color: "#111827" }}>{f.icon}</div>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: "-0.01em",
                      marginBottom: 10,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "rgba(17,24,39,0.6)",
                      fontWeight: 300,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "80px 5vw", backgroundColor: "#111827" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <span
              style={{
                fontFamily: "'PT Mono', monospace",
                fontSize: 11,
                color: "rgba(250,250,248,0.4)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              § 02 — How it works
            </span>
            <h2
              className="large-display"
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                marginTop: 12,
                color: "#FAFAF8",
                maxWidth: 480,
              }}
            >
              Three steps to publish.
            </h2>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
              marginTop: 56,
            }}
          >
            {HOW_IT_WORKS.map((s, i) => (
              <FadeIn key={s.step} delay={i * 120}>
                <div
                  style={{
                    padding: "32px 28px",
                    border: "1px solid rgba(250,250,248,0.1)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div className="step-num" style={{ color: "rgba(250,250,248,0.07)" }}>
                    {s.step}
                  </div>
                  <div
                    style={{
                      fontFamily: "'PT Mono', monospace",
                      fontSize: 11,
                      color: "rgba(250,250,248,0.4)",
                      letterSpacing: "0.1em",
                      marginBottom: 16,
                    }}
                  >
                    {s.step}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: 20,
                      color: "#FAFAF8",
                      marginBottom: 12,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "rgba(250,250,248,0.55)",
                      fontWeight: 300,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "100px 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <span className="section-num">§ 03 — Pricing</span>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 24,
                marginTop: 12,
              }}
            >
              <h2
                className="large-display"
                style={{ fontSize: "clamp(32px, 5vw, 56px)", maxWidth: 400 }}
              >
                Simple, honest pricing.
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: billingAnnual ? 0.4 : 1,
                  }}
                >
                  Monthly
                </span>
                <div
                  className="toggle-track"
                  onClick={() => setBillingAnnual((b) => !b)}
                  role="switch"
                  aria-checked={billingAnnual}
                >
                  <div className="toggle-thumb" style={{ left: billingAnnual ? 23 : 3 }} />
                </div>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: billingAnnual ? 1 : 0.4,
                  }}
                >
                  Annual{" "}
                  <span
                    style={{ fontFamily: "'PT Mono', monospace", fontSize: 10, color: "#16A34A" }}
                  >
                    −20%
                  </span>
                </span>
              </div>
            </div>
          </FadeIn>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              marginTop: 48,
            }}
          >
            {PRICING.map((plan, i) => (
              <FadeIn key={plan.tier} delay={i * 100}>
                <div
                  className={`pricing-card${hoveredPricing === i || plan.highlight ? " active" : ""}`}
                  onMouseEnter={() => setHoveredPricing(i)}
                  onMouseLeave={() => setHoveredPricing(null)}
                >
                  {plan.highlight && (
                    <div style={{ position: "absolute", top: -1, left: 32 }}>
                      <span
                        className="stamp"
                        style={{
                          fontSize: 9,
                          background: "#111827",
                          color: "#FAFAF8",
                          border: "none",
                          padding: "3px 10px",
                        }}
                      >
                        Most popular
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: "'PT Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "rgba(17,24,39,0.4)",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    {plan.tier}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 900,
                        fontSize: 48,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      ${billingAnnual ? annualPrice(plan.price) : plan.price}
                    </span>
                    {plan.price !== "0" && (
                      <span
                        style={{
                          fontFamily: "'PT Mono', monospace",
                          fontSize: 11,
                          color: "rgba(17,24,39,0.4)",
                          textTransform: "uppercase",
                        }}
                      >
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(17,24,39,0.55)",
                      lineHeight: 1.6,
                      marginBottom: 28,
                      fontWeight: 300,
                    }}
                  >
                    {plan.tagline}
                  </p>
                  <div
                    style={{
                      borderTop: "1px solid rgba(17,24,39,0.1)",
                      paddingTop: 20,
                      marginBottom: 28,
                    }}
                  >
                    {plan.features.map((f) => (
                      <div
                        key={f}
                        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
                      >
                        <span
                          style={{
                            fontFamily: "'PT Mono', monospace",
                            fontSize: 12,
                            color: "#16A34A",
                          }}
                        >
                          ✓
                        </span>
                        <span
                          style={{ fontSize: 13, color: "rgba(17,24,39,0.75)", fontWeight: 300 }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  {plan.cta === "Talk to us" ? (
                    <button
                      className="ghost-btn"
                      style={{ width: "100%", textAlign: "center", padding: "12px 0" }}
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <Link
                      href="/sign-up"
                      className={plan.highlight ? "ink-btn" : "ghost-btn"}
                      style={{
                        width: "100%",
                        textAlign: "center",
                        padding: "12px 0",
                        display: "block",
                      }}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={300}>
            <p
              style={{
                textAlign: "center",
                marginTop: 32,
                fontFamily: "'PT Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "rgba(17,24,39,0.35)",
                textTransform: "uppercase",
              }}
            >
              All plans include SSL, GDPR-ready exports, and 99.9% uptime.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        style={{
          padding: "80px 5vw",
          backgroundColor: "#F5F4F0",
          borderTop: "1px solid rgba(17,24,39,0.08)",
          borderBottom: "1px solid rgba(17,24,39,0.08)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <span className="section-num">§ 04 — From the field</span>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              marginTop: 40,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div
                  style={{
                    padding: "28px 24px",
                    borderLeft: "3px solid #111827",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      fontWeight: 300,
                      marginBottom: 20,
                      fontStyle: "italic",
                    }}
                  >
                    "{t.quote}"
                  </p>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'PT Mono', monospace",
                      fontSize: 10,
                      color: "rgba(17,24,39,0.4)",
                      marginTop: 4,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 5vw", textAlign: "center" }}>
        <FadeIn>
          <span className="stamp" style={{ marginBottom: 24, display: "inline-block" }}>
            Start today
          </span>
          <h2
            className="large-display"
            style={{ fontSize: "clamp(40px, 7vw, 80px)", maxWidth: 600, margin: "16px auto 0" }}
          >
            Your first form,
            <br />
            in under a minute.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(17,24,39,0.5)", marginTop: 24, fontWeight: 300 }}>
            No credit card. No setup. Just type.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginTop: 48,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/sign-up"
              className="ink-btn"
              style={{ fontSize: 14, padding: "14px 36px" }}
            >
              Create your free account
            </Link>
            <button className="ghost-btn" style={{ fontSize: 14, padding: "13px 36px" }}>
              Read the docs
            </button>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(17,24,39,0.12)", padding: "48px 5vw" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: 16,
                  letterSpacing: "-0.02em",
                }}
              >
                Go
              </span>
              <span className="stamp" style={{ fontSize: 9, padding: "1px 6px" }}>
                Form
              </span>
            </div>
            <p
              style={{
                fontFamily: "'PT Mono', monospace",
                fontSize: 10,
                color: "rgba(17,24,39,0.35)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              © 2025 Go Form. All rights reserved.
            </p>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Status", "GitHub"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#111827",
                  textDecoration: "none",
                  opacity: 0.45,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.45")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
