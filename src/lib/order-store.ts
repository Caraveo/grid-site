/**
 * Shop tee orders — Cash App $Caraveo / Bitcoin.
 * Orders enter admin "tracking" only after payment is submitted by the buyer.
 */

import {
  SHOP_BTC_ADDRESS,
  SHOP_CASHTAG_HANDLE,
  SHOP_PRICE_USD,
  cashAppShopUrl,
  getShopProduct,
  isShopSize,
  type ShopSize,
} from "./shop-products";

const KV_KEY = "shop-orders-v1";
const MAX_ORDERS = 5_000;
const MAX_STORE_BYTES = 2_000_000;

export type OrderStatus =
  | "pending_payment"
  | "payment_submitted"
  | "fulfilled"
  | "cancelled";

export type PaymentMethod = "cash_app" | "bitcoin";

export type ShopOrder = {
  id: string;
  productId: string;
  productTitle: string;
  productNumber: string;
  size: ShopSize;
  email: string;
  name?: string;
  phone?: string;
  shipping?: string;
  feeUsd: number;
  paymentNote: string;
  paymentMethod?: PaymentMethod;
  cashConfirm?: string;
  btcTxid?: string;
  /** True only after buyer submits payment — appears in admin Orders tracking */
  tracked: boolean;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type StoreFile = {
  updatedAt: string;
  byId: Record<string, ShopOrder>;
};

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

let fsMemory: StoreFile | null = null;

async function getKv(): Promise<MeshKv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as { MESH_KV?: MeshKv }).MESH_KV ?? null;
  } catch {
    return null;
  }
}

function emptyStore(): StoreFile {
  return { updatedAt: new Date().toISOString(), byId: {} };
}

async function loadStore(): Promise<StoreFile> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(KV_KEY, "text");
    if (!raw) return emptyStore();
    try {
      const parsed = JSON.parse(raw) as StoreFile;
      if (!parsed?.byId || typeof parsed.byId !== "object") return emptyStore();
      return parsed;
    } catch {
      return emptyStore();
    }
  }
  if (fsMemory) return fsMemory;
  return emptyStore();
}

async function saveStore(store: StoreFile): Promise<void> {
  store.updatedAt = new Date().toISOString();
  const json = JSON.stringify(store);
  if (json.length > MAX_STORE_BYTES) {
    throw new OrderError("order store full", 503);
  }
  const kv = await getKv();
  if (kv) {
    await kv.put(KV_KEY, json);
    return;
  }
  fsMemory = store;
}

function sanitizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase().slice(0, 120);
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(s)) return null;
  if (s.includes("..") || s.startsWith(".") || s.includes("<")) return null;
  return s;
}

function sanitizeOptionalName(raw: unknown): string | undefined {
  if (raw == null || raw === "") return undefined;
  let s = String(raw).trim().slice(0, 80);
  s = s.replace(/[<>`\\]/g, "").replace(/\s+/g, " ");
  if (s.length < 1) return undefined;
  return s;
}

function sanitizeOptionalPhone(raw: unknown): string | undefined {
  if (raw == null || raw === "") return undefined;
  let s = String(raw).trim().slice(0, 40);
  s = s.replace(/[^0-9+().\-\s]/g, "");
  if (s.replace(/\D/g, "").length < 7) return undefined;
  return s;
}

function sanitizeShipping(raw: unknown): string | undefined {
  if (raw == null || raw === "") return undefined;
  let s = String(raw).trim().slice(0, 400);
  s = s.replace(/[<>`\\]/g, "");
  if (s.length < 3) return undefined;
  return s;
}

function makePaymentNote(productId: string): string {
  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const short = productId.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `GRID-TEE-${short}-${code}`;
}

