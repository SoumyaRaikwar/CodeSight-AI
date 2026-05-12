"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorBanner } from "@/components/ErrorBanner";
import { FeatureRail } from "@/components/landing/FeatureRail";
import { FlowPreview } from "@/components/landing/FlowPreview";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AnimatedPageShell } from "@/components/motion/AnimatedPageShell";
import { ingestRepo } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (url: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await ingestRepo(url);
      router.push(`/workspace/${data.repo_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ingest repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPageShell>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-8">
        <HeroSection onSubmit={handleSubmit} loading={loading} />
        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} />
          </div>
        )}
        <FlowPreview />
        <HowItWorks />
        <FeatureRail />
      </div>
    </AnimatedPageShell>
  );
}
