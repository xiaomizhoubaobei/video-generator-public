"use client";

import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isOutsideDeployMode } from "@/utils/302";
import { isAuthPath } from "@/utils/path";
import ChatToggler from "./chat-toggler";
import { GithubHyperlink } from "./github-hyperlink";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { ToolInfo } from "./tool-info";

interface HeaderProps {
  className?: string;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(({ className }, ref) => {
  const pathname = usePathname();
  return (
    <header
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur",
        className,
      )}
    >
      <div
        ref={ref}
        className={cn(
          "fixed top-0 right-0 z-50 flex items-center justify-end gap-2 p-2",
          className,
        )}
      >
        <GithubHyperlink />
        {!isAuthPath(pathname) && !isOutsideDeployMode() && <ToolInfo />}
        <ChatToggler />
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </header>
  );
});

Header.displayName = "AppHeader";

export default Header;
