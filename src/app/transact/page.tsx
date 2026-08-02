import type { Metadata } from "next";
import { TransactInterface } from "@/components/transact/TransactInterface";
import { metadataFor } from "@/lib/seo";

export const metadata: Metadata = metadataFor("/transact");

export default function TransactPage() {
  return <TransactInterface />;
}
