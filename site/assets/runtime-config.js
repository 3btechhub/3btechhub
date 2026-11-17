const THEME_VARIABLES = Object.freeze({
  page_bg: "--page-bg",
  page_text: "--page-text",
  surface: "--surface",
  line: "--line",
  muted: "--muted",
  hover: "--hover",
  primary: "--primary"
});

const LAYOUT_VARIABLES = Object.freeze({
  content_max_width: "--content-max-width",
  header_min_height: "--header-min-height",
  footer_min_height: "--footer-min-height"
});

const COLOR_KEYS = new Set(Object.keys(THEME_VARIABLES));

const PALETTE_PRESETS = Object.freeze({
  white: {
    light: {page_bg:"#ffffff",page_text:"#111111",surface:"#ffffff",line:"#e5e5e5",muted:"#666666",hover:"#f3f3f3",primary:"#111111"},
    dark: {page_bg:"#111111",page_text:"#f5f5f5",surface:"#1b1b1b",line:"#333333",muted:"#aaaaaa",hover:"#292929",primary:"#f5f5f5"}
  },
  black: {
    light: {page_bg:"#111111",page_text:"#f5f5f5",surface:"#1b1b1b",line:"#333333",muted:"#aaaaaa",hover:"#292929",primary:"#f5f5f5"},
    dark: {page_bg:"#080808",page_text:"#ffffff",surface:"#141414",line:"#303030",muted:"#aaaaaa",hover:"#242424",primary:"#ffffff"}
  },
  "neutral-gray": {
    light: {page_bg:"#f2f2f2",page_text:"#222222",surface:"#ffffff",line:"#d6d6d6",muted:"#666666",hover:"#e8e8e8",primary:"#333333"},
    dark: {page_bg:"#202020",page_text:"#eeeeee",surface:"#292929",line:"#444444",muted:"#aaaaaa",hover:"#353535",primary:"#eeeeee"}
  }
});

const SIZE_PRESETS = Object.freeze({
  small: {small:"11px",medium:"14px",large:"clamp(22px,2.8vw,30px)",control:"36px",typeCard:"12px",itemCard:"8px",cardGap:"8px"},
  medium: {small:"12px",medium:"15px",large:"clamp(24px,3vw,34px)",control:"42px",typeCard:"16px",itemCard:"12px",cardGap:"10px"},
  large: {small:"13px",medium:"16px",large:"clamp(26px,3.4vw,38px)",control:"48px",typeCard:"20px",itemCard:"16px",cardGap:"12px"}
});

function isMonochromeHex(value) {
  if (typeof value !== "string" || !/^#[0-9a-f]{3,8}$/i.test(value)) return false;
  let hex = value.slice(1);
  if (hex.length === 3 || hex.length === 4) hex = [...hex.slice(0, 3)].map(char => char + char).join("");
  else hex = hex.slice(0, 6);
  return hex.slice(0, 2) === hex.slice(2, 4) && hex.slice(2, 4) === hex.slice(4, 6);
}
const LENGTH_KEYS = new Set(Object.keys(LAYOUT_VARIABLES));

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isSafeRuntimeValue(key, value) {
  if (typeof value !== "string" || value.length > 160) return false;
  if (/[;{}<>\\]|url\s*\(|expression\s*\(|javascript:/i.test(value)) return false;

  if (COLOR_KEYS.has(key)) {
    return isMonochromeHex(value);
  }

  if (LENGTH_KEYS.has(key)) {
    return /^(?:0|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|vw|vh|%))$/i.test(value);
  }

  if (key === "font_family") {
    return /^[a-z0-9 ,"'_-]+$/i.test(value);
  }

  return false;
}

export function applyRuntimeConfig(config, theme = "light", root = document.documentElement) {
  if (!root?.style || !isPlainObject(config)) return 0;

  let applied = 0;
  const selectedTheme = theme === "dark" ? "dark" : "light";
  const tokens = config.themes?.[selectedTheme];

  if (isPlainObject(tokens)) {
    for (const [key, cssVariable] of Object.entries(THEME_VARIABLES)) {
      const value = tokens[key];
      if (!isSafeRuntimeValue(key, value)) continue;
      root.style.setProperty(cssVariable, value);
      applied += 1;
    }
    if (isSafeRuntimeValue("font_family", tokens.font_family)) {
      root.style.setProperty("--font-family", tokens.font_family);
      applied += 1;
    }
  }

  if (config.direction === "ltr" || config.direction === "rtl") {
    root.dir = config.direction;
    applied += 1;
  }

  const palette = PALETTE_PRESETS[config.palette]?.[selectedTheme];
  if (palette) {
    for (const [key, cssVariable] of Object.entries(THEME_VARIABLES)) {
      root.style.setProperty(cssVariable, palette[key]);
      applied += 1;
    }
  }

  const size = SIZE_PRESETS[config.size];
  if (size) {
    root.style.setProperty("--text-small", size.small);
    root.style.setProperty("--text-medium", size.medium);
    root.style.setProperty("--text-large", size.large);
    root.style.setProperty("--control-height", size.control);
    root.style.setProperty("--card-type-padding", size.typeCard);
    root.style.setProperty("--card-item-padding", size.itemCard);
    root.style.setProperty("--card-gap", size.cardGap);
    applied += 7;
  }

  if (isPlainObject(config.layout)) {
    for (const [key, cssVariable] of Object.entries(LAYOUT_VARIABLES)) {
      const value = config.layout[key];
      if (!isSafeRuntimeValue(key, value)) continue;
      root.style.setProperty(cssVariable, value);
      applied += 1;
    }
  }

  return applied;
}

export async function loadRuntimeConfig(client) {
  if (!client?.from) return null;
  try {
    const { data, error } = await client
      .from("Settings")
      .select("setting_value")
      .eq("setting_key", "runtime_config")
      
      .maybeSingle();

    if (error || !isPlainObject(data?.setting_value)) return null;
    if (data.setting_value.schema_version !== 1) return null;
    return data.setting_value;
  } catch {
    return null;
  }
}
