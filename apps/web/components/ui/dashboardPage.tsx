"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { Logo, LogoMark } from "~/components/ui/logo";
import { useCreateForm, useDeleteForm, useListForms, useGetFields, useCreateField, useDeleteField, useUpdateField, useReorderField, useUpdateFormStatus, useUpdateFormVisibility, useUpdateFormSettings, useGetFormSubmissions, useGetAnalyticsSummary, useGetAllSubmissions } from "~/hooks/api/form";
import { useUser } from "~/hooks/api/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormStatus = "published" | "unpublished" | "draft";
type Visibility = "public" | "unlisted";
type TabKey = "overview" | "fields" | "responses" | "settings";
type ViewKey = "forms" | "analytics" | "responses" | "detail";
type FilterAll = "all";

interface Form {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  visibility: Visibility;
  responseCount: number;
  maxResponses: number | null;
  emailNotifications: boolean;
  dailyDigest: boolean;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}



// ─── Helpers ──────────────────────────────────────────────────────────────────

async function copyFormLink(formId: string, notify: (msg: string) => void) {
  const url = `${window.location.origin}/form/${formId}`;
  try {
    await navigator.clipboard.writeText(url);
    notify("Link copied!");
  } catch {
    notify("Failed to copy — try manually: " + url);
  }
}

function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function BarChart({ data, height = 72 }: { data: number[]; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 ${i === data.length - 1 ? "bg-ink" : "bg-ink/25"}`}
          style={{
            height: `${Math.round((v / max) * height)}px`,
            minWidth: 3,
          }}
        />
      ))}
    </div>
  );
}

function BarRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-[11px] text-ink/70 w-[90px] flex-shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-[6px] bg-ink/8">
        <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-display font-bold text-[11px] w-8 text-right">{pct}%</span>
    </div>
  );
}

function CountRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-[11px] text-ink/70 w-[100px] flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-[6px] bg-ink/8">
        <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-display font-bold text-[11px] w-8 text-right">{count}</span>
    </div>
  );
}


// ─── Badge / Status ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<FormStatus, string> = {
  published: "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
  unpublished: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  draft: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
};
const STATUS_DOT: Record<FormStatus, string> = {
  published: "bg-green-700 dark:bg-green-400",
  unpublished: "bg-amber-700 dark:bg-amber-400",
  draft: "bg-stone-500 dark:bg-stone-400",
};

function StatusBadge({ status }: { status: FormStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase ${STATUS_STYLES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toast = useCallback((m: string) => {
    setMsg(m);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return { msg, visible, toast };
}

function useEscape(onEscape: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape]);
}

// ─── Visibility selector ──────────────────────────────────────────────────────

function VisSelector({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (v: Visibility) => void;
}) {
  return (
    <div className="flex gap-2 mt-2">
      {(["public", "unlisted"] as Visibility[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 border text-[11px] transition-all ${
            value === v
              ? "border-ink bg-ink text-paper"
              : "border-ink/15 text-ink/60 hover:border-ink/40"
          }`}
        >
          <span>{v === "public" ? "🌐" : "🔗"}</span>
          {v === "public" ? "Public" : "Unlisted"}
        </button>
      ))}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-9 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${checked ? "bg-ink" : "bg-ink/20"}`}
    >
      <span
        className="absolute top-0.5 w-[17px] h-[17px] bg-paper rounded-full ring-1 ring-black/10 dark:ring-white/15 transition-all"
        style={{ left: checked ? "calc(100% - 19px)" : 2 }}
      />
    </button>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "green" | "red";
}) {
  return (
    <div className="bg-surface border border-ink/10 p-4">
      <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60 mb-2">{label}</div>
      <div className="font-display font-black text-3xl tracking-tight leading-none">{value}</div>
      {sub && (
        <div
          className={`text-[11px] mt-1 ${color === "green" ? "text-green-700 dark:text-green-400" : color === "red" ? "text-red-700 dark:text-red-400" : "text-ink/60"}`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-ink/10 p-5 ${className}`}>
      <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60 mb-4">{title}</div>
      {children}
    </div>
  );
}

// ─── Form card ────────────────────────────────────────────────────────────────

