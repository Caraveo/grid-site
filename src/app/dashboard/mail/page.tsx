import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import ContributorDashboard from "@/components/contributor/ContributorDashboard";

export const metadata: Metadata = metadataFor("/dashboard/mail");

export default function ContributorMailPage() {
  return <ContributorDashboard initialTab="mail" />;
}

