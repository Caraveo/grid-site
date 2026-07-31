import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrambleText } from "@/components/ScrambleText";
import { ProductGrid } from "@/components/Shop";
import { SHOP_PRODUCTS } from "@/lib/shop-products";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = metadataFor("/shop");

export default function ShopPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="min-h-screen pt-16 lg:pt-20">
        <section className="relative overflow-hidden px-5 pb-12 pt-16 sm:pt-24 sm:pb-16">
          <div className="pointer-events-none absolute inset-0 hero-glow opacity-70" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="section-label">
              <ScrambleText text="Shop" />
            </p>
            <h1 className="mt-5 text-[clamp(2.2rem,6vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              Wear the network.
              <br />
              <span className="font-thin text-white/70">GRID Compute tees.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl section-body text-center text-base sm:text-lg">
              Twelve black unisex designs. Tap a tee to order — Cash App or
              Bitcoin, then we ship.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#products" className="btn-primary">
                Browse tees
              </a>
            </div>
          </div>
        </section>

        <section
          id="products"
          className="relative border-t border-white/10 px-5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label">
                  <ScrambleText text="Collection" />
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                  Twelve lines. One fabric.
                </h2>
              </div>
              <p className="text-sm text-white/40">
                {SHOP_PRODUCTS.length} designs · tap shirt to order
              </p>
            </div>

            <ProductGrid products={SHOP_PRODUCTS} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
