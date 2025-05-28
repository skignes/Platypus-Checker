import { use } from "react";

import { TestResultsPage } from "@/components/test-results-page";

interface ResultPageProps {
  params: Promise<{ project: string }>;
};

export default function ResultPage({ params }: ResultPageProps) {
  const { project } = use<{ project: string }>(params);

  return <TestResultsPage project={project} />;
}
