"use client";

import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { MessageKey } from "@/lib/i18n/locales";

type NavChild = {
  href: string;
  labelKey: MessageKey;
  hintKey?: MessageKey;
  icon: string;
};

type NavItem = {
  labelKey: MessageKey;
  href?: string;
  children?: NavChild[];
};

function siteHref(href: string, siteOrigin?: string) {
  return siteOrigin && href.startsWith("/") ? `${siteOrigin}${href}` : href;
}

function useMenu(): NavItem[] {
  return [
    {
      labelKey: "nav.learn",
      children: [
        {
          href: "/explain",
          labelKey: "nav.explain",
          hintKey: "nav.explain.hint",
          icon: "◎",
        },
        {
          href: "/news",
          labelKey: "nav.news",
          hintKey: "nav.news.hint",
          icon: "⌁",
        },
        {
          href: "/token?view=1",
          labelKey: "nav.token",
          hintKey: "nav.token.hint",
          icon: "◉",
        },
        {
          href: "/alloc?view=1",
          labelKey: "nav.alloc",
          hintKey: "nav.alloc.hint",
          icon: "◒",
        },
        {
          href: "/compare",
          labelKey: "nav.compare",
          hintKey: "nav.compare.hint",
          icon: "⇄",
        },
        {
          href: "/por",
          labelKey: "nav.por",
          hintKey: "nav.por.hint",
          icon: "◇",
        },
        {
          href: "/white-paper",
          labelKey: "nav.whitePaper",
          hintKey: "nav.whitePaper.hint",
          icon: "▤",
        },
        {
          href: "/slud",
          labelKey: "nav.slud",
          hintKey: "nav.slud.hint",
          icon: "⊘",
        },
        {
          href: "https://docs.grid-compute.com",
          labelKey: "nav.docs",
          hintKey: "nav.docs.hint",
          icon: "⌘",
        },
        {
          href: "/ember",
          labelKey: "nav.emberItem",
          hintKey: "nav.ember.hint",
          icon: "✦",
        },
        {
          href: "/#mission",
          labelKey: "nav.mission",
          hintKey: "nav.mission.hint",
          icon: "↑",
        },
        {
          href: "/#network",
          labelKey: "nav.networkItem",
          hintKey: "nav.network.hint",
          icon: "⌗",
        },
        {
          href: "/#security",
          labelKey: "nav.security",
          hintKey: "nav.security.hint",
          icon: "◆",
        },
        {
          href: "/#timeline",
          labelKey: "nav.phases",
          hintKey: "nav.phases.hint",
          icon: "→",
        },
      ],
    },
    {
      labelKey: "nav.network",
      children: [
        {
          href: "/#mesh-downloads",
          labelKey: "nav.mesh",
          hintKey: "nav.mesh.hint",
          icon: "⌁",
        },
        {
          href: "/#mesh",
          labelKey: "nav.aboutMesh",
          hintKey: "nav.aboutMesh.hint",
          icon: "◫",
        },
        {
          href: "/#nodes",
          labelKey: "nav.nodes",
          hintKey: "nav.nodes.hint",
          icon: "⌬",
        },
        {
          href: "https://explorer.grid-compute.com",
          labelKey: "nav.explorer",
          hintKey: "nav.explorer.hint",
          icon: "⊕",
        },
        {
          href: "/mine",
          labelKey: "nav.miners",
          hintKey: "nav.miners.hint",
          icon: "⛏",
        },
        {
          href: "/registry",
          labelKey: "nav.registryItem",
          hintKey: "nav.registry.hint",
          icon: "⌖",
        },
        {
          href: "/ember",
          labelKey: "nav.emberFull",
          hintKey: "nav.emberFull.hint",
          icon: "✦",
        },
        {
          href: "/engine",
          labelKey: "nav.engine",
          hintKey: "nav.engine.hint",
          icon: "▣",
        },
      ],
    },
    {
      labelKey: "nav.getStarted",
      children: [
        {
          href: "/quick",
          labelKey: "nav.quick",
          hintKey: "nav.quick.hint",
          icon: "⚡",
        },
        {
          href: "/registry",
          labelKey: "nav.register",
          hintKey: "nav.register.hint",
          icon: "+",
        },
        {
          href: "/ember",
          labelKey: "nav.runEmber",
          hintKey: "nav.runEmber.hint",
          icon: "✦",
        },
        {
          href: "/#mesh-downloads",
          labelKey: "nav.meshApp",
          hintKey: "nav.meshApp.hint",
          icon: "◫",
        },
        {
          href: "/#download",
          labelKey: "nav.cli",
          hintKey: "nav.cli.hint",
          icon: ">_",
        },
        {
          href: "/wallet",
          labelKey: "nav.wallets",
          hintKey: "nav.wallets.hint",
          icon: "▰",
        },
        {
          href: "/explain",
          labelKey: "nav.how",
          hintKey: "nav.how.hint",
          icon: "?",
        },
      ],
    },
    {
      labelKey: "nav.shop",
      href: "/shop",
    },
    {
      labelKey: "nav.otg27",
      href: "/otg",
    },
  ];
}

