"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  isLocaleId,
  localeMeta,
  STORAGE_KEY,
  translate,
  type LocaleId,
  type MessageKey,
} from "./locales";

type Ctx = {
  locale: LocaleId;
  setLocale: (id: LocaleId) => void;
  t: (key: MessageKey) => string;
  flag: string;
  label: string;
  ready: boolean;
};

const LocaleContext = createContext<Ctx | null>(null);

function readStored(): LocaleId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (isLocaleId(v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const meta = localeMeta(locale);
    try {
      document.documentElement.lang = meta.htmlLang;
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((id: LocaleId) => {
    setLocaleState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: MessageKey) => translate(locale, key),
    [locale],
  );

  const meta = localeMeta(locale);
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      flag: meta.flag,
      label: meta.label,
      ready,
    }),
    [locale, setLocale, t, meta.flag, meta.label, ready],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
