"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import "@/app/globals.css";
import { Inter, Ubuntu } from "next/font/google";
import { Providers } from "./providers";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { dark } from "@clerk/themes";

import logo from "@/public/logo.png";

const inter = Inter({ subsets: ["latin"] });

const ubuntu = Ubuntu({ subsets: ["latin"], weight: "700" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
        >
          <header className="flex justify-between items-center p-4 gap-4 h-16 border-b">
            <SignedIn>
              <Link href="/projects">
                <div className="flex flex-row items-center space-x-4">
                  <Image src={logo} alt="" className="h-10 w-10" />
                  <span
                    className={`${ubuntu.className} text-platypus font-extrabold text-3xl text-nowrap`}
                  >
                    Platypus Checker
                  </span>
                </div>
              </Link>
            </SignedIn>
            <SignedOut>
              <Link href="/">
                <div className="flex flex-row items-center space-x-4">
                  <Image src={logo} alt="" className="h-10 w-10" />
                  <span
                    className={`${ubuntu.className} text-platypus font-extrabold text-3xl text-nowrap`}
                  >
                    Platypus Checker
                  </span>
                </div>
              </Link>
            </SignedOut>
            <div className="flex flex-row space-x-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <link rel="icon" href="/logo.png" sizes="any" />
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
