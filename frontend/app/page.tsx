"use client";

import { useRouter } from "next/navigation";
import {
  SignIn,
  SignedOut,
  useAuth,
} from "@clerk/nextjs";

export default function SigninPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  if (isSignedIn === true) router.push("/projects");

  return (
    <div className="flex flex-row justify-center items-center w-full h-[90vh]">
      <SignedOut>
        <SignIn routing="hash" afterSignInUrl="/projects"/>
      </SignedOut>
    </div>
  )
}
