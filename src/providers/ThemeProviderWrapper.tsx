"use client";
import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";

const ThemeProviderWrapper = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
