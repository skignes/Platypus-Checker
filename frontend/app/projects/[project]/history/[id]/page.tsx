"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { TestResultsDisplay } from "@/components/test-results-display";
import { GitBranch, GitCommit, MoveLeft } from "lucide-react";
import { ProjectBuild } from "@/lib/definitions";
import { groupProjectTests } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getSingleBuild } from "@/lib/api";
import { Button } from "@/components/ui/button";

function History({
  projectBuild,
  id,
}: {
  projectBuild: ProjectBuild;
  id: string;
}) {
  const timestamp = projectBuild.build.suites[0].timestamp;
  const [test] = projectBuild.build.suites;
  const [_, branch] = Object.keys(projectBuild.git.buildsByBranchName)[0].split(
    "/",
  );
  const commit = Object.values(projectBuild.git.buildsByBranchName)[0].revision
    .SHA1;
  const sections = groupProjectTests(test.cases);

  return (
    <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="w-full flex flex-row justify-between">
            <h1 className="text-2xl font-bold text-white mb-4">
              Historical Run <span className="text-emerald-500">#{id}</span>
            </h1>
            <div className="text-zinc-400">
              {new Date(timestamp).toLocaleString()}
            </div>
          </div>

          <div className="w-full flex flex-row justify-between gap-4">
            <div className="flex items-center text-zinc-300">
              <GitBranch className="h-4 w-4 mr-2 text-zinc-500" />
              Branch:{" "}
              <span className="ml-1 font-medium text-white">{branch}</span>
            </div>
            <div className="flex items-center text-zinc-300 truncate">
              <GitCommit className="h-4 w-4 min-h-4 min-w-4 mr-2 text-zinc-500" />
              Commit:{" "}
              <span className="ml-1 font-medium text-white truncate">
                {commit}
              </span>
            </div>
          </div>
        </div>

        <TestResultsDisplay sections={sections} />
      </div>
    </main>
  );
}

interface HistoryPageProps {
  params: Promise<{ id: string; project: string }>;
}

export default function HistoryPage({ params }: HistoryPageProps) {
  const router = useRouter();
  const { id, project } = React.use(params);

  const {
    data: projectBuild,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project-build", id],
    queryFn: async () => await getSingleBuild(project, Number(id)),
    refetchOnWindowFocus: true,
    retry: false,
  });

  if (error) throw error;

  return (
    <div className="">
      <Button
        variant="outline"
        className="mx-4 mt-4"
        onClick={() => router.back()}
      >
        <MoveLeft />
        <span>Go back</span>
      </Button>

      <div className="min-h-screen bg-zinc-950">
        <div className="pb-8 transition-opacity duration-500 w-full">
          <div className="flex flex-col min-h-screen bg-zinc-950">
            {projectBuild && !isLoading && !error ? (
              <>
                {projectBuild.deliveryError ? (
                  <p className="w-full text-center text-zinc-600">
                    Delivery Error
                  </p>
                ) : (
                  <History projectBuild={projectBuild} id={id} />
                )}
              </>
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
