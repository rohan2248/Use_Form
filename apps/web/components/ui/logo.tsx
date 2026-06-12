/**
 * Use Form brand lockup.
 *
 * The mark is a "filled form" pictogram drawn in the brand's stamp language:
 * a square 2px frame, two text rules, and a checkmark, square-capped like
 * letterpress furniture. Everything inherits currentColor so the lockup works
 * on paper, dark, and shell (sidebar) surfaces alike. Styles are inline so the
 * component renders identically inside the scoped-CSS pages (.gfl/.gauth),
 * the Tailwind surfaces, and anything else.
 */

export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" />
      <path d="M7.5 8.5h9" />
      <path d="M7.5 12.5h5" />
      <path d="M7.5 16.5l2.25 2.25 4.75-4.75" strokeLinejoin="miter" />
    </svg>
  );
}

export function Logo({ size = 16, stamp = true }: { size?: number; stamp?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.45) }}>
      <LogoMark size={Math.round(size * 1.3)} />
      <span
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 900,
          fontSize: size,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Use
      </span>
      {stamp && (
        <span
          style={{
            border: "1.5px solid currentColor",
            padding: "1px 6px",
            fontFamily: "'PT Mono', monospace",
            fontSize: Math.max(8, Math.round(size * 0.5)),
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            lineHeight: 1.5,
          }}
        >
          Form
        </span>
      )}
    </span>
  );
}
