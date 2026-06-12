"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { Logo } from "~/components/ui/logo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
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

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useInView(ref: React.RefObject<Element>, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e && e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(ref.current);
    // safety net: never leave content hidden if the observer doesn't fire
    // (hidden tabs, headless renderers, print)
    const fallback = setTimeout(() => setInView(true), 2500);
    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
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
  const reduced = usePrefersReducedMotion();
  const visible = inView || reduced;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: reduced
          ? "none"
          : `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [hoveredPricing, setHoveredPricing] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setActiveNav(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const annualPrice = (p: string) => (p === "0" ? "0" : Math.round(parseInt(p) * 0.8).toString());

  return (
    <div className="gfl min-h-screen">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- app router; React 19 hoists this to <head> */}
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&family=Roboto:wght@300;400&family=PT+Mono&display=swap"
      />
      <style>{`
        .gfl {
          --ink: #111827;
          --paper: #FAFAF8;
          --raised: #FFFFFF;
          --alt: #F5F4F0;
          --deep-bg: #111827;
          --deep-ink: #FAFAF8;
          --green: #15803D;
          font-family: 'Roboto', sans-serif;
          background-color: var(--paper);
          color: var(--ink);
        }
        .dark .gfl {
          --ink: #F2F3EE;
          --paper: #111827;
          --raised: #19202E;
          --alt: #0D121C;
          --deep-bg: #0B0F17;
          --deep-ink: #F2F3EE;
          --green: #4ADE80;
        }
        .gfl * { box-sizing: border-box; }
        .gfl ::selection { background: var(--ink); color: var(--paper); }
        @media (prefers-reduced-motion: no-preference) {
          html:has(.gfl) { scroll-behavior: smooth; }
        }
        .gfl :is(a, button):focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }
        .gfl section[id] { scroll-margin-top: 84px; }

        .gfl .paper-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.5;
        }
        .gfl .ruled-bg {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 31px,
            color-mix(in srgb, var(--ink) 6%, transparent) 31px,
            color-mix(in srgb, var(--ink) 6%, transparent) 32px
          );
        }
        .gfl .ink-btn {
          background: var(--ink); color: var(--paper);
          border: 1px solid var(--ink);
          padding: 12px 28px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500; font-size: 13px; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          display: inline-block;
          text-decoration: none;
          text-align: center;
        }
        .gfl .ink-btn:hover {
          background: color-mix(in srgb, var(--ink) 86%, var(--paper));
          transform: translateY(-1px);
        }
        .gfl .ghost-btn {
          background: transparent; color: var(--ink);
          border: 1px solid var(--ink);
          padding: 11px 28px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500; font-size: 13px; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          display: inline-block;
          text-decoration: none;
          text-align: center;
        }
        .gfl .ghost-btn:hover { background: var(--ink); color: var(--paper); transform: translateY(-1px); }
        .gfl .stamp {
          display: inline-block;
          border: 2px solid var(--ink);
          padding: 2px 10px;
          font-family: 'PT Mono', monospace;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
        }
        .gfl .section-num {
          font-family: 'PT Mono', monospace;
          font-size: 11px; letter-spacing: 0.1em;
          color: color-mix(in srgb, var(--ink) 65%, transparent);
        }
        .gfl .large-display {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900; line-height: 1.05;
          letter-spacing: -0.03em;
          text-wrap: balance;
          overflow-wrap: break-word;
        }
        .gfl .body-muted { color: color-mix(in srgb, var(--ink) 72%, transparent); }
        .gfl .label-muted { color: color-mix(in srgb, var(--ink) 65%, transparent); }
        .gfl .mono-label {
          font-family: 'PT Mono', monospace;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
        }

        .gfl .nav-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          padding: 0 5vw;
          background-color: transparent;
          border-bottom: 1px solid transparent;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .gfl .nav-bar.scrolled, .gfl .nav-bar.open {
          background-color: color-mix(in srgb, var(--paper) 94%, transparent);
          border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
          backdrop-filter: blur(8px);
        }
        .gfl .nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .gfl .nav-logo {
          display: flex; align-items: center; gap: 8px;
          color: var(--ink); text-decoration: none;
        }
        .gfl .nav-links { display: flex; gap: 32px; align-items: center; }
        .gfl .nav-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--ink) 70%, transparent);
          text-decoration: none;
          padding: 8px 0;
          transition: color 0.2s;
        }
        .gfl .nav-link:hover { color: var(--ink); }
        .gfl .menu-btn {
          display: none;
          width: 44px; height: 44px;
          background: transparent; border: none; cursor: pointer;
          flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          padding: 0;
        }
        .gfl .menu-btn span {
          display: block; width: 22px; height: 2px;
          background: var(--ink);
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .gfl .menu-btn[aria-expanded="true"] span:first-child { transform: translateY(4px) rotate(45deg); }
        .gfl .menu-btn[aria-expanded="true"] span:last-child { transform: translateY(-4px) rotate(-45deg); }
        .gfl .mobile-panel {
          display: none;
          flex-direction: column;
          padding: 8px 5vw 24px;
          border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
          background-color: color-mix(in srgb, var(--paper) 97%, transparent);
          backdrop-filter: blur(8px);
        }
        .gfl .mobile-panel .nav-link {
          padding: 14px 0;
          font-size: 13px;
          border-bottom: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
        }
        .gfl .mobile-panel .ink-btn { margin-top: 16px; }
        @media (max-width: 880px) {
          .gfl .nav-links .nav-link { display: none; }
          .gfl .nav-links .ink-btn { display: none; }
          .gfl .menu-btn { display: flex; }
          .gfl .mobile-panel.open { display: flex; }
        }

        .gfl .hero-card {
          position: absolute;
          right: 5vw; top: 50%;
          transform: translateY(-50%);
          width: 320px; height: 400px;
          border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
          background-color: var(--raised);
          padding: 24px;
          box-shadow: 8px 8px 0 color-mix(in srgb, var(--ink) 8%, transparent);
          display: none;
        }
        @media (min-width: 1280px) { .gfl .hero-card { display: block; } }

        .gfl .feature-card {
          border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
          background: var(--raised);
          padding: 28px 24px;
          height: 100%;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .gfl .feature-card:hover {
          border-color: var(--ink);
          box-shadow: 4px 4px 0 var(--ink);
          transform: translate(-2px, -2px);
        }
        .gfl .pricing-card {
          border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
          background: var(--raised);
          padding: 36px 32px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          position: relative;
        }
        .gfl .pricing-card.active {
          border: 2px solid var(--ink);
          box-shadow: 6px 6px 0 var(--ink);
          transform: translate(-3px, -3px);
        }
        .gfl .t-card {
          border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
          background-color: var(--raised);
          padding: 28px 24px;
          height: 100%;
        }
        .gfl .t-mark {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900; font-size: 44px; line-height: 0.6;
          display: block; margin-bottom: 18px;
          color: color-mix(in srgb, var(--ink) 30%, transparent);
        }
        .gfl .toggle-track {
          width: 44px; height: 24px;
          background: var(--ink); border-radius: 12px;
          border: none;
          position: relative; cursor: pointer;
          flex-shrink: 0;
          padding: 0;
        }
        .gfl .toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px;
          background: var(--paper); border-radius: 50%;
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gfl .toggle-track[aria-checked="true"] .toggle-thumb { transform: translateX(20px); }
        .gfl .marquee-wrap { overflow: hidden; white-space: nowrap; }
        .gfl .marquee-inner {
          display: inline-block;
          animation: gfl-marquee 22s linear infinite;
        }
        @keyframes gfl-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gfl-fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gfl .fade-up {
          opacity: 0;
          animation: gfl-fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .gfl .step-num {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900; font-size: 64px;
          line-height: 1;
          position: absolute; top: -8px; right: 16px;
          pointer-events: none; user-select: none;
        }
        .gfl .footer-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--ink) 65%, transparent);
          text-decoration: none;
          padding: 8px 0;
          transition: color 0.2s;
        }
        .gfl .footer-link:hover { color: var(--ink); }
        @media (prefers-reduced-motion: reduce) {
          .gfl .marquee-inner { animation: none; }
          .gfl .fade-up { animation: none; opacity: 1; }
          .gfl .ink-btn, .gfl .ghost-btn, .gfl .feature-card, .gfl .pricing-card, .gfl .toggle-thumb {
            transition: none;
          }
          .gfl .feature-card:hover, .gfl .pricing-card.active { transform: none; }
        }
      `}</style>

      <div className="paper-grain" aria-hidden="true" />

      {/* NAV */}
      <nav className={`nav-bar${activeNav ? " scrolled" : ""}${menuOpen ? " open" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <Logo size={18} />
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
            <Link href="/sign-up" className="ink-btn" style={{ padding: "10px 20px", fontSize: 11 }}>
              Get started
            </Link>
            <button
              type="button"
              className="menu-btn"
              aria-expanded={menuOpen}
              aria-controls="gfl-mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
        <div id="gfl-mobile-menu" className={`mobile-panel${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/sign-up" className="ink-btn" onClick={() => setMenuOpen(false)}>
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="ruled-bg"
        style={{
          paddingTop: "clamp(120px, 18vw, 160px)",
          paddingBottom: 120,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="stamp">Beta — Now open</span>
          </div>
          <div style={{ marginTop: 32, maxWidth: 840 }}>
            <h1
              className="large-display fade-up"
              style={{ fontSize: "clamp(48px, 9vw, 96px)", animationDelay: "0.2s" }}
            >
              Forms,
              <br />
              <span style={{ color: "transparent", WebkitTextStroke: "2px var(--ink)" }}>
                set in
              </span>{" "}
              type.
            </h1>
          </div>
          <p
            className="body-muted fade-up"
            style={{
              maxWidth: 480,
              fontSize: 18,
              lineHeight: 1.7,
              marginTop: 32,
              fontWeight: 300,
              animationDelay: "0.35s",
            }}
          >
            A form builder for people who care about craft. Minimal interface, maximum control.
            Inspired by the discipline of the printed page.
          </p>
          <div
            className="fade-up"
            style={{
              display: "flex",
              gap: 16,
              marginTop: 48,
              flexWrap: "wrap",
              animationDelay: "0.45s",
            }}
          >
            <Link href="/sign-up" className="ink-btn">
              Start building free
            </Link>
            <a href="#how-it-works" className="ghost-btn">
              See it in action
            </a>
          </div>
          <div
            className="fade-up"
            style={{
              marginTop: 80,
              display: "flex",
              gap: "28px 48px",
              flexWrap: "wrap",
              animationDelay: "0.55s",
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
                <div className="mono-label label-muted" style={{ marginTop: 4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* decorative form preview */}
        <div className="hero-card fade-up" style={{ animationDelay: "0.5s" }} aria-hidden="true">
          <div
            className="mono-label label-muted"
            style={{ fontSize: 10, marginBottom: 20, letterSpacing: "0.1em" }}
          >
            Form preview — Draft
          </div>
          {[
            { label: "Full name", value: "Rohan Sharma" },
            { label: "Email", value: "rohan@example.com" },
            { label: "Company size", value: "11–50 people" },
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
                }}
              >
                {f.label}
              </div>
              <div
                className="body-muted"
                style={{
                  borderBottom: "1px solid var(--ink)",
                  paddingBottom: 8,
                  fontSize: 14,
                }}
              >
                {f.value}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 32 }}>
            <span className="ink-btn" style={{ fontSize: 11, padding: "10px 20px" }}>
              Submit →
            </span>
          </div>
          <div
            className="mono-label"
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              fontSize: 9,
              color: "color-mix(in srgb, var(--ink) 40%, transparent)",
            }}
          >
            GO FORM v2
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ padding: "14px 0", backgroundColor: "var(--ink)" }} aria-hidden="true">
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
                    color: "var(--paper)",
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
              Every tool you need, nothing you don&apos;t.
            </h2>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 1,
              marginTop: 56,
              backgroundColor: "color-mix(in srgb, var(--ink) 10%, transparent)",
            }}
          >
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="feature-card">
                  <div style={{ fontSize: 22, marginBottom: 16 }} aria-hidden="true">
                    {f.icon}
                  </div>
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
                  <p className="body-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
                    {f.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "80px 5vw", backgroundColor: "var(--deep-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <span
              className="mono-label"
              style={{ color: "color-mix(in srgb, var(--deep-ink) 65%, transparent)" }}
            >
              § 02 — How it works
            </span>
            <h2
              className="large-display"
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                marginTop: 12,
                color: "var(--deep-ink)",
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
                    border: "1px solid color-mix(in srgb, var(--deep-ink) 12%, transparent)",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                  }}
                >
                  <div
                    className="step-num"
                    style={{ color: "color-mix(in srgb, var(--deep-ink) 9%, transparent)" }}
                    aria-hidden="true"
                  >
                    {s.step}
                  </div>
                  <div
                    className="mono-label"
                    style={{
                      color: "color-mix(in srgb, var(--deep-ink) 65%, transparent)",
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
                      color: "var(--deep-ink)",
                      marginBottom: 12,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "color-mix(in srgb, var(--deep-ink) 72%, transparent)",
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
                  id="gfl-billing-monthly"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: billingAnnual ? 0.55 : 1,
                  }}
                >
                  Monthly
                </span>
                <button
                  type="button"
                  className="toggle-track"
                  onClick={() => setBillingAnnual((b) => !b)}
                  role="switch"
                  aria-checked={billingAnnual}
                  aria-label="Bill annually (save 20%)"
                >
                  <span className="toggle-thumb" />
                </button>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: billingAnnual ? 1 : 0.55,
                  }}
                >
                  Annual{" "}
                  <span
                    style={{ fontFamily: "'PT Mono', monospace", fontSize: 10, color: "var(--green)" }}
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
                          background: "var(--ink)",
                          color: "var(--paper)",
                          border: "none",
                          padding: "3px 10px",
                        }}
                      >
                        Most popular
                      </span>
                    </div>
                  )}
                  <div className="mono-label label-muted" style={{ marginBottom: 12 }}>
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
                      <span className="mono-label label-muted">
                        /{billingAnnual ? "mo, billed yearly" : plan.period}
                      </span>
                    )}
                  </div>
                  <p
                    className="body-muted"
                    style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}
                  >
                    {plan.tagline}
                  </p>
                  <div
                    style={{
                      borderTop: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)",
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
                            color: "var(--green)",
                          }}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span className="body-muted" style={{ fontSize: 13 }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  {plan.cta === "Talk to us" ? (
                    <a
                      href="mailto:rohanm2248@gmail.com?subject=Go%20Form%20Edition%20plan"
                      className="ghost-btn"
                      style={{ width: "100%", padding: "12px 0", display: "block" }}
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      href="/sign-up"
                      className={plan.highlight ? "ink-btn" : "ghost-btn"}
                      style={{ width: "100%", padding: "12px 0", display: "block" }}
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
              className="mono-label label-muted"
              style={{ textAlign: "center", marginTop: 32 }}
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
          backgroundColor: "var(--alt)",
          borderTop: "1px solid color-mix(in srgb, var(--ink) 8%, transparent)",
          borderBottom: "1px solid color-mix(in srgb, var(--ink) 8%, transparent)",
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
                <figure className="t-card" style={{ margin: 0 }}>
                  <span className="t-mark" aria-hidden="true">
                    “
                  </span>
                  <blockquote
                    style={{
                      margin: 0,
                      fontSize: 15,
                      lineHeight: 1.7,
                      marginBottom: 20,
                      fontStyle: "italic",
                    }}
                  >
                    {t.quote}
                  </blockquote>
                  <figcaption>
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t.name}
                    </div>
                    <div className="mono-label label-muted" style={{ fontSize: 10, marginTop: 4 }}>
                      {t.role}
                    </div>
                  </figcaption>
                </figure>
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
          <p className="body-muted" style={{ fontSize: 16, marginTop: 24 }}>
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
            <Link href="/explore" className="ghost-btn" style={{ fontSize: 14, padding: "13px 36px" }}>
              Explore public forms
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid color-mix(in srgb, var(--ink) 12%, transparent)",
          padding: "48px 5vw",
        }}
      >
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
            <div style={{ marginBottom: 8 }}>
              <Logo size={16} />
            </div>
            <p className="mono-label label-muted" style={{ fontSize: 10 }}>
              © 2026 Use Form. All rights reserved.
            </p>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Status", "GitHub"].map((l) => (
              <a key={l} href="#" className="footer-link">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