function DesktopDropdown({
  item,
  siteOrigin,
}: {
  item: NavItem;
  siteOrigin?: string;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  if (!item.children?.length) {
    return (
      <li>
        <a
          href={siteHref(item.href ?? "#", siteOrigin)}
          className="text-[0.7rem] font-medium tracking-[0.2em] text-white/70 uppercase transition hover:text-white"
        >
          {t(item.labelKey)}
        </a>
      </li>
    );
  }

  const columnClass =
    item.children.length > 9
      ? "grid-cols-3 w-[720px]"
      : item.children.length > 4
        ? "grid-cols-2 w-[500px]"
        : "grid-cols-1 min-w-[250px]";

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 text-[0.7rem] font-medium tracking-[0.2em] text-white/70 uppercase transition hover:text-white"
        onClick={() => setOpen((v) => !v)}
      >
        {t(item.labelKey)}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`opacity-50 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-50 pt-3 -translate-x-1/2">
          <div
            className={`grid gap-px border border-white/12 bg-white/10 p-px shadow-2xl shadow-black/50 backdrop-blur-xl ${columnClass}`}
          >
            {item.children.map((c) => (
              <a
                key={c.href + c.labelKey}
                href={siteHref(c.href, siteOrigin)}
                className="group/item flex min-h-[64px] items-start gap-3 bg-black/95 px-3.5 py-3 transition hover:bg-[#111]"
                onClick={() => setOpen(false)}
              >
                <span
                  aria-hidden
                  className="mt-px flex h-7 w-7 shrink-0 items-center justify-center border border-white/12 font-mono text-[0.68rem] text-white/45 transition group-hover/item:border-white/30 group-hover/item:text-white"
                >
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-medium tracking-[0.14em] text-white/90 uppercase">
                    {t(c.labelKey)}
                  </span>
                  {c.hintKey && (
                    <span className="mt-0.5 block truncate text-[0.66rem] text-white/35">
                      {t(c.hintKey)}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

export function Nav({ siteOrigin }: { siteOrigin?: string } = {}) {
  const { t } = useLocale();
  const menu = useMenu();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "nav-scrolled" : ""
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-10">
        <a
          href={siteHref("/", siteOrigin)}
          className="group flex items-center gap-2.5 text-white"
        >
          <Logo className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-[0.35em]">GRID</span>
        </a>

        <ul className="hidden items-center gap-8 lg:gap-10 md:flex">
          {menu.map((item) => (
            <DesktopDropdown
              key={item.labelKey}
              item={item}
              siteOrigin={siteOrigin}
            />
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <a
            href={siteHref("/ember", siteOrigin)}
            className="hidden border border-white/25 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition hover:border-white/60 hover:text-white sm:inline-flex"
          >
            {t("nav.ember")}
          </a>
          <a
            href="https://discord.gg/nVs7NBCuqZ"
            target="_blank"
            rel="noreferrer"
            className="hidden border border-[#5865F2]/60 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] text-[#c6cbff] uppercase transition hover:border-[#8f98ff] hover:text-white xl:inline-flex"
          >
            Discord
          </a>
          <a
            href={siteHref("/registry", siteOrigin)}
            className="inline-flex border border-white/50 bg-white px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] text-black uppercase transition hover:bg-transparent hover:text-white"
          >
            {t("nav.registry")}
          </a>
          <a
            href={siteHref("/#download", siteOrigin)}
            className="hidden border border-white/50 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition hover:border-white hover:bg-white hover:text-black sm:inline-flex"
          >
            {t("nav.getGrid")}
          </a>
          <button
            type="button"
            aria-label={t("nav.menu")}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`h-px w-5 bg-white transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-5 bg-white transition ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-5 bg-white transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {open && (
        <div className="max-h-[min(80vh,640px)] overflow-y-auto border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col px-5 py-4">
            {menu.map((item) => (
              <li key={item.labelKey} className="border-t border-white/8">
                {item.children?.length ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 text-left text-sm tracking-[0.18em] text-white/80 uppercase"
                      onClick={() =>
                        setMobileSection((s) =>
                          s === item.labelKey ? null : item.labelKey,
                        )
                      }
                      aria-expanded={mobileSection === item.labelKey}
                    >
                      {t(item.labelKey)}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 10 10"
                        fill="none"
                        className={`opacity-40 transition ${
                          mobileSection === item.labelKey ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M2 3.5L5 6.5L8 3.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    {mobileSection === item.labelKey && (
                      <ul className="mb-2 border-l border-white/10 pl-4">
                        {item.children.map((c) => (
                          <li key={c.href + c.labelKey}>
                            <a
                              href={siteHref(c.href, siteOrigin)}
                              onClick={() => setOpen(false)}
                              className="flex items-start gap-3 py-2.5"
                            >
                              <span
                                aria-hidden
                                className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/12 font-mono text-[0.65rem] text-white/45"
                              >
                                {c.icon}
                              </span>
                              <span>
                                <span className="block text-[0.8rem] tracking-[0.14em] text-white/85 uppercase">
                                  {t(c.labelKey)}
                                </span>
                                {c.hintKey && (
                                  <span className="mt-0.5 block text-xs text-white/35">
                                    {t(c.hintKey)}
                                  </span>
                                )}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <a
                    href={siteHref(item.href ?? "#", siteOrigin)}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm tracking-[0.18em] text-white/80 uppercase"
                  >
                    {t(item.labelKey)}
                  </a>
                )}
              </li>
            ))}
            <li className="border-t border-white/10 pt-4 flex items-center justify-between gap-3 py-2">
              <span className="text-sm tracking-[0.14em] text-white/50 uppercase">
                {t("lang.title")}
              </span>
              <LanguageSwitcher />
            </li>
            <li className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm tracking-[0.14em] text-white/50 uppercase">
                {t("nav.theme")}
              </span>
              <ThemeToggle />
            </li>
            <li className="pt-2">
              <a
                href={siteHref("/ember", siteOrigin)}
                onClick={() => setOpen(false)}
                className="btn-ghost w-full"
              >
                {t("nav.ember")}
              </a>
            </li>
            <li className="pt-2">
              <a
                href="https://discord.gg/nVs7NBCuqZ"
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="btn-ghost w-full border-[#5865F2]/60 text-[#c6cbff] hover:border-[#8f98ff] hover:text-white"
              >
                Join Discord
              </a>
            </li>
            <li className="pt-2">
              <a
                href={siteHref("/registry", siteOrigin)}
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                {t("nav.registry")}
              </a>
            </li>
            <li className="pt-2 pb-2">
              <a
                href={siteHref("/#download", siteOrigin)}
                onClick={() => setOpen(false)}
                className="btn-ghost w-full"
              >
                {t("nav.getGrid")}
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
