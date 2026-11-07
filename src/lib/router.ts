import { useEffect, useState } from "react";

/**
 * Pathname routing (Vercel-friendly) with hash fallback.
 * /login and /#/login both open the login page.
 */

function normalizePath(value: string): string {
  const raw = value.split("#")[0] || "/";
  const [pathPart, queryPart] = raw.split("?");
  let path = pathPart || "/";
  if (!path.startsWith("/")) path = "/" + path;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return queryPart ? `${path}?${queryPart}` : path;
}

export function currentRoute(): string {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) return normalizePath(hash);
  const path = window.location.pathname || "/";
  const search = window.location.search.replace(/^\?/, "");
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return search ? `${normalized}?${search}` : normalized || "/";
}

export function navigate(to: string, section?: string) {
  const path = normalizePath(to);
  if (section) sessionStorage.setItem("br:scroll", section);
  else sessionStorage.removeItem("br:scroll");

  const already = currentRoute() === path && !window.location.hash;
  if (already) {
    window.dispatchEvent(new PopStateEvent("popstate"));
    if (section) {
      window.setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (section) {
    window.setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }
}

export function useHashRoute(): string {
  const [route, setRoute] = useState(() => (typeof window === "undefined" ? "/" : currentRoute()));
  useEffect(() => {
    // Convert leftover hash URLs (e.g. /#/login) into real paths (/login)
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const path = normalizePath(hash);
      window.history.replaceState(null, "", path);
    }
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    onChange();
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);
  return route;
}

export function parseRoute(hash: string): { path: string; segments: string[]; query: URLSearchParams } {
  const [pathPart, queryPart] = (hash || "/").split("?");
  const path = pathPart || "/";
  const segments = path.split("/").filter(Boolean);
  return { path, segments, query: new URLSearchParams(queryPart || "") };
}
