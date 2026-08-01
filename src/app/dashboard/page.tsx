import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import ContributorDashboard from "@/components/contributor/ContributorDashboard";

export const metadata: Metadata = metadataFor("/dashboard");

export default function ContributorDashboardPage() {
  return <ContributorDashboard initialTab="mail" />;
}

