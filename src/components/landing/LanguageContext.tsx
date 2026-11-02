"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LandingLanguage = "lo" | "th" | "en";

export const landingLanguages = [
  { code: "lo" as const, name: "ລາວ", flag: "🇱🇦" },
  { code: "th" as const, name: "ไทย", flag: "🇹🇭" },
  { code: "en" as const, name: "English", flag: "🇺🇸" },
];

type LandingLanguageContextValue = {
  language: LandingLanguage;
  setLanguage: (language: LandingLanguage) => void;
};

const LandingLanguageContext = createContext<LandingLanguageContextValue | null>(null);

export function LandingLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LandingLanguage>("lo");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("saizup_landing_language");
    if (savedLanguage === "lo" || savedLanguage === "th" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: LandingLanguage) => {
        setLanguage(nextLanguage);
        window.localStorage.setItem("saizup_landing_language", nextLanguage);
      },
    }),
    [language]
  );

  return <LandingLanguageContext.Provider value={value}>{children}</LandingLanguageContext.Provider>;
}

export function useLandingLanguage() {
  const context = useContext(LandingLanguageContext);
  if (!context) throw new Error("useLandingLanguage must be used inside LandingLanguageProvider");
  return context;
}
