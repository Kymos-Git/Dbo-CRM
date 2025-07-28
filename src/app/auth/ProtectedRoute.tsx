"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";
import { LoadingComponent } from "../components/loading/loading";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, accessToken } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false); 

  useEffect(() => {
    if (!loading) {
      if (!accessToken) {
        setAllowed(false);
        router.push("/");
      } else {
        setAllowed(true); 
      }
    }
  }, [loading, accessToken, router]);

  if (loading || !allowed) {
    
    return <LoadingComponent />;
  }

  return <>{children}</>;
}
