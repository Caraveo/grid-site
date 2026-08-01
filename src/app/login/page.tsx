import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { Suspense } from "react";
import ContributorLogin from "@/components/contributor/ContributorLogin";

export const metadata: Metadata = metadataFor("/login");

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#080a0d" }} />}>
      <ContributorLogin />
    </Suspense>
  );
}

