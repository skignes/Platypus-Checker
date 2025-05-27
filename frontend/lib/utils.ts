import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { JenkinsTestResult, ProjectBuild, Section } from "@/lib/definitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePassRate(project: ProjectBuild) {
  const passed = project.build.passCount;
  const total = passed + project.build.failCount + project.build.skipCount;
  return Math.round((passed / total) * 100);
}

export function calculateStatusColor(passRate: number) {
  let statusColor = "text-emerald-500";

  if (passRate <= 50) {
    statusColor = "text-red-500";
  } else if (passRate < 90) {
    statusColor = "text-yellow-500";
  }
  return statusColor;
}

export function groupProjectTests(cases: JenkinsTestResult[]): Section[] {
  const sections: Section[] = [];

  for (const test of cases) {
    const [__, sectionName, _] = test.name.split(":");
    const section = sections.find((sec) => sec.name == sectionName);

    if (section == undefined) {
      sections.push({
        name: sectionName,
        tests: [test],
        status: "",
        passRate: 0,
      });
    } else {
      section.tests.push(test);
    }
  }
  sections.forEach((section) => {
    section.passRate = Math.round(
      ((section.tests.filter((t) => t.status === "PASSED").length +
        section.tests.filter((t) => t.status === "FIXED").length) /
        section.tests.length) *
        100,
    );
    if (section.passRate <= 50) section.status = "FAILED";
    else if (section.passRate < 90) section.status = "WARNING";
    else section.status = "PASSED";
  });
  return sections;
}

export function getEllapsedTime(timestamp: string): string {
  const pastDate = new Date(timestamp);
  const now = new Date();

  // @ts-ignore: fuck off tipiscriptity
  const diffMs = now - pastDate;

  if (diffMs < 0 || isNaN(diffMs)) {
    return "Invalid date";
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (seconds < 60) {
    return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (days < 7) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (weeks < 4) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
