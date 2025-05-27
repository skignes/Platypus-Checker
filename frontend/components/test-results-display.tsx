"use client";

import { useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  XCircle,
  AlertTriangle,
  Check,
  CircleHelp,
} from "lucide-react";

import { Section } from "@/lib/definitions";

type TestResultsDisplayProps = {
  sections: Section[];
};

export function TestResultsDisplay({ sections }: TestResultsDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(
    sections.reduce(
      (acc, section) => {
        acc[section.name] = section.status === "FAILED";
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASSED":
        return <Check className="h-5 w-5 text-emerald-500" />;
      case "FIXED":
        return <Check className="h-5 w-5 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "REGRESSION":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "SKIPPED":
        return <CircleHelp className="h-5 w-5 text-zinc-500" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "text-emerald-500";
      case "FIXED":
        return "text-emerald-500";
      case "SKIPPED":
        return "text-zinc-500";
      case "FAILED":
        return "text-red-500";
      case "REGRESSION":
        return "text-red-500";
      case "WARNING":
        return "text-yellow-500";
      default:
        return "text-zinc-300";
    }
  };

  const testName = (name: string) => {
    const split = name.split(":");
    if (split.length == 3) return split[2];
    else return name;
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
        <p className="text-zinc-400">No test data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-2">Test Details</h2>
      {sections.map((section) => (
        <div
          key={section.name}
          className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
            onClick={() => toggleSection(section.name)}
          >
            <div className="flex items-center">
              {expandedSections[section.name] ? (
                <ChevronDown className="h-5 w-5 text-zinc-400 mr-2" />
              ) : (
                <ChevronRight className="h-5 w-5 text-zinc-400 mr-2" />
              )}
              <span className="font-medium text-white">{section.name}</span>
              <div className="ml-3 flex items-center space-x-2">
                {getStatusIcon(section.status)}
                <span className={`ml-1 ${getStatusColor(section.status)}`}>
                  {section.passRate}%
                </span>
              </div>
            </div>
            <div className="text-zinc-400 text-sm">
              {section.tests.length} tests
            </div>
          </div>

          {expandedSections[section.name] && (
            <div className="border-t border-zinc-800">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider w-24">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {section.tests.map((test, index) => (
                    <tr key={index} className="hover:bg-zinc-800/50">
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        <div className="flex flex-col">
                          <p>{testName(test.name)}</p>
                          {(test.status === "FAILED" ||
                            test.status === "REGRESSION") &&
                          test.errorDetails ? (
                            <p className="text-xs text-zinc-600">
                              {test.errorDetails}
                            </p>
                          ) : test.skipped && test.skippedMessage ? (
                            <p className="text-xs text-zinc-600">
                              {test.skippedMessage}
                            </p>
                          ) : test.status === "PASSED" ? (
                            <p className="text-xs text-zinc-600">Test Passed</p>
                          ) : (
                            test.status === "FIXED" && (
                              <p className="text-xs text-zinc-600">
                                Test Fixed
                              </p>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          {getStatusIcon(test.status)}
                          <span
                            className={`ml-1 ${getStatusColor(test.status)}`}
                          >
                            {test.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
