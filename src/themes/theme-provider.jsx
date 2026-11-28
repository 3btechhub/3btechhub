import React,{createContext,useContext,useEffect,useState} from "react";
import { watchColorScheme } from "../components/device-preference-collector/index.js";
const ThemeContext=createContext({variant:"light"});
export function ThemeProvider({children}) {
  const [variant,setVariant]=useState("light");
  useEffect(()=>watchColorScheme(setVariant),[]);
  useEffect(()=>{document.documentElement.dataset.theme=variant;},[variant]);
  return <ThemeContext.Provider value={{variant}}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
