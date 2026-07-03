"use client";

import { useContext } from "react";

import { CallContext, type CallContextValue } from "@/context/call-provider";

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return ctx;
}
