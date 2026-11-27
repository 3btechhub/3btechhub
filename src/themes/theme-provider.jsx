import React, { createContext, useContext, useEffect, useState } from "react";
import { watchColorScheme } from "../components/device-preference-collector/index.js";
const ThemeContext = createContext({ variant: "light" });
export function ThemeProvider({ children }) {
  const [variant, setVariant] = useState("light");
  useEffect(() => watchColorScheme(setVariant), []);
  return <ThemeContext.Provider value={{ family: "Classic", variant }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);