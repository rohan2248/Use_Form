"use client";
import { useRouter } from "next/dist/client/components/navigation";
import { useEffect } from "react";
import App from "~/components/ui/homePage";
import { useUser } from "~/hooks/api/auth";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user && user.id) {
      router.replace("/dashboard");
    }
  }, [user]);

  return <App />;
}
