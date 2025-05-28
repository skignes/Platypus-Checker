"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function Custom404() {
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
              Oops! You went looking in the wrong place!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              404 Not Found
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col gap-2 pb-6">
            <Button
              className="bg-platypus hover:bg-platypus w-full sm:w-1/2"
              asChild
            >
              <Link href="/projects">
                <Home className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
