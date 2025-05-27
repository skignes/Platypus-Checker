"use client";

import type React from "react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, LoaderCircle } from "lucide-react";

import cobraLogo from "@/public/cobra.png";

interface RepositoryOverlayProps {
  onSubmit: (repository: string) => Promise<void>;
}

function isRepository(repository: string): boolean {
  const split = repository.trim().split("/");
  if (split.length != 2) return false;
  if (split[0].length > 1 && split[1].length > 1) return true;
  return false;
}

export function RepositoryOverlay({ onSubmit }: RepositoryOverlayProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      setError("Repository is required");
      return;
    }
    if (!input.includes("/")) {
      setError("Please enter in format: owner/repository");
      return;
    }
    setError("");

    setIsLoading(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setError(String(err).replace("Error: ", ""));
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-zinc-950/90 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-block p-3 rounded-full bg-zinc-800 mb-2">
              <Image src={cobraLogo} alt="" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cobra Checker <span className="text-emerald-500">Viewer</span>
            </h1>
            <p className="text-zinc-400">
              Enter a repository to view test results
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="owner/repository"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
              />
              {error && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!isRepository(input) || isLoading}
              className={`${isLoading ? "animate-pulse bg-emerald-300" : ""} w-full bg-emerald-600 hover:bg-emerald-700 text-white`}
            >
              {isLoading && <LoaderCircle className="animate-spin w-4 h-4" />}
              <p>Enter GitHub Repository</p>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
