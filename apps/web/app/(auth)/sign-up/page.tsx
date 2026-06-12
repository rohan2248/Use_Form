"use client";

import { useRouter } from "next/navigation";
import SignupPageUi from "~/components/ui/signUpPage";

function SignupPage() {
  const router = useRouter();
  return <SignupPageUi onNavigateToLogin={() => router.push("/login")} />;
}

export default SignupPage;
