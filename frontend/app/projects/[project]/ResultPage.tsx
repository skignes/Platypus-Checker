"use client";

import { TestResultsPage } from "@/components/test-results-page";

export default function ClientPage({ project }: { project: string }) {
  return (
    <div className="relative flex flex-col min-h-screen bg-zinc-950">
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-8 transition-opacity duration-500" >
        <TestResultsPage project={project} />
      </div>
    </div>
  );
}
