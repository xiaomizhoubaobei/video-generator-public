"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface AppThemeProps {
  children: ReactNode;
  theme: string;
}

const AppTheme = ({ children, theme }: AppThemeProps) => {
  return (
    <NextThemesProvider defaultTheme={theme} attribute="class">
      {children}
    </NextThemesProvider>
  );
};

export default AppTheme;