function FormCard({
  form,
  onAction,
  onViewDetail,
  onEditFields,
  onDelete,
  onPublishToggle,
  onVisibilityChange,
}: {
  form: Form;
  onAction: (msg: string) => void;
  onViewDetail: (id: string) => void;
  onEditFields: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onPublishToggle: (id: string, newStatus: "published" | "unpublished") => void;
  onVisibilityChange: (id: string, visibility: Visibility) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [vis, setVis] = useState<Visibility>(form.visibility);
  const ref = useRef<HTMLDivElement>(null);

  // Keep optimistic local state in sync when the server value changes (e.g. refetch after a failed mutation)
  useEffect(() => {
    setVis(form.visibility);
  }, [form.visibility]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  const isPublished = form.status === "published";
  const isDraft = form.status === "draft";

  return (
    <div className="bg-surface border border-ink/10 hover:border-ink/35 transition-all hover:shadow-[3px_3px_0_rgba(17,24,39,0.08)] dark:shadow-[3px_3px_0_rgba(0,0,0,0.45)]">
      <div className="p-4 border-b border-ink/8">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <StatusBadge status={form.status} />
            <div className="font-display font-bold text-sm tracking-tight mt-2 mb-1 leading-tight">
              {form.title}
            </div>
            <div className="text-[11px] text-ink/60">
              Updated {formatRelativeTime(form.updatedAt)}
            </div>
          </div>
          <div className="relative flex-shrink-0" ref={ref}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-ink/55 hover:text-ink px-1 py-0.5 text-lg leading-none"
              aria-label="Form actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 bg-surface border border-ink/15 shadow-[3px_3px_0_rgba(17,24,39,0.08)] dark:shadow-[3px_3px_0_rgba(0,0,0,0.45)] py-1 min-w-[148px] z-20">
                <MenuItem
                  icon="ti-edit"
                  label="Edit form"
                  onClick={() => {
                    onEditFields(form.id);
                    setMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon="ti-eye"
                  label="Preview"
                  onClick={() => {
                    window.open(`/form/${form.id}`, "_blank", "noopener,noreferrer");
                    setMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon="ti-copy"
                  label="Copy link"
                  onClick={() => {
                    void copyFormLink(form.id, onAction);
                    setMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon="ti-chart-bar"
                  label="View analytics"
                  onClick={() => {
                    onViewDetail(form.id);
                    setMenuOpen(false);
                  }}
                />
                <div className="h-px bg-ink/8 my-1" />
                {isPublished ? (
                  <MenuItem
                    icon="ti-player-pause"
                    label="Unpublish"
                    onClick={() => {
                      onPublishToggle(form.id, "unpublished");
                      setMenuOpen(false);
                    }}
                  />
                ) : (
                  <MenuItem
                    icon="ti-player-play"
                    label="Publish"
                    onClick={() => {
                      onPublishToggle(form.id, "published");
                      setMenuOpen(false);
                    }}
                  />
                )}
                <div className="h-px bg-ink/8 my-1" />
                <MenuItem
                  icon="ti-trash"
                  label="Delete"
                  danger
                  onClick={() => {
                    onDelete(form.id, form.title);
                    setMenuOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
        {!isDraft && (
          <VisSelector
            value={vis}
            onChange={(v) => {
              setVis(v);
              onVisibilityChange(form.id, v);
            }}
          />
        )}
      </div>
      <div className="px-4 py-3 flex gap-5 items-end">
        <div className="text-center">
          <div className="font-display font-bold text-base">
            {form.responseCount > 0 ? form.responseCount.toLocaleString() : "—"}
          </div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60 mt-0.5">
            Responses
          </div>
        </div>
      </div>
      <div className="border-t border-ink/8 px-3 py-2 flex gap-1">
        <ActionBtn icon="ti-edit" label="Edit" onClick={() => onEditFields(form.id)} />
        <ActionBtn icon="ti-chart-bar" label="Analytics" onClick={() => onViewDetail(form.id)} />
        <ActionBtn icon="ti-copy" label="Copy" onClick={() => void copyFormLink(form.id, onAction)} />
        {isPublished ? (
          <ActionBtn
            icon="ti-player-pause"
            label="Unpublish"
            danger
            onClick={() => onPublishToggle(form.id, "unpublished")}
          />
        ) : (
          <ActionBtn
            icon="ti-player-play"
            label="Publish"
            onClick={() => onPublishToggle(form.id, "published")}
          />
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-ink/5 transition-colors ${danger ? "text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" : "text-ink"}`}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
      {label}
    </button>
  );
}

function ActionBtn({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1 py-1.5 font-mono text-[9px] tracking-widest uppercase transition-colors rounded-[2px] ${
        danger
          ? "text-ink/60 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          : "text-ink/60 hover:bg-ink/6 hover:text-ink"
      }`}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
      {label}
    </button>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function FormsView({
  search,
  onClearSearch,
  onViewDetail,
  onEditFields,
  onDelete,
  onNewForm,
  onPublishToggle,
  onVisibilityChange,
  toast,
}: {
  search: string;
  onClearSearch: () => void;
  onViewDetail: (id: string) => void;
  onEditFields: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onNewForm: () => void;
  onPublishToggle: (id: string, newStatus: "published" | "unpublished") => void;
  onVisibilityChange: (id: string, visibility: Visibility) => void;
  toast: (m: string) => void;
}) {
  const [filter, setFilter] = useState<FormStatus | FilterAll>("all");
  const { forms, isLoading } = useListForms();

  const all = forms ?? [];
  const query = search.trim().toLowerCase();
  const filtered = all.filter(
    (f) =>
      (filter === "all" || f.status === filter) &&
      (query === "" ||
        f.title.toLowerCase().includes(query) ||
        (f.description ?? "").toLowerCase().includes(query)),
  );

  const publishedCount = all.filter((f) => f.status === "published").length;
  const draftCount = all.filter((f) => f.status === "draft").length;
  const unpublishedCount = all.filter((f) => f.status === "unpublished").length;
  const totalResponses = all.reduce((s, f) => s + f.responseCount, 0);

  if (!isLoading && all.length === 0) {
    return (
      <div className="bg-surface border border-ink/10 flex flex-col items-center justify-center px-6 py-20 text-center">
        <i className="ti ti-clipboard-text text-ink/20 mb-4" style={{ fontSize: 40 }} aria-hidden="true" />
        <h2 className="font-display font-black text-xl tracking-tight mb-2">
          Let&rsquo;s build your first form
        </h2>
        <p className="text-[13px] text-ink/60 mb-6 max-w-xs">
          Create a form, share the link, and watch the responses roll in — it takes about a minute.
        </p>
        <button
          onClick={onNewForm}
          className="flex items-center gap-1.5 bg-ink text-paper px-5 py-2.5 font-display font-semibold text-[11px] tracking-widest uppercase hover:bg-ink/80 transition-all"
        >
          <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
          Create your first form
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total forms"
          value={isLoading ? "—" : String(all.length)}
          sub={
            isLoading
              ? undefined
              : `${publishedCount} published · ${unpublishedCount} unpublished · ${draftCount} draft`
          }
        />
        <StatCard
          label="Total responses"
          value={isLoading ? "—" : totalResponses.toLocaleString()}
          sub="Across all forms"
        />
        <StatCard label="Published" value={isLoading ? "—" : String(publishedCount)} />
        <StatCard label="Drafts" value={isLoading ? "—" : String(draftCount)} />
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-mono text-[10px] tracking-widest uppercase text-ink/60">
          {query ? `Results for “${search.trim()}”` : "All forms"}
        </h2>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "published", "unpublished", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 border transition-all ${
                filter === f
                  ? "bg-ink text-paper border-ink"
                  : "border-ink/15 text-ink/60 hover:bg-ink hover:text-paper hover:border-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-ink/10 h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-ink/20 flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
          <p className="text-[13px] text-ink/60">
            {query
              ? `No forms match “${search.trim()}”${filter !== "all" ? ` in ${filter}` : ""}.`
              : `No ${filter} forms yet.`}
          </p>
          <button
            onClick={() => {
              setFilter("all");
              onClearSearch();
            }}
            className="border border-ink/20 px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase text-ink/70 hover:bg-ink hover:text-paper hover:border-ink transition-all"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <button
            onClick={onNewForm}
            className="border-[1.5px] border-dashed border-ink/20 hover:border-ink hover:bg-ink/4 transition-all flex flex-col items-center justify-center gap-2 h-50 cursor-pointer"
          >
            <i className="ti ti-plus text-ink/40" style={{ fontSize: 28 }} aria-hidden="true" />
            <span className="font-display font-semibold text-[11px] tracking-widest uppercase text-ink/60">
              New form
            </span>
          </button>
          {filtered.map((form) => (
            <FormCard
              key={form.id}
              form={form as Form}
              onAction={toast}
              onViewDetail={onViewDetail}
              onEditFields={onEditFields}
              onDelete={onDelete}
              onPublishToggle={onPublishToggle}
              onVisibilityChange={onVisibilityChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsView() {
  const { forms = [], isLoading: formsLoading } = useListForms();
  const { summary, isLoading: summaryLoading } = useGetAnalyticsSummary();
  const isLoading = formsLoading || summaryLoading;

  const totalResponses = forms.reduce((s, f) => s + f.responseCount, 0);
  const publishedCount = forms.filter((f) => f.status === "published").length;
  const topForm = forms.reduce<Form | null>(
    (best, f) => (!best || f.responseCount > best.responseCount ? (f as Form) : best),
    null
  );

  const dailyData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of summary?.responsesByDay ?? []) counts[row.date] = row.count;
    const result: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(counts[d.toISOString().slice(0, 10)] ?? 0);
    }
    return result;
  }, [summary]);

  const dateLabels = useMemo(() =>
    [29, 19, 9, 0].map((n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }), []);

  const topForms = useMemo(() =>
    [...forms]
      .filter((f) => f.responseCount > 0)
      .sort((a, b) => b.responseCount - a.responseCount)
      .slice(0, 6) as Form[],
    [forms]
  );
  const maxResponses = topForms[0]?.responseCount ?? 1;

  const statusBreakdown = useMemo(() => {
    const total = forms.length || 1;
    return [
      { label: "Published", count: publishedCount, max: total },
      { label: "Unpublished", count: forms.filter((f) => f.status === "unpublished").length, max: total },
      { label: "Draft", count: forms.filter((f) => f.status === "draft").length, max: total },
    ];
  }, [forms, publishedCount]);

  return (
    <div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total responses"
          value={isLoading ? "—" : totalResponses.toLocaleString()}
          sub="Across all forms"
          color={totalResponses > 0 ? "green" : undefined}
        />
        <StatCard
          label="Published forms"
          value={isLoading ? "—" : String(publishedCount)}
          sub={isLoading ? "" : `of ${forms.length} total`}
        />
        <StatCard
          label="Top form"
          value={isLoading ? "—" : (topForm?.responseCount ?? 0).toLocaleString()}
          sub={topForm?.title ?? "No responses yet"}
        />
        <StatCard
          label="Avg per published"
          value={isLoading ? "—" : publishedCount > 0 ? Math.round(totalResponses / publishedCount).toLocaleString() : "0"}
          sub="Responses / published form"
        />
      </div>

      <Panel title="Daily responses — last 30 days" className="mb-4">
        {summaryLoading ? (
          <div className="h-[72px] bg-ink/5 animate-pulse" />
        ) : dailyData.every((v) => v === 0) ? (
          <div className="h-[72px] flex items-center justify-center text-[11px] text-ink/60">
            No responses in the last 30 days
          </div>
        ) : (
          <>
            <BarChart data={dailyData} height={72} />
            <div className="flex justify-between mt-1.5 font-mono text-[9px] text-ink/60">
              {dateLabels.map((l) => <span key={l}>{l}</span>)}
            </div>
          </>
        )}
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Responses by form">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-5 bg-ink/5 animate-pulse" />)}</div>
          ) : topForms.length === 0 ? (
            <div className="text-[11px] text-ink/60 py-3 text-center">No responses yet</div>
          ) : (
            topForms.map((f) => <CountRow key={f.id} label={f.title} count={f.responseCount} max={maxResponses} />)
          )}
        </Panel>
        <Panel title="Form status breakdown">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-5 bg-ink/5 animate-pulse" />)}</div>
          ) : (
            statusBreakdown.map((d) => <CountRow key={d.label} label={d.label} count={d.count} max={d.max} />)
          )}
        </Panel>
      </div>
    </div>
  );
}

function ResponsesView({
  forms,
  toast,
  onOpenForm,
}: {
  forms: Form[];
  toast: (m: string) => void;
  onOpenForm: (id: string) => void;
}) {
  const { submissions, isLoading } = useGetAllSubmissions();
  const [formFilter, setFormFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(20);

  const filtered = useMemo(() => {
    if (!submissions) return [];
    return formFilter === "all" ? submissions : submissions.filter((s) => s.formId === formFilter);
  }, [submissions, formFilter]);

  const visible = filtered.slice(0, visibleCount);

  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0);
  const formsWithResponses = forms.filter((f) => f.responseCount > 0).length;
  const latestAt = filtered[0]?.createdAt ?? null;

  const formatSubmittedAt = (date: Date | string | null) => {
    if (!date) return "—";
    const d = date instanceof Date ? date : new Date(date);
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleExport = () => {
    if (!filtered.length) { toast("No data to export"); return; }
    const rows = [["ID", "Form", "Submitted", "Fields answered"]];
    filtered.forEach((s) =>
      rows.push([
        s.id,
        s.formTitle,
        s.createdAt ? new Date(s.createdAt).toISOString() : "",
        String(s.value?.length ?? 0),
      ])
    );
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "responses.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-mono text-[10px] tracking-widest uppercase text-ink/60">
          All responses
        </h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={formFilter}
            onChange={(e) => { setFormFilter(e.target.value); setVisibleCount(20); }}
            className="font-mono text-[10px] tracking-widest border border-ink/15 px-3 py-1.5 bg-surface text-ink uppercase cursor-pointer"
          >
            <option value="all">All forms</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-ink/20 px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase hover:bg-ink hover:text-paper hover:border-ink transition-all"
          >
            <i className="ti ti-download" style={{ fontSize: 13 }} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Total responses" value={String(totalResponses)} sub="Across all forms" />
        <StatCard
          label="Active forms"
          value={String(formsWithResponses)}
          sub={`of ${forms.length} total`}
          color="green"
        />
        <StatCard
          label="Latest response"
          value={latestAt ? formatRelativeTime(latestAt) : "—"}
          sub={
            latestAt
              ? new Date(latestAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "No submissions yet"
          }
        />
      </div>

      <div className="bg-surface border border-ink/10">
        <div className="px-5 py-3 border-b border-ink/8">
          <span className="font-mono text-[9px] tracking-widest uppercase text-ink/60">
            {isLoading ? "Loading…" : `${filtered.length} submission${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "38%" }} />
              <col style={{ width: "42%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "6%" }} />
            </colgroup>
            <thead>
              <tr>
                {["Form", "Submitted", "Fields", ""].map((h) => (
                  <th
                    key={h}
                    className="font-mono text-[9px] tracking-widest uppercase text-ink/60 text-left px-3 py-2 border-b border-ink/10"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center font-mono text-[10px] text-ink/60 uppercase tracking-widest">
                    Loading…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center font-mono text-[10px] text-ink/60 uppercase tracking-widest">
                    No responses yet
                  </td>
                </tr>
              ) : (
                visible.map((s) => (
                  <tr key={s.id} className="hover:bg-ink/4 border-b border-ink/6 last:border-b-0">
                    <td className="px-3 py-2.5 font-medium text-[11px] text-ink/70 truncate">{s.formTitle}</td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-ink/60">{formatSubmittedAt(s.createdAt)}</td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-ink/60">{s.value?.length ?? 0}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => onOpenForm(s.formId)}
                        className="text-ink/55 hover:text-ink transition-colors"
                        aria-label={`View responses for ${s.formTitle}`}
                        title="View form responses"
                      >
                        <i className="ti ti-eye" style={{ fontSize: 14 }} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-ink/6 flex justify-between items-center">
          <span className="font-mono text-[9px] tracking-widest uppercase text-ink/60">
            Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}
          </span>
          {visibleCount < filtered.length && (
            <button
              onClick={() => setVisibleCount((c) => c + 20)}
              className="border border-ink/20 px-3 py-1 font-display font-semibold text-[10px] tracking-widest uppercase hover:bg-ink hover:text-paper transition-all"
            >
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fields tab ───────────────────────────────────────────────────────────────

const FIELD_TYPES = ["text", "number", "date", "email", "select", "checkbox", "radio", "yesno", "multiselect"] as const;
type FieldType = typeof FIELD_TYPES[number];

const FIELD_TYPE_COLORS: Record<FieldType, string> = {
  text: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  number: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  date: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  email: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  select: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  checkbox: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  radio: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  yesno: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  multiselect: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

function FieldsTab({ formId, toast }: { formId: string; toast: (m: string) => void }) {
  const { fields, isLoading } = useGetFields(formId);
  const { createFieldAsync } = useCreateField();
  const { deleteFieldAsync } = useDeleteField();
  const { updateFieldAsync } = useUpdateField();
  const { reorderFieldAsync } = useReorderField();

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FieldType>("text");
  const [newRequired, setNewRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<FieldType>("text");
  const [editRequired, setEditRequired] = useState(false);

  const sorted = [...(fields ?? [])].sort((a, b) => parseFloat(a.index) - parseFloat(b.index));

  const errMsg = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setSubmitting(true);
    try {
      await createFieldAsync({ formId, label: newLabel.trim(), fieldType: newType, isRequired: newRequired });
      setNewLabel("");
      setNewType("text");
      setNewRequired(false);
      setAdding(false);
      toast("Field added");
    } catch (err) {
      toast(errMsg(err, "Failed to add field"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFieldAsync({ id });
      toast("Field deleted");
    } catch (err) {
      toast(errMsg(err, "Failed to delete field"));
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editLabel.trim()) {
      toast("Label cannot be empty");
      return;
    }
    try {
      await updateFieldAsync({ id, label: editLabel.trim(), fieldType: editType, isRequired: editRequired });
      setEditingId(null);
      toast("Field updated");
    } catch (err) {
      toast(errMsg(err, "Failed to update field"));
    }
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ id: string; position: "before" | "after" } | null>(null);

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedId(fieldId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", fieldId);
  };

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggedId || draggedId === fieldId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "before" | "after" = e.clientY < midY ? "before" : "after";
    setDragOverInfo((prev) =>
      prev?.id === fieldId && prev.position === position ? prev : { id: fieldId, position },
    );
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverInfo(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverInfo(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    const currentDraggedId = draggedId;
    const currentDragOver = dragOverInfo;
    setDraggedId(null);
    setDragOverInfo(null);
    if (!currentDraggedId || currentDraggedId === targetFieldId) return;

    const remaining = sorted.filter((f) => f.id !== currentDraggedId);
    const targetIdxInRemaining = remaining.findIndex((f) => f.id === targetFieldId);
    if (targetIdxInRemaining === -1) return;

    const insertAt = currentDragOver?.position === "after" ? targetIdxInRemaining + 1 : targetIdxInRemaining;
    const prevField = remaining[insertAt - 1];
    const nextField = remaining[insertAt];

    try {
      await reorderFieldAsync({
        id: currentDraggedId,
        prevIndex: prevField?.index,
        nextIndex: nextField?.index,
      });
      toast("Field reordered");
    } catch (err) {
      toast(errMsg(err, "Failed to reorder"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-ink/10 h-14 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.length === 0 && !adding && (
        <div className="bg-surface border border-ink/10 flex flex-col items-center justify-center py-16 text-center">
          <i className="ti ti-layout-list text-ink/20 mb-3" style={{ fontSize: 32 }} aria-hidden="true" />
          <div className="font-display font-semibold text-sm text-ink/70 mb-1">No fields yet</div>
          <div className="text-[11px] text-ink/60 mb-4">Add fields to build your form</div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 bg-ink text-paper px-4 py-2 font-display font-semibold text-[11px] tracking-widest uppercase hover:bg-ink/80 transition-all"
          >
            <i className="ti ti-plus" style={{ fontSize: 13 }} aria-hidden="true" />
            Add field
          </button>
        </div>
      )}

      {sorted.map((field) => (
        <div
          key={field.id}
          draggable={editingId !== field.id}
          onDragStart={(e) => handleDragStart(e, field.id)}
          onDragOver={(e) => handleDragOver(e, field.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, field.id)}
          onDragEnd={handleDragEnd}
          className={`relative bg-surface border border-ink/10 transition-opacity ${
            draggedId === field.id ? "opacity-40" : ""
          } ${
            dragOverInfo?.id === field.id && dragOverInfo.position === "before"
              ? "before:absolute before:-top-px before:left-0 before:right-0 before:h-0.5 before:bg-ink before:content-['']"
              : ""
          } ${
            dragOverInfo?.id === field.id && dragOverInfo.position === "after"
              ? "after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-ink after:content-['']"
              : ""
          }`}
        >
          {editingId === field.id ? (
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="font-mono text-[9px] tracking-widest uppercase text-ink/60 block mb-1">Label</label>
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value.slice(0, 100))}
                    autoFocus
                    className="w-full border border-ink/20 bg-surface px-3 py-1.5 text-sm font-display focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] tracking-widest uppercase text-ink/60 block mb-1">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as FieldType)}
                    className="border border-ink/20 px-3 py-1.5 text-sm font-display bg-surface focus:outline-none focus:border-ink"
                  >
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={editRequired} onChange={setEditRequired} />
                <span className="text-[12px] text-ink/60">Required</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(null)} className="border border-ink/20 px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase text-ink/60 hover:border-ink/40 hover:text-ink transition-all">
                  Cancel
                </button>
                <button onClick={() => handleSaveEdit(field.id)} className="bg-ink text-paper px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase hover:bg-ink/80 transition-all">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3">
              <span
                className="text-ink/50 hover:text-ink cursor-grab active:cursor-grabbing select-none"
                aria-label="Drag to reorder"
                title="Drag to reorder"
              >
                <i className="ti ti-grip-vertical" style={{ fontSize: 16 }} aria-hidden="true" />
              </span>
              <span className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 flex-shrink-0 ${FIELD_TYPE_COLORS[field.fieldType as FieldType] ?? "bg-stone-100 text-stone-600"}`}>
                {field.fieldType}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-display font-semibold text-sm">{field.label}</span>
                {field.isRequired && (
                  <span className="ml-2 font-mono text-[9px] tracking-widest uppercase text-red-700 dark:text-red-400">required</span>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => { setEditingId(field.id); setEditLabel(field.label); setEditType(field.fieldType as FieldType); setEditRequired(field.isRequired); }}
                  className="text-ink/55 hover:text-ink transition-colors p-1"
                  aria-label="Edit field"
                >
                  <i className="ti ti-edit" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
                <button onClick={() => handleDelete(field.id)} className="text-ink/55 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1" aria-label="Delete field">
                  <i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className="bg-surface border border-ink/10 p-4 space-y-3">
          <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60">New field</div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="font-mono text-[9px] tracking-widest uppercase text-ink/60 block mb-1">Label <span className="text-ink/60">*</span></label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value.slice(0, 100))}
                placeholder="e.g. Full name"
                disabled={submitting}
                autoFocus
                className="w-full border border-ink/20 bg-surface px-3 py-1.5 text-sm font-display placeholder:text-ink/60 focus:outline-none focus:border-ink disabled:opacity-50"
              />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-widest uppercase text-ink/60 block mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as FieldType)}
                disabled={submitting}
                className="border border-ink/20 px-3 py-1.5 text-sm font-display bg-surface focus:outline-none focus:border-ink disabled:opacity-50"
              >
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Toggle checked={newRequired} onChange={setNewRequired} />
            <span className="text-[12px] text-ink/60">Required</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setNewLabel(""); setNewType("text"); setNewRequired(false); }} disabled={submitting} className="border border-ink/20 px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase text-ink/60 hover:border-ink/40 hover:text-ink transition-all disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={submitting || !newLabel.trim()} className="bg-ink text-paper px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase hover:bg-ink/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
              {submitting && <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 12 }} aria-hidden="true" />}
              Add
            </button>
          </div>
        </div>
      ) : sorted.length > 0 && (
        <button onClick={() => setAdding(true)} className="w-full border border-dashed border-ink/20 hover:border-ink hover:bg-ink/4 transition-all flex items-center justify-center gap-2 py-3">
          <i className="ti ti-plus text-ink/35" style={{ fontSize: 15 }} aria-hidden="true" />
          <span className="font-display font-semibold text-[11px] tracking-widest uppercase text-ink/60">Add field</span>
        </button>
      )}
    </div>
  );
}

// ─── Submissions tab ──────────────────────────────────────────────────────────

function SubmissionsTab({ formId }: { formId: string }) {
  const { submissions, isLoading } = useGetFormSubmissions(formId);
  const { fields } = useGetFields(formId);

  const sortedFields = [...(fields ?? [])].sort(
    (a, b) => parseFloat(a.index) - parseFloat(b.index),
  );

  const formatDate = (d: Date | string | null) => {
    if (!d) return "—";
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-ink/10 animate-pulse">
        <div className="h-9 border-b border-ink/8 bg-ink/4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 border-b border-ink/6 bg-ink/[0.02]" />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="bg-surface border border-ink/10 flex flex-col items-center justify-center py-16 text-center">
        <i className="ti ti-inbox text-ink/20 mb-3" style={{ fontSize: 32 }} aria-hidden="true" />
        <div className="font-display font-semibold text-sm text-ink/70 mb-1">No responses yet</div>
        <div className="text-[11px] text-ink/60">Submissions will appear here once the form is published and shared</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-ink/10 overflow-x-auto">
      <table className="w-full text-[12px]" style={{ tableLayout: "auto" }}>
        <thead>
          <tr>
            <th className="font-mono text-[9px] tracking-widest uppercase text-ink/60 text-left px-4 py-2.5 border-b border-ink/10 whitespace-nowrap w-8">
              #
            </th>
            {sortedFields.map((f) => (
              <th
                key={f.id}
                className="font-mono text-[9px] tracking-widest uppercase text-ink/60 text-left px-4 py-2.5 border-b border-ink/10 whitespace-nowrap"
              >
                {f.label}
              </th>
            ))}
            <th className="font-mono text-[9px] tracking-widest uppercase text-ink/60 text-left px-4 py-2.5 border-b border-ink/10 whitespace-nowrap">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, i) => {
            const valueMap = Object.fromEntries(
              (sub.value ?? []).map((v) => [v.formFieldId, v.value]),
            );
            return (
              <tr key={sub.id} className="hover:bg-ink/4 border-b border-ink/6 last:border-b-0">
                <td className="px-4 py-2.5 font-mono text-[10px] text-ink/55">{i + 1}</td>
                {sortedFields.map((f) => (
                  <td key={f.id} className="px-4 py-2.5 max-w-[220px]">
                    {valueMap[f.id] ? (
                      <span className="block truncate text-ink/80">{valueMap[f.id]}</span>
                    ) : (
                      <span className="text-ink/50">—</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-2.5 font-mono text-[10px] text-ink/60 whitespace-nowrap">
                  {formatDate(sub.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-ink/6">
        <span className="font-mono text-[9px] tracking-widest uppercase text-ink/60">
          {submissions.length} response{submissions.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

function OverviewTab({ form }: { form: Form }) {
  const { submissions = [] } = useGetFormSubmissions(form.id);
  const { fields = [] } = useGetFields(form.id);

  const dailyData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of submissions) {
      if (!sub.createdAt) continue;
      const key = new Date(sub.createdAt).toISOString().slice(0, 10);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const result: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(counts[d.toISOString().slice(0, 10)] ?? 0);
    }
    return result;
  }, [submissions]);

  const dateLabels = useMemo(() =>
    [29, 19, 9, 0].map((n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }), []);

  const fieldCompletion = useMemo(() => {
    if (submissions.length === 0 || fields.length === 0) return [];
    return fields.map((field) => {
      const filled = submissions.filter((s) =>
        s.value?.some((v) => v.formFieldId === field.id && String(v.value).trim() !== "")
      ).length;
      return { label: field.label, pct: Math.round((filled / submissions.length) * 100) };
    });
  }, [submissions, fields]);

  const thisMonth = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return submissions.filter((s) => s.createdAt && new Date(s.createdAt) >= start).length;
  }, [submissions]);

  const noData = submissions.length === 0;

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total responses" value={String(form.responseCount)} sub="All time" color={form.responseCount > 0 ? "green" : undefined} />
        <StatCard label="This month" value={String(thisMonth)} sub={thisMonth > 0 ? "responses" : "No responses yet"} />
        <StatCard label="Fields" value={String(fields.length)} sub="In this form" />
        <StatCard label="Status" value={form.status.charAt(0).toUpperCase() + form.status.slice(1)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Panel title="Responses over time — last 30 days">
          {noData ? (
            <div className="h-[64px] flex items-center justify-center text-[11px] text-ink/60">No responses yet</div>
          ) : (
            <>
              <BarChart data={dailyData} height={64} />
              <div className="flex justify-between mt-1 font-mono text-[9px] text-ink/60">
                {dateLabels.map((l) => <span key={l}>{l}</span>)}
              </div>
            </>
          )}
        </Panel>
        <Panel title="Field completion rate">
          {fieldCompletion.length === 0 ? (
            <div className="text-[11px] text-ink/60 py-3 text-center">
              {noData ? "No responses yet" : "No fields"}
            </div>
          ) : (
            fieldCompletion.map((f) => <BarRow key={f.label} label={f.label} pct={f.pct} />)
          )}
        </Panel>
      </div>
    </>
  );
}

function DetailView({
  form,
  onBack,
  toast,
  initialTab,
  onPublishToggle,
  onVisibilityChange,
}: {
  form: Form | null;
  onBack: () => void;
  toast: (m: string) => void;
  initialTab?: TabKey;
  onPublishToggle: (id: string, newStatus: "published" | "unpublished") => void;
  onVisibilityChange: (id: string, visibility: Visibility) => void;
}) {
  const [tab, setTab] = useState<TabKey>(initialTab ?? "overview");

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab, form?.id]);
  const [vis, setVis] = useState<Visibility>(form?.visibility ?? "public");
  const [maxResponses, setMaxResponses] = useState<string>(form?.maxResponses != null ? String(form.maxResponses) : "");
  const [emailNotif, setEmailNotif] = useState(form?.emailNotifications ?? false);
  const [dailyDigest, setDailyDigest] = useState(form?.dailyDigest ?? false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Re-seed the editable settings only when a different form is opened; depending on
  // `form` itself would discard unsaved edits whenever the forms list refetches.
  useEffect(() => {
    if (!form) return;
    setVis(form.visibility);
    setMaxResponses(form.maxResponses != null ? String(form.maxResponses) : "");
    setEmailNotif(form.emailNotifications);
    setDailyDigest(form.dailyDigest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.id]);

  const { updateFormSettingsAsync } = useUpdateFormSettings();

  const handleSaveSettings = async () => {
    if (!form) return;
    setSettingsSaving(true);
    try {
      const parsed = maxResponses.trim() !== "" ? parseInt(maxResponses, 10) : null;
      if (maxResponses.trim() !== "" && (isNaN(parsed!) || parsed! <= 0)) {
        toast("Response limit must be a positive number");
        return;
      }
      await updateFormSettingsAsync({
        id: form.id,
        maxResponses: parsed,
        emailNotifications: emailNotif,
        dailyDigest,
      });
      toast("Settings saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  const isPublished = form?.status === "published";

  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] text-ink/60 mb-5">
        <button onClick={onBack} className="hover:text-ink transition-colors cursor-pointer">
          My forms
        </button>
        <i className="ti ti-chevron-right" style={{ fontSize: 12 }} aria-hidden="true" />
        <span className="text-ink font-medium">{form?.title ?? "—"}</span>
      </div>

      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <StatusBadge status={(form?.status ?? "draft") as FormStatus} />
          <h1 className="font-display font-black text-2xl tracking-tight mt-2 mb-1">
            {form?.title ?? "—"}
          </h1>
          <div className="text-[11px] text-ink/60">
            Created {formatRelativeTime(form?.createdAt ?? null)} · Updated {formatRelativeTime(form?.updatedAt ?? null)}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => form && void copyFormLink(form.id, toast)}
            className="flex items-center gap-1.5 border border-ink/20 px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase hover:bg-ink hover:text-paper transition-all"
          >
            <i className="ti ti-copy" style={{ fontSize: 13 }} aria-hidden="true" />
            Copy link
          </button>
          {isPublished ? (
            <button
              onClick={() => form && onPublishToggle(form.id, "unpublished")}
              className="flex items-center gap-1.5 border border-ink/20 px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase text-ink/70 hover:border-ink hover:text-ink transition-all"
            >
              <i className="ti ti-player-pause" style={{ fontSize: 13 }} aria-hidden="true" />
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => form && onPublishToggle(form.id, "published")}
              className="flex items-center gap-1.5 bg-ink text-paper border border-ink px-3 py-1.5 font-display font-semibold text-[10px] tracking-widest uppercase hover:bg-ink/80 transition-all"
            >
              <i className="ti ti-player-play" style={{ fontSize: 13 }} aria-hidden="true" />
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-ink/10 mb-5 overflow-x-auto" role="tablist">
        {(["overview", "fields", "responses", "settings"] as TabKey[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 font-mono text-[10px] tracking-widest uppercase border-b-2 -mb-px transition-all whitespace-nowrap ${
              tab === t ? "text-ink border-ink" : "text-ink/60 border-transparent hover:text-ink"
            }`}
          >
            {t}
            {t === "responses" ? ` (${form?.responseCount ?? 0})` : ""}
          </button>
        ))}
      </div>

      {tab === "fields" && <FieldsTab formId={form?.id ?? ""} toast={toast} />}

      {tab === "overview" && form && <OverviewTab form={form} />}

      {tab === "responses" && <SubmissionsTab formId={form?.id ?? ""} />}

      {tab === "settings" && (
        <div className="bg-surface border border-ink/10 p-5 max-w-lg">
          <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60 mb-5">
            Form settings
          </div>
          <div className="space-y-6">
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60 mb-2">
                Visibility
              </div>
              <VisSelector
                value={vis}
                onChange={(v) => {
                  setVis(v);
                  if (form) onVisibilityChange(form.id, v);
                }}
              />
              <p className="text-[11px] text-ink/60 mt-2">
                Public forms are discoverable. Unlisted forms are accessible only via direct link.
              </p>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60 mb-2">
                Close form after
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={maxResponses}
                  onChange={(e) => setMaxResponses(e.target.value)}
                  placeholder="Unlimited"
                  className="w-28 border border-ink/20 px-3 py-1.5 font-display font-bold text-sm focus:outline-none focus:border-ink"
                />
                <span className="text-sm text-ink/70">responses</span>
              </div>
              <p className="text-[11px] text-ink/60 mt-1.5">Leave blank for unlimited responses.</p>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-ink/60 mb-3">
                Notifications
              </div>
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 border-b border-ink/8">
                  <span className="text-sm">Email on each submission</span>
                  <Toggle checked={emailNotif} onChange={setEmailNotif} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm">Daily digest email</span>
                  <Toggle checked={dailyDigest} onChange={setDailyDigest} />
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className="flex items-center gap-2 bg-ink text-paper px-5 py-2 font-display font-semibold text-[11px] tracking-widest uppercase hover:bg-ink/80 transition-all disabled:opacity-50"
            >
              {settingsSaving && <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 12 }} aria-hidden="true" />}
              Save settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "forms", icon: "ti-layout-grid", label: "My forms" },
  { key: "analytics", icon: "ti-chart-bar", label: "Analytics" },
  { key: "responses", icon: "ti-inbox", label: "Responses" },
] as const;

function Sidebar({
  active,
  onChange,
  formsCount,
  user,
}: {
  active: ViewKey;
  onChange: (v: ViewKey) => void;
  formsCount: number;
  user: { id: string; email: string; fullName: string } | null | undefined;
}) {
  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) ?? "—";

  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 bg-shell text-shell-fg flex-col border-r border-shell-fg/10">
      <div className="px-5 py-5 border-b border-shell-fg/8">
        <Logo size={15} />
      </div>
      <nav className="pt-3 flex-1" aria-label="Dashboard">
        <div className="px-3 pb-1 font-mono text-[9px] tracking-widest uppercase text-shell-fg/55">
          Workspace
        </div>
        {NAV_ITEMS.map((n) => (
          <button
            key={n.key}
            onClick={() => onChange(n.key)}
            aria-current={active === n.key ? "page" : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 mx-0 text-[13px] transition-all rounded-[4px] mb-0.5 ${
              active === n.key
                ? "bg-shell-fg/12 text-shell-fg font-medium"
                : "text-shell-fg/60 hover:bg-shell-fg/8 hover:text-shell-fg"
            }`}
          >
            <i
              className={`ti ${n.icon} flex-shrink-0`}
              style={{ fontSize: 15 }}
              aria-hidden="true"
            />
            <span className="flex-1 text-left">{n.label}</span>
            {n.key === "forms" && formsCount > 0 && (
              <span className="font-mono text-[9px] bg-shell-fg/15 px-1.5 py-0.5 rounded-[3px]">
                {formsCount}
              </span>
            )}
          </button>
        ))}
        <div className="px-3 py-3 mt-1 font-mono text-[9px] tracking-widest uppercase text-shell-fg/55">
          Discover
        </div>
        <Link
          href="/explore"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-shell-fg/60 hover:bg-shell-fg/8 hover:text-shell-fg transition-all mb-0.5"
        >
          <i className="ti ti-world" style={{ fontSize: 15 }} aria-hidden="true" />
          Explore forms
        </Link>
      </nav>
      <div className="p-3 border-t border-shell-fg/8">
        <div className="flex items-center gap-2.5 p-2">
          <div className="w-8 h-8 rounded-full bg-shell-fg/15 flex items-center justify-center font-display font-bold text-[11px] text-shell-fg flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-shell-fg truncate">{user?.fullName ?? "—"}</div>
            <div className="font-mono text-[9px] text-shell-fg/55 uppercase tracking-widest truncate">
              {user?.email ?? ""}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ active, onChange }: { active: ViewKey; onChange: (v: ViewKey) => void }) {
  return (
    <nav
      className="md:hidden bg-shell text-shell-fg flex items-center gap-1 px-3 py-2 overflow-x-auto shrink-0"
      aria-label="Dashboard"
    >
      <span className="pr-2 flex-shrink-0 flex items-center">
        <LogoMark size={18} />
      </span>
      {NAV_ITEMS.map((n) => (
        <button
          key={n.key}
          onClick={() => onChange(n.key)}
          aria-current={active === n.key ? "page" : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-[4px] whitespace-nowrap transition-all ${
            active === n.key ? "bg-shell-fg/12 text-shell-fg font-medium" : "text-shell-fg/60 hover:text-shell-fg"
          }`}
        >
          <i className={`ti ${n.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
          {n.label}
        </button>
      ))}
      <Link
        href="/explore"
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-shell-fg/60 hover:text-shell-fg whitespace-nowrap transition-all"
      >
        <i className="ti ti-world" style={{ fontSize: 14 }} aria-hidden="true" />
        Explore
      </Link>
    </nav>
  );
}

// ─── New form modal ───────────────────────────────────────────────────────────

function NewFormModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (id: string, title: string) => void;
}) {
  const { createFormAsync } = useCreateForm();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { id } = await createFormAsync({ title: title.trim(), description: description.trim() || undefined });
      onSuccess(id, title.trim());
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  useEscape(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-form-title"
        className="bg-paper border border-ink/20 shadow-[6px_6px_0_rgba(17,24,39,0.10)] dark:shadow-[6px_6px_0_rgba(0,0,0,0.5)] w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <span id="new-form-title" className="font-display font-bold text-sm tracking-tight">New form</span>
          <button
            onClick={onClose}
            className="text-ink/55 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[9px] tracking-widest uppercase text-ink/60">
                Title <span className="text-ink/60">*</span>
              </label>
              <span className="font-mono text-[9px] text-ink/60">{title.length}/55</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 55))}
              placeholder="e.g. Customer feedback survey"
              disabled={submitting}
              autoFocus
              className="w-full border border-ink/20 bg-surface px-3 py-2 text-sm font-display placeholder:text-ink/60 focus:outline-none focus:border-ink transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[9px] tracking-widest uppercase text-ink/60">
                Description{" "}
                <span className="normal-case tracking-normal text-ink/60">(optional)</span>
              </label>
              <span className="font-mono text-[9px] text-ink/60">{description.length}/300</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              placeholder="Short description of what this form is for…"
              disabled={submitting}
              rows={3}
              className="w-full border border-ink/20 bg-surface px-3 py-2 text-sm font-display placeholder:text-ink/60 focus:outline-none focus:border-ink transition-colors resize-none disabled:opacity-50"
            />
          </div>

          {submitError && (
            <div className="font-mono text-[10px] text-red-700 border border-red-200 bg-red-50 dark:text-red-300 dark:border-red-900 dark:bg-red-950/40 px-3 py-2">
              {submitError}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border border-ink/20 px-4 py-2 font-display font-semibold text-[11px] tracking-widest uppercase text-ink/60 hover:border-ink/40 hover:text-ink transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 bg-ink text-paper px-4 py-2 font-display font-semibold text-[11px] tracking-widest uppercase hover:bg-ink/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <i
                    className="ti ti-loader-2 animate-spin"
                    style={{ fontSize: 13 }}
                    aria-hidden="true"
                  />
                  Creating…
                </>
              ) : (
                <>
                  <i className="ti ti-plus" style={{ fontSize: 13 }} aria-hidden="true" />
                  Create form
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEscape(onCancel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-paper border border-ink/20 shadow-[6px_6px_0_rgba(17,24,39,0.10)] dark:shadow-[6px_6px_0_rgba(0,0,0,0.5)] w-full max-w-sm mx-4 p-5"
      >
        <div id="confirm-title" className="font-display font-bold text-sm tracking-tight mb-2">
          {title}
        </div>
        <p className="text-[12px] text-ink/70 mb-5">{body}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            autoFocus
            className="flex-1 border border-ink/20 px-4 py-2 font-display font-semibold text-[11px] tracking-widest uppercase text-ink/60 hover:border-ink/40 hover:text-ink transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 bg-red-700 text-white px-4 py-2 font-display font-semibold text-[11px] tracking-widest uppercase hover:bg-red-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy && <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 12 }} aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const VIEW_TITLES: Record<ViewKey, string> = {
  forms: "My forms",
  analytics: "Analytics",
  responses: "All responses",
  detail: "Form detail",
};

export default function Dashboard() {
  const [view, setView] = useState<ViewKey>("forms");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<TabKey | undefined>(undefined);
  const [showNewForm, setShowNewForm] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { msg, visible, toast } = useToast();
  const { forms = [] } = useListForms();
  const { user } = useUser();
  const { deleteFormAsync } = useDeleteForm();
  const { updateFormStatusAsync } = useUpdateFormStatus();
  const { updateFormVisibilityAsync } = useUpdateFormVisibility();

  const handlePublishToggle = async (id: string, newStatus: "published" | "unpublished") => {
    try {
      await updateFormStatusAsync({ id, status: newStatus });
      toast(`Form ${newStatus}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleVisibilityChange = async (id: string, visibility: Visibility) => {
    try {
      await updateFormVisibilityAsync({ id, visibility });
      toast(`Visibility set to ${visibility}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update visibility");
    }
  };

  const openFormFields = (id: string) => {
    setSelectedFormId(id);
    setDetailInitialTab("fields");
    setView("detail");
  };

  const openFormDetail = (id: string) => {
    setSelectedFormId(id);
    setDetailInitialTab("overview");
    setView("detail");
  };

  const openFormResponses = (id: string) => {
    setSelectedFormId(id);
    setDetailInitialTab("responses");
    setView("detail");
  };

  const requestDeleteForm = (id: string, title: string) => setPendingDelete({ id, title });

  const confirmDeleteForm = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteFormAsync({ id: pendingDelete.id });
      if (selectedFormId === pendingDelete.id) {
        setSelectedFormId(null);
        setView("forms");
      }
      toast(`"${pendingDelete.title}" deleted`);
      setPendingDelete(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete form");
    } finally {
      setDeleting(false);
    }
  };

  const activeNav: ViewKey = view === "detail" ? "forms" : view;

  return (
    <div
      className="dash flex min-h-screen bg-canvas text-ink transition-colors"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Roboto:wght@300;400;500&family=PT+Mono&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.36.0/dist/tabler-icons.min.css');
        .font-display { font-family: 'Montserrat', sans-serif; }
        .font-mono    { font-family: 'PT Mono', monospace; }
        .dash ::selection { background: var(--ink); color: var(--paper); }
        .dash :is(button, a, input, select, textarea, [role="switch"]):focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 2px;
        }
        .dash aside :is(button, a):focus-visible,
        .dash nav.bg-shell :is(button, a):focus-visible {
          outline-color: #FAFAF8;
        }
        @media (prefers-reduced-motion: reduce) {
          .dash *, .dash *::before, .dash *::after {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <Sidebar active={activeNav} onChange={setView} formsCount={forms.length} user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav active={activeNav} onChange={setView} />
        <div className="bg-paper border-b border-ink/10 px-4 md:px-7 h-13 flex items-center justify-between gap-3 shrink-0">
          <span className="font-display font-bold text-base tracking-tight truncate">
            {VIEW_TITLES[view]}
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle className="h-8 w-8" />
            <label className="hidden sm:flex items-center gap-2 border border-ink/15 bg-surface px-3 py-1.5 focus-within:border-ink/50 transition-colors cursor-text">
              <i className="ti ti-search text-ink/55" style={{ fontSize: 14 }} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value && view !== "forms") setView("forms");
                }}
                placeholder="Search forms…"
                aria-label="Search forms"
                className="w-36 lg:w-44 bg-transparent text-[12px] text-ink placeholder:text-ink/60 focus:outline-none"
              />
            </label>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-1.5 bg-ink text-paper px-4 py-2 font-display font-semibold text-[11px] tracking-widest uppercase hover:bg-ink/80 transition-all whitespace-nowrap"
            >
              <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
              New form
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-7 overflow-y-auto">
          {view === "forms" && (
            <FormsView
              search={search}
              onClearSearch={() => setSearch("")}
              onViewDetail={openFormDetail}
              onEditFields={openFormFields}
              onDelete={requestDeleteForm}
              onNewForm={() => setShowNewForm(true)}
              onPublishToggle={handlePublishToggle}
              onVisibilityChange={handleVisibilityChange}
              toast={toast}
            />
          )}
          {view === "analytics" && <AnalyticsView />}
          {view === "responses" && (
            <ResponsesView forms={forms} toast={toast} onOpenForm={openFormResponses} />
          )}
          {view === "detail" && (
            <DetailView
              form={forms.find((f) => f.id === selectedFormId) ?? null}
              onBack={() => setView("forms")}
              toast={toast}
              initialTab={detailInitialTab}
              onPublishToggle={handlePublishToggle}
              onVisibilityChange={handleVisibilityChange}
            />
          )}
        </main>
      </div>

      {showNewForm && (
        <NewFormModal
          onClose={() => setShowNewForm(false)}
          onSuccess={(id, title) => {
            setShowNewForm(false);
            toast(`"${title}" created!`);
            openFormFields(id);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete "${pendingDelete.title}"?`}
          body="This permanently deletes the form and all of its responses. This can't be undone."
          confirmLabel="Delete form"
          busy={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void confirmDeleteForm()}
        />
      )}

      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 left-1/2 z-[100] bg-ink text-paper font-mono text-[11px] tracking-wide px-5 py-2.5 pointer-events-none transition-all duration-200"
        style={{
          transform: `translateX(-50%) translateY(${visible ? 0 : 60}px)`,
          opacity: visible ? 1 : 0,
        }}
      >
        {msg}
      </div>
    </div>
  );
}
