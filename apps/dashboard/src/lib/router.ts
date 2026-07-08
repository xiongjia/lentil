import { useState, useEffect, useCallback } from "react";

/**
 * Lightweight hash-based client-side router hook.
 *
 * Reads `window.location.hash` and returns the current slug (the path
 * segment after `#/`).  Navigation is performed by setting the hash directly
 * so no external router library is required.
 *
 * @param defaultSlug  Returned when the hash is empty (default: `"home"`).
 * @returns A tuple of `[currentSlug, navigate]`.
 */
export const useHashRoute = (
  defaultSlug = "home",
): [string, (slug: string) => void] => {
  const [slug, setSlug] = useState(() => {
    const hash = window.location.hash.replace("#/", "");
    return hash.split("?")[0] || defaultSlug;
  });

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      setSlug(hash.split("?")[0] || defaultSlug);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [defaultSlug]);

  const navigate = useCallback((slug: string) => {
    window.location.hash = `#/${slug}`;
  }, []);

  return [slug, navigate];
};
