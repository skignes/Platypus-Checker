"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { PRODUCTION } from "@/lib/constants";

export function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-destructive/20 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-destructive to-destructive/60" />
          <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2 pt-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-3 bg-destructive/10 p-3 rounded-full text-destructive"
            >
              <AlertCircle size={32} />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Oops! Something went wrong
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We've encountered an unexpected error
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-md bg-muted p-4"
            >
              {!PRODUCTION ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Error details:
                  </p>
                  <p className="text-sm font-mono text-foreground/80 break-words">
                    {error.message || "An unknown error occurred"}
                  </p>
                  {error.digest && (
                    <p className="text-xs font-mono text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You do not have access
                </p>
              )}
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pb-6">
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-1/2"
                onClick={() => reset()}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button
                className="bg-platypus hover:bg-platypus w-full sm:w-1/2"
                asChild
              >
                <Link href="/projects">
                  <Home className="mr-2 h-4 w-4" />
                  Back to home
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          You can also refresh the page or try again later
        </motion.p>
      </motion.div>
    </div>
  );
}
