import {
  OTG27_BTC_ADDRESS,
  OTG27_CASHTAG,
  cashAppTicketUrl,
  getOtg27Ticket,
} from "./otg27-tickets";

const KV_KEY = "otg27-ticket-orders-v1";
const MAX_ORDERS = 10_000;

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

export type Otg27Order = {
  id: string;
  ticketId: string;
  ticketName: string;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
  name: string;
  email: string;
  organization?: string;
  paymentNote: string;
  paymentMethod?: "cash_app" | "bitcoin";
  paymentReference?: string;
  status:
    | "pending_payment"
    | "payment_submitted"
    | "confirmed"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
};

type Store = { byId: Record<string, Otg27Order> };
let memoryStore: Store = { byId: {} };

export class Otg27OrderError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

async function getKv(): Promise<MeshKv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as { MESH_KV?: MeshKv }).MESH_KV ?? null;
  } catch {
    return null;
  }
}

async function loadStore(): Promise<Store> {
  const kv = await getKv();
  if (!kv) return memoryStore;
  const raw = await kv.get(KV_KEY, "text");
  if (!raw) return { byId: {} };
  try {
    const parsed = JSON.parse(raw) as Store;
    return parsed?.byId ? parsed : { byId: {} };
  } catch {
    return { byId: {} };
  }
}

async function saveStore(store: Store) {
  const kv = await getKv();
  if (kv) await kv.put(KV_KEY, JSON.stringify(store));
  else memoryStore = store;
}

function cleanText(value: unknown, max: number) {
  return String(value ?? "")
    .trim()
    .slice(0, max)
    .replace(/[<>`\\]/g, "")
    .replace(/\s+/g, " ");
}

function validEmail(value: unknown) {
  const email = cleanText(value, 120).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function startOtg27Order(input: {
  ticketId: string;
  quantity: number;
  name: string;
  email: string;
  organization?: string;
}) {
  const ticket = getOtg27Ticket(input.ticketId);
  if (!ticket) throw new Otg27OrderError("Choose a valid ticket.");
  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 8) {
    throw new Otg27OrderError("Quantity must be between 1 and 8.");
  }
  const name = cleanText(input.name, 80);
  const email = validEmail(input.email);
  const organization = cleanText(input.organization, 100) || undefined;
  if (name.length < 2) throw new Otg27OrderError("Your name is required.");
  if (!email) throw new Otg27OrderError("A valid email is required.");

  const store = await loadStore();
  if (Object.keys(store.byId).length >= MAX_ORDERS) {
    throw new Otg27OrderError("Ticket order capacity reached.", 503);
  }

  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const now = new Date().toISOString();
  const order: Otg27Order = {
    id: `otg_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    ticketId: ticket.id,
    ticketName: ticket.name,
    quantity,
    unitPriceUsd: ticket.price,
    totalUsd: ticket.price * quantity,
    name,
    email,
    organization,
    paymentNote: `OTG27-${ticket.id.toUpperCase()}-${code}`,
    status: "pending_payment",
    createdAt: now,
    updatedAt: now,
  };
  store.byId[order.id] = order;
  await saveStore(store);

  return {
    order,
    cashAppUrl: cashAppTicketUrl(order.totalUsd, order.paymentNote),
    cashtag: OTG27_CASHTAG,
    btcAddress: OTG27_BTC_ADDRESS,
  };
}

export async function submitOtg27Payment(input: {
  id: string;
  paymentMethod: string;
  paymentReference?: string;
}) {
  const store = await loadStore();
  const order = store.byId[cleanText(input.id, 64)];
  if (!order) throw new Otg27OrderError("Ticket order not found.", 404);
  if (input.paymentMethod !== "cash_app" && input.paymentMethod !== "bitcoin") {
    throw new Otg27OrderError("Choose Cash App or Bitcoin.");
  }
  const updated: Otg27Order = {
    ...order,
    paymentMethod: input.paymentMethod,
    paymentReference: cleanText(input.paymentReference, 128) || undefined,
    status: "payment_submitted",
    updatedAt: new Date().toISOString(),
  };
  store.byId[updated.id] = updated;
  await saveStore(store);
  return updated;
}

export async function listOtg27Orders(opts?: {
  status?: Otg27Order["status"];
  includePending?: boolean;
}) {
  const store = await loadStore();
  let orders = Object.values(store.byId);
  if (!opts?.includePending) {
    orders = orders.filter((order) => order.status !== "pending_payment");
  }
  if (opts?.status) {
    orders = orders.filter((order) => order.status === opts.status);
  }
  return orders.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function otg27OrderStats() {
  const all = Object.values((await loadStore()).byId);
  return {
    total: all.filter((order) => order.status !== "pending_payment").length,
    payment_submitted: all.filter(
      (order) => order.status === "payment_submitted",
    ).length,
    confirmed: all.filter((order) => order.status === "confirmed").length,
    cancelled: all.filter((order) => order.status === "cancelled").length,
    pending_payment: all.filter(
      (order) => order.status === "pending_payment",
    ).length,
    attendees: all
      .filter((order) => order.status === "confirmed")
      .reduce((sum, order) => sum + order.quantity, 0),
    revenueUsd: all
      .filter((order) => order.status === "confirmed")
      .reduce((sum, order) => sum + order.totalUsd, 0),
  };
}

export async function setOtg27OrderStatus(
  id: string,
  status: Otg27Order["status"],
) {
  if (!["payment_submitted", "confirmed", "cancelled"].includes(status)) {
    throw new Otg27OrderError("Invalid ticket status.");
  }
  const store = await loadStore();
  const order = store.byId[cleanText(id, 64)];
  if (!order) throw new Otg27OrderError("Ticket order not found.", 404);
  const updated = { ...order, status, updatedAt: new Date().toISOString() };
  store.byId[updated.id] = updated;
  await saveStore(store);
  return updated;
}

export async function deleteOtg27Order(id: string) {
  const store = await loadStore();
  const cleanId = cleanText(id, 64);
  if (!store.byId[cleanId]) {
    throw new Otg27OrderError("Ticket order not found.", 404);
  }
  delete store.byId[cleanId];
  await saveStore(store);
}
