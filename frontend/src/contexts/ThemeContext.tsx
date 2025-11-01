import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  bannerColor: string;
  landingBgColor: string;
  setBannerColor: (color: string) => void;
  setLandingBgColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_BANNER_COLOR = 'from-blue-600 via-indigo-600 to-purple-600';
const DEFAULT_LANDING_BG_COLOR = 'from-blue-900 via-indigo-800 to-purple-900';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [bannerColor, setBannerColorState] = useState<string>(() => {
    const saved = localStorage.getItem('skillsconnect:bannerColor');
    return saved || DEFAULT_BANNER_COLOR;
  });

  const [landingBgColor, setLandingBgColorState] = useState<string>(() => {
    const saved = localStorage.getItem('skillsconnect:landingBgColor');
    return saved || DEFAULT_LANDING_BG_COLOR;
  });

  const setBannerColor = (color: string) => {
    setBannerColorState(color);
    localStorage.setItem('skillsconnect:bannerColor', color);
  };

  const setLandingBgColor = (color: string) => {
    setLandingBgColorState(color);
    localStorage.setItem('skillsconnect:landingBgColor', color);
  };

  useEffect(() => {
    localStorage.setItem('skillsconnect:bannerColor', bannerColor);
  }, [bannerColor]);

  useEffect(() => {
    localStorage.setItem('skillsconnect:landingBgColor', landingBgColor);
  }, [landingBgColor]);

  return (
    <ThemeContext.Provider value={{ bannerColor, landingBgColor, setBannerColor, setLandingBgColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