export async function startOrder(input: {
  productId: string;
  size: string;
  email: string;
  name?: string;
  phone?: string;
  shipping?: string;
}): Promise<{
  order: ShopOrder;
  cashAppUrl: string;
  cashtag: string;
  btcAddress: string;
  feeUsd: number;
  instructions: string[];
}> {
  const product = getShopProduct(String(input.productId ?? ""));
  if (!product) throw new OrderError("unknown product", 400);

  const size = String(input.size ?? "").toUpperCase();
  if (!isShopSize(size)) {
    throw new OrderError("size must be S, M, L, XL, XXL, 3XL, or 4XL", 400);
  }

  const email = sanitizeEmail(input.email);
  if (!email) throw new OrderError("valid email required", 400);

  const name = sanitizeOptionalName(input.name);
  const phone = sanitizeOptionalPhone(input.phone);
  const shipping = sanitizeShipping(input.shipping);

  const store = await loadStore();
  const ids = Object.keys(store.byId);
  if (ids.length >= MAX_ORDERS) throw new OrderError("order capacity reached", 503);

  const now = new Date().toISOString();
  const paymentNote = makePaymentNote(product.id);
  const order: ShopOrder = {
    id: `ord_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    productId: product.id,
    productTitle: product.title,
    productNumber: product.number,
    size,
    email,
    name,
    phone,
    shipping,
    feeUsd: SHOP_PRICE_USD,
    paymentNote,
    tracked: false,
    status: "pending_payment",
    createdAt: now,
    updatedAt: now,
  };

  store.byId[order.id] = order;
  await saveStore(store);

  const cashAppUrl = cashAppShopUrl(order.feeUsd, paymentNote);

  return {
    order,
    cashAppUrl,
    cashtag: SHOP_CASHTAG_HANDLE,
    btcAddress: SHOP_BTC_ADDRESS,
    feeUsd: order.feeUsd,
    instructions: [
      `Pay $${order.feeUsd} via Cash App ${SHOP_CASHTAG_HANDLE} or equivalent Bitcoin.`,
      `Use exact payment note: ${paymentNote}`,
      "Then submit payment confirmation so we can track and ship your order.",
    ],
  };
}

export async function submitPayment(input: {
  id: string;
  paymentMethod: string;
  cashConfirm?: string;
  btcTxid?: string;
}): Promise<ShopOrder> {
  const id = String(input.id ?? "").trim();
  if (!id.startsWith("ord_")) throw new OrderError("invalid order id", 400);

  const methodRaw = String(input.paymentMethod ?? "").toLowerCase();
  if (methodRaw !== "cash_app" && methodRaw !== "bitcoin") {
    throw new OrderError("paymentMethod must be cash_app or bitcoin", 400);
  }
  const paymentMethod = methodRaw as PaymentMethod;

  const store = await loadStore();
  const order = store.byId[id];
  if (!order) throw new OrderError("order not found", 404);

  if (order.tracked && order.status === "payment_submitted") {
    return order;
  }
  if (order.status === "fulfilled" || order.status === "cancelled") {
    throw new OrderError(`order is ${order.status}`, 409);
  }

  const cashConfirm =
    input.cashConfirm != null
      ? String(input.cashConfirm).trim().slice(0, 120).replace(/[<>`\\]/g, "")
      : undefined;
  const btcTxid =
    input.btcTxid != null
      ? String(input.btcTxid)
          .trim()
          .slice(0, 128)
          .replace(/[^a-zA-Z0-9]/g, "")
      : undefined;

  if (paymentMethod === "bitcoin" && btcTxid && btcTxid.length < 8) {
    throw new OrderError("btc tx id looks too short", 400);
  }

  const now = new Date().toISOString();
  const updated: ShopOrder = {
    ...order,
    paymentMethod,
    cashConfirm: cashConfirm || order.cashConfirm,
    btcTxid: btcTxid || order.btcTxid,
    status: "payment_submitted",
    tracked: true,
    paidAt: now,
    updatedAt: now,
  };
  store.byId[id] = updated;
  await saveStore(store);
  return updated;
}

export async function getOrder(id: string): Promise<ShopOrder | null> {
  const store = await loadStore();
  return store.byId[id] ?? null;
}

/** Admin list — by default only tracked (payment submitted) orders. */
export async function listOrders(opts?: {
  status?: OrderStatus | "";
  includeUntracked?: boolean;
}): Promise<ShopOrder[]> {
  const store = await loadStore();
  let rows = Object.values(store.byId);
  if (!opts?.includeUntracked) {
    rows = rows.filter((o) => o.tracked);
  }
  if (opts?.status) {
    rows = rows.filter((o) => o.status === opts.status);
  }
  rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return rows;
}

export async function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ShopOrder> {
  const store = await loadStore();
  const order = store.byId[id];
  if (!order) throw new OrderError("order not found", 404);
  const allowed: OrderStatus[] = [
    "pending_payment",
    "payment_submitted",
    "fulfilled",
    "cancelled",
  ];
  if (!allowed.includes(status)) throw new OrderError("invalid status", 400);
  const updated: ShopOrder = {
    ...order,
    status,
    tracked: status === "pending_payment" ? order.tracked : true,
    updatedAt: new Date().toISOString(),
  };
  store.byId[id] = updated;
  await saveStore(store);
  return updated;
}

export async function deleteOrder(id: string): Promise<void> {
  const store = await loadStore();
  if (!store.byId[id]) throw new OrderError("order not found", 404);
  delete store.byId[id];
  await saveStore(store);
}

export async function orderStats(): Promise<{
  total: number;
  payment_submitted: number;
  fulfilled: number;
  cancelled: number;
  pending_payment: number;
}> {
  const store = await loadStore();
  const all = Object.values(store.byId);
  const tracked = all.filter((o) => o.tracked);
  return {
    total: tracked.length,
    payment_submitted: tracked.filter((o) => o.status === "payment_submitted")
      .length,
    fulfilled: tracked.filter((o) => o.status === "fulfilled").length,
    cancelled: tracked.filter((o) => o.status === "cancelled").length,
    pending_payment: all.filter((o) => o.status === "pending_payment").length,
  };
}

/** Public-safe order payload (no extra PII beyond what buyer needs). */
export function publicOrder(order: ShopOrder) {
  return {
    id: order.id,
    productId: order.productId,
    productTitle: order.productTitle,
    productNumber: order.productNumber,
    size: order.size,
    email: order.email,
    feeUsd: order.feeUsd,
    paymentNote: order.paymentNote,
    status: order.status,
    tracked: order.tracked,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
