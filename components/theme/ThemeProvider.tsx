"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  Icon: React.ElementType; // Icon for the current opposite theme
}

// Defaulting to light theme to match server-side rendering
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // CRITICAL FIX: Always initialize as 'light' to match Server-Side Rendering (SSR).
  // If we check localStorage here directly, it causes the hydration mismatch error.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Effect to sync with localStorage only AFTER the component has mounted on the client
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as Theme;

    if (storedTheme) {
      setTheme(storedTheme);
      // Apply the class immediately to avoid transition delays on load
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  // Effect to update DOM and localStorage whenever theme state changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Determine which icon to show.
  // During SSR and first client render, this will be 'Moon' (switch to dark), matching 'light' theme.
  // After mount, if user is dark, it flips to 'Sun' (switch to light).
  const Icon = theme === "light" ? Moon : Sun;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, Icon }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
