import { useEffect, useState } from "react";

/** Hash-based routing so the single-file build works from any static host. */

export function navigate(to: string, section?: string) {
  const target = "#" + to;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    if (section) {
      window.setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } else {
    if (section) sessionStorage.setItem("br:scroll", section);
    else sessionStorage.removeItem("br:scroll");
    window.location.hash = to;
  }
}

export function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, "") || "/");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export function parseRoute(hash: string): { path: string; segments: string[]; query: URLSearchParams } {
  const [pathPart, queryPart] = hash.split("?");
  const path = pathPart || "/";
  const segments = path.split("/").filter(Boolean);
  return { path, segments, query: new URLSearchParams(queryPart || "") };
}
