"use client";
import { useState, useCallback, useRef } from 'react';

// Store globale per gli z-index
let globalZIndex = 1000;
const activeFormIds = new Set<string>();

export const useZIndex = (formId: string) => {
  const [zIndex, setZIndex] = useState(globalZIndex);
  const formIdRef = useRef(formId);

  const bringToFront = useCallback(() => {
    globalZIndex += 1;
    setZIndex(globalZIndex);
    
    // Aggiungi questo form agli attivi se non c'è già
    activeFormIds.add(formIdRef.current);
  }, []);

  const removeFromStack = useCallback(() => {
    activeFormIds.delete(formIdRef.current);
  }, []);

  return {
    zIndex,
    bringToFront,
    removeFromStack
  };
};