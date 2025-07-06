"use client";
import * as React from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // On mount, check system or saved preference
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center gap-2 px-2 py-1 rounded-md border border-input bg-background hover:bg-muted transition-colors"
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? <Moon className="h-5 w-5 text-yellow-400" /> : <Sun className="h-5 w-5 text-orange-400" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
} 