import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata: Metadata = metadataFor("/wallet");

export default function LegacyWalletPage() {
  redirect("/phoenix");
}
