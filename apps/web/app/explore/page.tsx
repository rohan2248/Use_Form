"use client";
import Link from "next/link";
import { useListPublicForms } from "~/hooks/api/form";
import { ThemeToggle } from "~/components/ui/theme-toggle";

function ExploreCard({
  id,
  title,
  description,
  responseCount,
  createdAt,
}: {
  id: string;
  title: string;
  description: string | null;
  responseCount: number;
  createdAt: Date | null;
}) {
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Link
      href={`/form/${id}`}
      style={{
        display: "block",
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(17,24,39,0.12)",
        padding: "24px",
        textDecoration: "none",
        color: "#111827",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = "#111827";
        el.style.boxShadow = "4px 4px 0 #111827";
        el.style.transform = "translate(-2px, -2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = "rgba(17,24,39,0.12)";
        el.style.boxShadow = "none";
        el.style.transform = "none";
      }}
    >
      <div
        style={{
          display: "inline-block",
          border: "1.5px solid rgba(17,24,39,0.25)",
          padding: "1px 8px",
          fontFamily: "'PT Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(17,24,39,0.45)",
          marginBottom: 14,
        }}
      >
        Public form
      </div>
      <h3
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "-0.01em",
          marginBottom: 10,
          lineHeight: 1.35,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "rgba(17,24,39,0.55)",
            fontWeight: 300,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          {description}
        </p>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: description ? 0 : 18,
          borderTop: "1px solid rgba(17,24,39,0.07)",
          paddingTop: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'PT Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "rgba(17,24,39,0.4)",
            textTransform: "uppercase",
          }}
        >
          {responseCount} {responseCount === 1 ? "response" : "responses"}
        </span>
        {date && (
          <span
            style={{
              fontFamily: "'PT Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "rgba(17,24,39,0.3)",
            }}
          >
            {date}
          </span>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(17,24,39,0.08)",
        padding: "24px",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .skel { background: rgba(17,24,39,0.07); border-radius: 2px; animation: pulse 1.8s ease-in-out infinite; }
      `}</style>
      <div className="skel" style={{ width: 64, height: 14, marginBottom: 16 }} />
      <div className="skel" style={{ width: "80%", height: 16, marginBottom: 8 }} />
      <div className="skel" style={{ width: "60%", height: 16, marginBottom: 18 }} />
      <div className="skel" style={{ width: "100%", height: 12, marginBottom: 6 }} />
      <div className="skel" style={{ width: "75%", height: 12, marginBottom: 20 }} />
      <div style={{ borderTop: "1px solid rgba(17,24,39,0.07)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
        <div className="skel" style={{ width: 72, height: 11 }} />
        <div className="skel" style={{ width: 56, height: 11 }} />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const { forms, isLoading } = useListPublicForms();

  return (
    <div
      style={{ fontFamily: "'Roboto', sans-serif", backgroundColor: "#FAFAF8", color: "#111827", minHeight: "100vh" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&family=Roboto:wght@300;400;500&family=PT+Mono&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #111827; color: #FAFAF8; }
        .paper-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px; opacity: 0.5;
        }
      `}</style>

      <div className="paper-grain" />

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(250,250,248,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(17,24,39,0.1)",
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
            height: 60,
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#111827" }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em" }}>
              Go
            </span>
            <span
              style={{
                display: "inline-block",
                border: "1.5px solid #111827",
                padding: "1px 6px",
                fontFamily: "'PT Mono', monospace",
                fontSize: 8,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
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
                background: "#111827",
                color: "#FAFAF8",
                border: "1px solid #111827",
                padding: "8px 18px",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <section
          style={{
            padding: "72px 5vw 56px",
            borderBottom: "1px solid rgba(17,24,39,0.1)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span
              style={{
                display: "inline-block",
                border: "2px solid #111827",
                padding: "2px 10px",
                fontFamily: "'PT Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Explore
            </span>
            <h1
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(36px, 6vw, 72px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                marginBottom: 16,
              }}
            >
              Public forms.
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: "rgba(17,24,39,0.55)",
                fontWeight: 300,
                maxWidth: 440,
              }}
            >
              Browse and respond to forms shared publicly by the community. Discover templates, surveys, and more.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section style={{ padding: "56px 5vw", minHeight: 400 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {isLoading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 1,
                  backgroundColor: "rgba(17,24,39,0.08)",
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : !forms || forms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <span
                  style={{
                    display: "inline-block",
                    border: "2px solid rgba(17,24,39,0.2)",
                    padding: "2px 10px",
                    fontFamily: "'PT Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(17,24,39,0.35)",
                    marginBottom: 20,
                  }}
                >
                  Nothing here yet
                </span>
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: 28,
                    letterSpacing: "-0.02em",
                    marginBottom: 12,
                  }}
                >
                  No public forms yet.
                </h2>
                <p style={{ fontSize: 15, color: "rgba(17,24,39,0.5)", fontWeight: 300, marginBottom: 32 }}>
                  Be the first to share one.
                </p>
                <Link
                  href="/sign-up"
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
                  }}
                >
                  Create a form
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 1,
                  backgroundColor: "rgba(17,24,39,0.08)",
                }}
              >
                {forms.map((form) => (
                  <ExploreCard key={form.id} {...form} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(17,24,39,0.12)", padding: "40px 5vw" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: "-0.02em" }}>
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
              }}
            >
              Form
            </span>
          </div>
          <Link
            href="/sign-up"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#111827",
              textDecoration: "none",
              opacity: 0.55,
            }}
          >
            Create your own →
          </Link>
        </div>
      </footer>
    </div>
  );
}
