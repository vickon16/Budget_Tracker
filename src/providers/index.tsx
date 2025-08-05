"use client";

import { PropsWithChildren } from "react";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import ReactQueryProviderWrapper from "./ReactQueryProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      <ThemeProviderWrapper>
        <ReactQueryProviderWrapper>
          <Toaster richColors position="bottom-right" />
          {children}
        </ReactQueryProviderWrapper>
      </ThemeProviderWrapper>
    </SessionProvider>
  );
};

export default Providers;
