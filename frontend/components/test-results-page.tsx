"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { TestResultsDisplay } from "@/components/test-results-display";
import { TestResultsCharts } from "@/components/test-results-charts";
import {
  GitBranch,
  GitCommit,
  GitPullRequestClosed,
  MoveLeft,
} from "lucide-react";
import {
  calculatePassRate,
  calculateStatusColor,
  getEllapsedTime,
  groupProjectTests,
} from "@/lib/utils";
import { ProjectBuild } from "@/lib/definitions";
import { LoadingSpinner } from "./loading-spinner";
import { getBuilds } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RunJobButton, ViewInJenkinsButton } from "./admin-buttons";
import { isAdmin } from "@/lib/api";

interface TestResultsPageProps {
  project: string;
}

function HistoryCard({
  projectBuild,
  project,
}: {
  projectBuild: ProjectBuild;
  project: string;
}) {
  const passRate = calculatePassRate(projectBuild);

  function backgroundColor() {
    if (passRate <= 50) return "bg-red-500";
    else if (passRate < 90) return "bg-yellow-500";
    else return "bg-green-500";
  }

  return (
    <Link
      key={projectBuild.build.id}
      href={`/projects/${project}/history/${projectBuild.build.id}`}
      className="block p-3 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-white">
          Build #{projectBuild.build.id}
        </span>
        <span className="text-sm text-zinc-400">
          {getEllapsedTime(projectBuild.build.suites[0].timestamp)}
        </span>
      </div>
      <div className="mt-1 flex items-center">
        <span
          className={`inline-block w-2 h-2 rounded-full ${backgroundColor()} mr-2`}
        ></span>
        <span className="text-sm text-zinc-300">
          <span className={`${calculateStatusColor(passRate)}`}>
            {passRate}%
          </span>{" "}
          passing
        </span>
      </div>
    </Link>
  );
}

function Empty({
  project,
  deliveryError,
}: {
  project: string;
  deliveryError?: boolean;
}) {
  return (
    <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="w-full flex flex-row justify-between">
            <h1 className="text-2xl font-bold text-white mb-4">
              Test Results: <span className="text-emerald-500">{project}</span>
            </h1>
          </div>

          {!deliveryError && (
            <div className="w-full flex flex-row justify-between gap-4">
              <div className="flex items-center text-zinc-300">
                <GitBranch className="h-4 w-4 mr-2 text-zinc-500" />
                Branch:{" "}
                <span className="ml-1 font-medium text-white">main</span>
              </div>
            </div>
          )}
          {deliveryError && (
            <div className="w-full flex flex-row justify-center gap-4">
              <div className="flex items-center text-rose-500">
                <GitPullRequestClosed className="h-4 w-4 mr-2" />
                Delivery Error
              </div>
            </div>
          )}
        </div>
        {!deliveryError && (
          <h1 className="w-full text-center text-zinc-600 text-sm">
            No tests to show.
          </h1>
        )}
      </div>
    </main>
  );
}

function EllapsedTime({ timestamp }: { timestamp: string }) {
  const [label, setLabel] = useState(getEllapsedTime(timestamp));

  useEffect(() => {
    const id = setInterval(() => {
      setLabel(getEllapsedTime(timestamp));
    }, 1000);
    return () => clearInterval(id);
  }, [timestamp]);

  return (
    <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
      <div className="text-sm text-zinc-400">Last Run</div>
      <div className="text-xl font-bold text-white mt-1 capitalize">
        {label}
      </div>
    </div>
  );
}

function Results({
  project,
  history,
}: {
  project: string;
  history: ProjectBuild[];
}) {
  const [showAll, setShowAll] = useState(false);
  const maxVisible = 4;
  const [latest] = history;
  if (!latest) return <Empty project={project} />;
  const [latestTest] = latest.build.suites;
  const latestTimestamp = latestTest.timestamp;
  const [_, branch] = Object.keys(latest.git.buildsByBranchName)[0].split("/");
  const commit = Object.values(latest.git.buildsByBranchName)[0].revision.SHA1;
  const totalTestCount =
    latest.build.passCount + latest.build.failCount + latest.build.skipCount;
  const latestPassRate = calculatePassRate(latest);
  const latestStatusColor = calculateStatusColor(latestPassRate);
  const sections = groupProjectTests(latestTest.cases);
  const visibleHistory = showAll ? history : history.slice(0, maxVisible);

  return (
    <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="w-full flex flex-row justify-between">
            <h1 className="text-2xl font-bold text-white mb-4">
              Test Results: <span className="text-emerald-500">{project}</span>
            </h1>
            <div className="text-zinc-400">
              {new Date(latestTimestamp).toLocaleString()}
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

        <TestResultsCharts history={history} sections={sections} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent History{" "}
              <span className="text-emerald-400 font-extrabold">
                {showAll
                  ? history.length
                  : history.length > maxVisible
                    ? `${maxVisible}/${history.length}`
                    : history.length}
              </span>
            </h2>
            <div className="space-y-3">
              {visibleHistory.map((projectBuild) => (
                <HistoryCard
                  projectBuild={projectBuild}
                  project={project}
                  key={`history-card-${projectBuild.build.id}`}
                />
              ))}
            </div>
            {history.length > maxVisible && (
              <button
                className="mt-4 text-sm text-emerald-400 hover:underline"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll
                  ? "Show Less"
                  : `Show More (${history.length - maxVisible} more)`}
              </button>
            )}
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg h-fit">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                <div className="text-sm text-zinc-400">Total Tests</div>
                <div className="text-3xl font-bold text-zinc-400 mt-1">
                  <span className={`${latestStatusColor}`}>
                    {latest.build.passCount}
                  </span>{" "}
                  / {totalTestCount}
                </div>
              </div>
              <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                <div className="text-sm text-zinc-400">Pass Rate</div>
                <div className={`text-3xl font-bold ${latestStatusColor} mt-1`}>
                  {latestPassRate}%
                </div>
              </div>
              <EllapsedTime timestamp={latestTimestamp} />
            </div>
          </div>
        </div>

        <TestResultsDisplay sections={sections} />
      </div>
    </main>
  );
}

export function TestResultsPage({ project }: TestResultsPageProps) {
  const router = useRouter();

  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jenkins_project"],
    queryFn: async () => await getBuilds(project),
    retry: false,
    refetchOnWindowFocus: true,
  });

  const { data: admin } = useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: isAdmin,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  if (error) throw error;

  const [latest] = !isLoading && history ? history : [];

  const buildHistory = (
    history ? history.filter((b) => b.deliveryError === false) : undefined
  ) as ProjectBuild[] | undefined;

  return (
    <div className="">
      {admin === true && (
        <div className="absolute left-0 right-0 w-fit m-auto flex flex-col items-center mt-2 space-y-1">
          <span className="text-center text-zinc-500 text-sm">Admin Panel</span>
          <div className="flex flex-row space-x-4">
            <ViewInJenkinsButton projectUrl={latest.projectUrl} />
            <RunJobButton project={project} />
          </div>
        </div>
      )}
      <Button
        variant="outline"
        className="mx-4 mt-4"
        onClick={() => router.back()}
      >
        <MoveLeft />
        <span>Go back</span>
      </Button>
      <div className="flex flex-col min-h-screen bg-zinc-950">
        {!isLoading && buildHistory ? (
          latest && latest.deliveryError ? (
            <Empty project={project} deliveryError={true} />
          ) : (
            <Results project={project} history={buildHistory} />
          )
        ) : (
          <LoadingSpinner />
        )}
      </div>
    </div>
  );
}
