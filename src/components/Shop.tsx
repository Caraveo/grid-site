"use client";

import {
  type CSSProperties,
  FormEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import {
  SHOP_BTC_ADDRESS,
  SHOP_CASHTAG_HANDLE,
  SHOP_PRICE_USD,
  SHOP_SIZES,
  type ShopProduct,
  type ShopSize,
} from "@/lib/shop-products";

export type { ShopProduct };

type CheckoutStep = "contact" | "pay" | "done";

type OrderPublic = {
  id: string;
  productId: string;
  productTitle: string;
  productNumber: string;
  size: string;
  email: string;
  feeUsd: number;
  paymentNote: string;
  status: string;
  tracked: boolean;
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex w-full items-center justify-between gap-2 border border-white/20 bg-black/40 px-3 py-2 font-mono text-[0.7rem] text-white/80 transition hover:border-white/45 hover:text-white"
      aria-label={`Copy ${label}`}
    >
      <span className="min-w-0 truncate">{value}</span>
      <span className="shrink-0 text-[0.6rem] tracking-[0.14em] text-white/40 uppercase">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

function CheckoutModal({
  product,
  onClose,
}: {
  product: ShopProduct;
  onClose: () => void;
}) {
  const [step, setStep] = useState<CheckoutStep>("contact");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState("");
  const [size, setSize] = useState<ShopSize>("L");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderPublic | null>(null);
  const [cashAppUrl, setCashAppUrl] = useState<string | null>(null);
  const [cashtag, setCashtag] = useState(SHOP_CASHTAG_HANDLE);
  const [btcAddress, setBtcAddress] = useState(SHOP_BTC_ADDRESS);
  const [feeUsd, setFeeUsd] = useState(SHOP_PRICE_USD);
  const [paymentMethod, setPaymentMethod] = useState<"cash_app" | "bitcoin">(
    "cash_app",
  );
  const [cashConfirm, setCashConfirm] = useState("");
  const [btcTxid, setBtcTxid] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onStart(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "start",
          productId: product.id,
          size,
          email,
          name: name || undefined,
          phone: phone || undefined,
          shipping: shipping || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not start checkout");
        return;
      }
      setOrder(data.order);
      setCashAppUrl(data.cashAppUrl ?? data.payment?.cashAppUrl ?? null);
      setCashtag(data.cashtag ?? SHOP_CASHTAG_HANDLE);
      setBtcAddress(data.btcAddress ?? SHOP_BTC_ADDRESS);
      setFeeUsd(data.feeUsd ?? SHOP_PRICE_USD);
      setStep("pay");
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitPayment(e: FormEvent) {
    e.preventDefault();
    if (!order?.id) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "submit_payment",
          id: order.id,
          paymentMethod,
          cashConfirm: cashConfirm || undefined,
          btcTxid: btcTxid || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not submit payment");
        return;
      }
      setOrder(data.order);
      setStep("done");
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="shop-checkout-modal max-h-[min(92vh,840px)] w-full max-w-lg overflow-y-auto border border-white/12 bg-[#0a0a0a] shadow-2xl sm:rounded-sm">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35">
              {product.number} · Checkout
            </p>
            <h2
              id="checkout-title"
              className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white uppercase"
            >
              {product.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-white/15 px-2.5 py-1 text-[0.65rem] tracking-wider text-white/50 uppercase transition hover:border-white/40 hover:text-white"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="relative aspect-square w-full bg-[#737373]">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-contain"
          />
        </div>

        <div className="space-y-5 px-5 py-5">
          {error && (
            <p className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          {step === "contact" && (
            <form onSubmit={onStart} className="space-y-4">
              <p className="text-sm text-white/50">{product.tagline}</p>

              <label className="block">
                <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  Email *
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  Name{" "}
                  <span className="font-normal normal-case tracking-normal text-white/25">
                    (optional)
                  </span>
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
                  placeholder="Shipping name"
                />
              </label>

              <label className="block">
                <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  Phone{" "}
                  <span className="font-normal normal-case tracking-normal text-white/25">
                    (optional)
                  </span>
                </span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
                  placeholder="+1 …"
                />
              </label>

              <label className="block">
                <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  Size *
                </span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {SHOP_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`min-w-[2.75rem] border px-3 py-2 text-sm transition ${
                        size === s
                          ? "border-white bg-white text-black"
                          : "border-white/20 text-white/70 hover:border-white/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  Shipping address{" "}
                  <span className="font-normal normal-case tracking-normal text-white/25">
                    (optional)
                  </span>
                </span>
                <textarea
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full resize-y border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
                  placeholder="Street, city, state, ZIP, country"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full disabled:opacity-40"
              >
                {busy ? "Starting…" : "Continue to payment"}
              </button>
            </form>
          )}

          {step === "pay" && order && (
            <form onSubmit={onSubmitPayment} className="space-y-4">
              <p className="text-sm text-white/55">
                Pay via Cash App or Bitcoin, then submit so we can track and
                fulfill. Use the exact note below.
              </p>

              <div className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[0.6rem] tracking-[0.18em] text-white/35 uppercase">
                  Payment note
                </p>
                <p className="mt-1 font-mono text-sm text-white">
                  {order.paymentNote}
                </p>
                <div className="mt-2">
                  <CopyButton value={order.paymentNote} label="payment note" />
                </div>
                <p className="mt-3 text-xs text-white/40">
                  Size {order.size} · {order.email}
                </p>
              </div>

              <div className="flex gap-2">
                {(
                  [
                    ["cash_app", "Cash App"],
                    ["bitcoin", "Bitcoin"],
                  ] as const
                ).map(([id, lab]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex-1 border px-3 py-2 text-[0.7rem] tracking-[0.12em] uppercase transition ${
                      paymentMethod === id
                        ? "border-white bg-white text-black"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                  >
                    {lab}
                  </button>
                ))}
              </div>

              {paymentMethod === "cash_app" ? (
                <div className="space-y-3">
                  <p className="text-sm text-white/70">
                    Send to{" "}
                    <span className="font-medium text-white">{cashtag}</span>
                  </p>
                  {cashAppUrl && (
                    <a
                      href={cashAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full"
                    >
                      Open Cash App
                    </a>
                  )}
                  <label className="block">
                    <span className="text-[0.65rem] tracking-[0.16em] text-white/40 uppercase">
                      Cash App confirmation{" "}
                      <span className="normal-case tracking-normal text-white/25">
                        (optional)
                      </span>
                    </span>
                    <input
                      value={cashConfirm}
                      onChange={(e) => setCashConfirm(e.target.value)}
                      className="mt-1.5 w-full border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
                      placeholder="Transaction / receipt id"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/55">
                    Send ~${feeUsd} equivalent BTC to:
                  </p>
                  <CopyButton value={btcAddress} label="Bitcoin address" />
                  <a
                    href={`bitcoin:${btcAddress}`}
                    className="btn-ghost w-full"
                  >
                    Open wallet
                  </a>
                  <label className="block">
                    <span className="text-[0.65rem] tracking-[0.16em] text-white/40 uppercase">
                      TXID{" "}
                      <span className="normal-case tracking-normal text-white/25">
                        (optional)
                      </span>
                    </span>
                    <input
                      value={btcTxid}
                      onChange={(e) => setBtcTxid(e.target.value)}
                      className="mt-1.5 w-full border border-white/15 bg-black/50 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-white/40"
                      placeholder="Transaction id"
                    />
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full disabled:opacity-40"
              >
                {busy ? "Submitting…" : "I've paid — submit for tracking"}
              </button>
              <p className="text-center text-[0.7rem] text-white/30">
                Order is added to admin tracking only after you submit payment.
              </p>
            </form>
          )}

          {step === "done" && order && (
            <div className="space-y-4 text-center">
              <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-emerald-400/80 uppercase">
                Payment submitted
              </p>
              <p className="text-sm leading-relaxed text-white/60">
                Thanks.{" "}
                <strong className="font-normal text-white/90">
                  {order.productTitle}
                </strong>{" "}
                (size {order.size}) is in the fulfillment queue. We&apos;ll
                follow up at{" "}
                <span className="text-white/85">{order.email}</span>.
              </p>
              <p className="font-mono text-xs text-white/35">{order.id}</p>
              <button type="button" onClick={onClose} className="btn-primary">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: ShopProduct }) {
  const [open, setOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const close = useCallback(() => setOpen(false), []);

  function trackZoom(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setZoomOrigin({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  }

  return (
    <>
      <article
        id={product.id}
        className="group flex w-full flex-col overflow-hidden border border-white/10 transition hover:border-white/25"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          onMouseMove={trackZoom}
          onMouseLeave={() => setZoomOrigin({ x: 50, y: 50 })}
          className="relative aspect-square w-full cursor-pointer overflow-hidden bg-[#737373] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:aspect-[4/5]"
          aria-label={`Order ${product.title}`}
        >
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain object-center p-4 transition-transform duration-300 ease-out group-hover:scale-[1.6] sm:p-6"
            priority={product.id === "core-signal"}
            style={
              {
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              } as CSSProperties
            }
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3 text-center text-[0.65rem] tracking-[0.18em] text-white/0 uppercase opacity-0 transition group-hover:text-white/90 group-hover:opacity-100">
            Tap to order
          </span>
        </button>

        <div className="flex flex-1 flex-col gap-2 border-t border-white/10 bg-black p-5 sm:p-6">
          {product.number && (
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35">
              {product.number}
            </p>
          )}
          <h3 className="text-[clamp(1.1rem,3vw,1.4rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-white uppercase">
            {product.title}
          </h3>
          <p className="text-sm leading-relaxed text-white/45">
            {product.tagline}
          </p>
        </div>
      </article>

      {open && <CheckoutModal product={product} onClose={close} />}
    </>
  );
}

export function ProductGrid({ products }: { products: ShopProduct[] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
