import type { CookieOptions } from "express";
import { defaultCookieOptions } from "./cookie";

/**
 * Cookie helpers for the Web Fetch API (Next.js route handlers), mirroring the
 * express helpers in ./cookie.ts. Express gives us `res.cookie()` / `req.cookies`;
 * the fetch adapter gives us a plain `Request` and a mutable `Headers` for the
 * response, so we serialize and parse the headers ourselves.
 */

export function parseCookieHeader(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const pair of header.split(";")) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex < 0) continue;

    const name = pair.slice(0, separatorIndex).trim();
    if (!name) continue;

    const value = pair.slice(separatorIndex + 1).trim();
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }

  return cookies;
}

export function serializeCookie(name: string, value: string, opts: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  // express takes maxAge in milliseconds, the Set-Cookie header wants seconds
  if (opts.maxAge != null) {
    parts.push(`Max-Age=${Math.floor(opts.maxAge / 1000)}`);
    parts.push(`Expires=${new Date(Date.now() + opts.maxAge).toUTCString()}`);
  }
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) {
    const sameSite = opts.sameSite === true ? "Strict" : String(opts.sameSite);
    parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);
  }

  return parts.join("; ");
}

export function createCookieFetchFactory(resHeaders: Headers) {
  return function createCookie(
    name: string,
    value: string,
    opts: CookieOptions = defaultCookieOptions,
  ) {
    resHeaders.append("set-cookie", serializeCookie(name, value, opts));
  };
}

export function getCookieFetchFactory(req: Request) {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  return function getCookie(name: string) {
    return cookies[name];
  };
}

export function clearCookieFetchFactory(resHeaders: Headers) {
  return function clearCookie(name: string) {
    resHeaders.append(
      "set-cookie",
      serializeCookie(name, "", { ...defaultCookieOptions, maxAge: 0 }),
    );
  };
}
