"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LoadingComponent } from "../loading/loading";
import { useRouteLoading } from "@/app/context/routeContext";


export default function RouteLoader({ children }: { children: React.ReactNode }) {
  const { loading, setLoading } = useRouteLoading();
  const pathname = usePathname();

  // Quando cambia pathname spegni loader
  useEffect(() => {
    setLoading(false);
  }, [pathname, setLoading]);

  if (loading) {
    return <LoadingComponent />;
  }

  return <>{children}</>;
}
