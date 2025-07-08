"use client";

import React, { createContext, useState, useContext } from "react";

type RouteLoadingContextType = {
  loading: boolean;
  setLoading: (v: boolean) => void;
};

const RouteLoadingContext = createContext<RouteLoadingContextType>({
  loading: false,
  setLoading: () => {},
});

export const RouteLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  return (
    <RouteLoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </RouteLoadingContext.Provider>
  );
};

export const useRouteLoading = () => useContext(RouteLoadingContext);
