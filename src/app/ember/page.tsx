import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata: Metadata = metadataFor("/ember");

export default function LegacyEmberPage() {
  redirect("/phoenix");
}
