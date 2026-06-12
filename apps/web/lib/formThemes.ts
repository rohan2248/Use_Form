export interface FormTheme {
  id: string;
  name: string;
  background: string;
  text: string;
  textMuted: string;
  border: string;
  button: string;
  buttonText: string;
  inputBg: string;
  error: string;
  selection: string;
  selectionText: string;
}

export const FORM_THEMES: FormTheme[] = [
  {
    id: "paper",
    name: "Paper",
    background: "#FAFAF8",
    text: "#111827",
    textMuted: "rgba(17,24,39,0.55)",
    border: "rgba(17,24,39,0.1)",
    button: "#111827",
    buttonText: "#FAFAF8",
    inputBg: "#FFFFFF",
    error: "#DC2626",
    selection: "#111827",
    selectionText: "#FAFAF8",
  },
  {
    id: "tsushima",
    name: "Tsushima",
    background: "#11151C",
    text: "#E8D5B0",
    textMuted: "rgba(232,213,176,0.5)",
    border: "rgba(201,162,83,0.22)",
    button: "#C9A253",
    buttonText: "#11151C",
    inputBg: "#1C2130",
    error: "#E05454",
    selection: "#C9A253",
    selectionText: "#11151C",
  },
];

export function getTheme(id?: string | null): FormTheme {
  return FORM_THEMES.find((t) => t.id === id) ?? FORM_THEMES[0]!;
}
