"use client";

import { useEffect, useState } from "react";

export type ContributorTheme = "dark" | "light";

const STORAGE_KEY = "grid-mail-theme";

export function useContributorTheme() {
  const [theme, setTheme] = useState<ContributorTheme>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // Hydrate the client-only preference after the server's dark default.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark",
    );
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return { theme, toggleTheme };
}
