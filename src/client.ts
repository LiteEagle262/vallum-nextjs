"use client";

// This file is the complete client boundary. Keep server admission helpers in
// a separate export so Node-only code can never enter a browser bundle.
export {
  VallumContext,
  VallumProvider,
  VallumProvider as NextVallumProvider,
  VallumRender,
  useVallum,
  useVallumClient,
  useVallumFetch,
} from "@liteeagle226/react";

export type {
  MountOptions,
  VallumClient,
  VallumClientFactory,
  VallumClientOptions,
  VallumContextValue,
  VallumFetch,
  VallumProviderProps,
  VallumRenderProps,
  VallumRenderStatus,
  VallumStatus,
} from "@liteeagle226/react";
