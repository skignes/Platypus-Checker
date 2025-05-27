"use client";

import { LoaderCircle } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="animate-pulse w-full h-[600px] flex items-center justify-center">
      <LoaderCircle className="text-zinc-600 animate-spin w-48 h-48" />
    </div>
  );
}
