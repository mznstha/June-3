import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ThemeContextType {
  daylightHighContrast: boolean;
  setDaylightHighContrast: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [daylightHighContrast, setDaylightHighContrast] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("daylight_high_contrast");
      return saved === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("daylight_high_contrast", String(daylightHighContrast));
    } catch (e) {}
  }, [daylightHighContrast]);

  return (
    <ThemeContext.Provider value={{ daylightHighContrast, setDaylightHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
