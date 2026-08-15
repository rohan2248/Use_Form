"use client";
import Link from "next/link";
import { useListPublicForms } from "~/hooks/api/form";
import { useUser } from "~/hooks/api/auth";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { Logo } from "~/components/ui/logo";

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
  createdAt: Date | string | null;
}) {
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Link
      href={`/form/${id}`}
      className="block bg-surface border border-ink/12 p-6 no-underline text-ink transition-all duration-200 hover:border-ink hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-[2px] hover:-translate-y-[2px]"
    >
      <div className="inline-block border-[1.5px] border-ink/25 px-2 py-px font-mono text-[9px] tracking-[0.12em] uppercase text-ink/60 mb-3.5">
        Public form
      </div>
      <h3 className="font-display font-bold text-[15px] tracking-tight leading-[1.35] mb-2.5 text-balance">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] leading-[1.7] text-ink/70 line-clamp-3 mb-[18px]">
          {description}
        </p>
      )}
      <div
        className="flex justify-between items-center border-t border-ink/8 pt-3"
        style={{ marginTop: description ? 0 : 18 }}
      >
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink/60">
          {responseCount} {responseCount === 1 ? "response" : "responses"}
        </span>
        {date && (
          <span className="font-mono text-[10px] tracking-[0.06em] text-ink/60">{date}</span>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-ink/8 p-6" aria-hidden="true">
      <div className="skel" style={{ width: 64, height: 14, marginBottom: 16 }} />
      <div className="skel" style={{ width: "80%", height: 16, marginBottom: 8 }} />
      <div className="skel" style={{ width: "60%", height: 16, marginBottom: 18 }} />
      <div className="skel" style={{ width: "100%", height: 12, marginBottom: 6 }} />
      <div className="skel" style={{ width: "75%", height: 12, marginBottom: 20 }} />
      <div className="border-t border-ink/8 pt-3 flex justify-between">
        <div className="skel" style={{ width: 72, height: 11 }} />
        <div className="skel" style={{ width: 56, height: 11 }} />
      </div>
    </div>
  );
}

const CARD_GRID =
  "grid gap-px bg-ink/10 grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))]";

export default function ExplorePage() {
  const { forms, isLoading, error } = useListPublicForms();
  const { user } = useUser();

  const ctaHref = user ? "/dashboard" : "/sign-up";

  return (
    <div
      className="explore bg-paper text-ink min-h-screen"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&family=Roboto:wght@300;400;500&family=PT+Mono&display=swap');
        .explore .font-display { font-family: 'Montserrat', sans-serif; }
        .explore .font-mono    { font-family: 'PT Mono', monospace; }
        .explore ::selection   { background: var(--ink); color: var(--paper); }
        .explore :is(a, button, input):focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 2px;
        }
        .explore .skel {
          background: color-mix(in oklab, var(--ink) 7%, transparent);
          border-radius: 2px;
          animation: explore-pulse 1.8s ease-in-out infinite;
        }
        @keyframes explore-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .explore .paper-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px; opacity: 0.5;
        }
        @media (prefers-reduced-motion: reduce) {
          .explore *, .explore *::before, .explore *::after {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="paper-grain" />

      <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-[8px] border-b border-ink/10 px-[5vw]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center no-underline text-ink">
            <Logo size={16} />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={ctaHref}
              className="bg-ink text-paper border border-ink px-[18px] py-2 font-display font-medium text-[11px] tracking-[0.08em] uppercase no-underline hover:bg-ink/85 transition-colors duration-200"
            >
              {user ? "Dashboard" : "Get started"}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-[1]">
        <section className="pt-[72px] pb-14 px-[5vw] border-b border-ink/10">
          <div className="max-w-[1200px] mx-auto">
            <span className="inline-block border-2 border-ink px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase mb-5">
              Explore
            </span>
            <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] tracking-[-0.03em] leading-none mb-4 text-balance">
              Public forms.
            </h1>
            <p className="text-base leading-[1.7] text-ink/70 font-light max-w-[440px]">
              Browse and respond to forms shared publicly by the community. Discover templates,
              surveys, and more.
            </p>
          </div>
        </section>

        <section className="py-14 px-[5vw] min-h-[400px]">
          <div className="max-w-[1200px] mx-auto">
            {isLoading ? (
              <div className={CARD_GRID}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <span className="inline-block border-2 border-ink/25 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 mb-5">
                  Something went wrong
                </span>
                <h2 className="font-display font-bold text-[28px] tracking-tight mb-3">
                  Couldn&rsquo;t load public forms.
                </h2>
                <p className="text-[15px] text-ink/70 mb-8">
                  Check your connection and give it another try.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-ink text-paper border border-ink px-7 py-3 font-display font-medium text-xs tracking-[0.08em] uppercase hover:bg-ink/85 transition-colors duration-200"
                >
                  Try again
                </button>
              </div>
            ) : !forms || forms.length === 0 ? (
              <div className="text-center py-20">
                <span className="inline-block border-2 border-ink/25 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 mb-5">
                  Nothing here yet
                </span>
                <h2 className="font-display font-bold text-[28px] tracking-tight mb-3">
                  No public forms yet.
                </h2>
                <p className="text-[15px] text-ink/70 font-light mb-8">Be the first to share one.</p>
                <Link
                  href={ctaHref}
                  className="inline-block bg-ink text-paper border border-ink px-7 py-3 font-display font-medium text-xs tracking-[0.08em] uppercase no-underline hover:bg-ink/85 transition-colors duration-200"
                >
                  Create a form
                </Link>
              </div>
            ) : (
              <div className={CARD_GRID}>
                {forms.map((form) => (
                  <ExploreCard key={form.id} {...form} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/12 py-10 px-[5vw]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center">
            <Logo size={14} />
          </div>
          <Link
            href={ctaHref}
            className="font-display text-[11px] font-medium tracking-[0.08em] uppercase text-ink/70 hover:text-ink no-underline transition-colors duration-200"
          >
            {user ? "Back to your dashboard →" : "Create your own →"}
          </Link>
        </div>
      </footer>
    </div>
  );
}
