"use client"

import { ThemeProvider, type Attribute } from "next-themes";
import { usePathname } from "next/navigation";
interface ThemeWrapperProps {
  children: React.ReactNode;
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  themes?: string[];
  savedTheme?: string;
}

export function ThemeWrapper({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  themes = ['light', 'dark', 'system'],
  savedTheme
}: ThemeWrapperProps) {
  const pathname = usePathname();
  const isDashboardOrAuth = pathname?.includes('/dash-') ||
    pathname?.includes('/slider') ||
    pathname?.includes('/custom-package-images') ||
    pathname?.includes('/comments') ||
    pathname?.includes('/brands') ||
    pathname?.includes('/auth/mimo') ||
    pathname?.includes('/mimo');

  return (
    <ThemeProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      forcedTheme={isDashboardOrAuth ? "light" : undefined}
      themes={themes}
    >
      {children}
    </ThemeProvider>
  );
}