import { PropsWithChildren } from "react";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import ReactQueryProviderWrapper from "./ReactQueryProviderWrapper";
import { Toaster } from "@/components/ui/sonner";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProviderWrapper>
      <ReactQueryProviderWrapper>
        <Toaster richColors position="bottom-right" />
        {children}
      </ReactQueryProviderWrapper>
    </ThemeProviderWrapper>
  );
};

export default Providers;
