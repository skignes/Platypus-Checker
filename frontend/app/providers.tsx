"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <footer className="border-t border-zinc-800 py-4 bg-zinc-950">
          <div className="container max-w-5xl mx-auto px-4 text-center text-zinc-500 text-sm">
            Platypus &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
