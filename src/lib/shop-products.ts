/** Shared GRID tee catalog for shop + order validation. */

export type ShopProduct = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  image: string;
  alt: string;
};

export const SHOP_PRICE_USD = 100;
export const SHOP_CASHTAG = "Caraveo";
export const SHOP_CASHTAG_HANDLE = `$${SHOP_CASHTAG}`;
export const SHOP_BTC_ADDRESS =
  "bc1qxtweqvr9anmty56wql74wy4xz4vwxhj65tx8cc";

export const SHOP_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"] as const;
export type ShopSize = (typeof SHOP_SIZES)[number];

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "core-signal",
    number: "01",
    title: "Core Signal",
    tagline: "The network starts with one block.",
    image: "/shop/tees/01-core-signal.png",
    alt: "GRID Core Signal tee — GRID with square mark.",
  },
  {
    id: "canvas",
    number: "02",
    title: "Canvas",
    tagline: "We don't just compute. We build the future.",
    image: "/shop/tees/02-canvas.png",
    alt: "GRID Canvas tee — Compute is our canvas.",
  },
  {
    id: "depth",
    number: "03",
    title: "Depth",
    tagline: "Parallel by design. Infinite by scale.",
    image: "/shop/tees/03-depth.png",
    alt: "GRID Depth tee — perspective grid tunnel.",
  },
  {
    id: "collective-power",
    number: "04",
    title: "Collective Power",
    tagline: "Stronger together. Built by everyone.",
    image: "/shop/tees/04-collective-power.png",
    alt: "GRID Collective Power tee — Millions of machines. One supercomputer.",
  },
  {
    id: "local-roots",
    number: "05",
    title: "Local Roots",
    tagline: "From New Mexico. For the world.",
    image: "/shop/tees/05-local-roots.png",
    alt: "GRID Local Roots tee — New Mexico coordinates.",
  },
  {
    id: "layers",
    number: "06",
    title: "Layers",
    tagline: "Compute. Storage. Bandwidth. All connected.",
    image: "/shop/tees/06-layers.png",
    alt: "GRID Layers tee — stacked compute layers.",
  },
  {
    id: "nodes",
    number: "07",
    title: "Nodes",
    tagline: "Every dot matters. Every node counts.",
    image: "/shop/tees/07-nodes.png",
    alt: "GRID Nodes tee — particle network starburst.",
  },
  {
    id: "loop",
    number: "08",
    title: "Loop",
    tagline: "The protocol is simple. The impact is infinite.",
    image: "/shop/tees/08-loop.png",
    alt: "GRID Loop tee — Build, Connect, Compute, Repeat.",
  },
  {
    id: "terrain",
    number: "09",
    title: "Terrain",
    tagline: "We build on solid ground. We reach further.",
    image: "/shop/tees/09-terrain.png",
    alt: "GRID Terrain tee — wireframe mountain landscape.",
  },
  {
    id: "manifesto",
    number: "10",
    title: "Manifesto",
    tagline: "The mission on the back. The future in front.",
    image: "/shop/tees/10-manifesto.png",
    alt: "GRID Manifesto tee — The world's largest supercomputer won't be built in one place.",
  },
  {
    id: "sphere",
    number: "11",
    title: "Sphere",
    tagline: "Global by nature. Borderless by design.",
    image: "/shop/tees/11-sphere.png",
    alt: "GRID Sphere tee — dotted globe with GRID.",
  },
  {
    id: "minimal",
    number: "12",
    title: "Minimal",
    tagline: "Less noise. More compute.",
    image: "/shop/tees/12-minimal.png",
    alt: "GRID Minimal tee — GRID mark and grid-compute.com.",
  },
];

export function getShopProduct(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === id);
}

export function isShopSize(v: string): v is ShopSize {
  return (SHOP_SIZES as readonly string[]).includes(v);
}

export function cashAppShopUrl(amountUsd: number, note: string): string {
  const amt = amountUsd.toFixed(2);
  const q = encodeURIComponent(note.slice(0, 60));
  return `https://cash.app/$${SHOP_CASHTAG}/${amt}?note=${q}`;
}
