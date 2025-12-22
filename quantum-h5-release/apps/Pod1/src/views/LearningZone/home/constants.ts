import { LzBankKind } from "../../../types/lz";
export const DEFAULT_TYPE = "all";



// Tag颜色映射 - 每个标签包含深色和浅色两个版本
export const TAG_COLOR_MAP = {
  color1: {
    light: 'rgba(213, 227, 255, 1)',
    dark: 'rgba(92, 141, 255, 1)'
  },
  color2: {
    light: 'rgba(141, 129, 253, 0.1)',
    dark: 'rgba(141, 129, 253, 1)'
  },
  color3: {
    light: 'rgba(179, 115, 245, 0.2)',
    dark: 'rgba(179, 115, 245, 1)'
  },
   color4: {
    light: 'rgba(208, 106, 214, 0.1)',
    dark: 'rgba(208, 106, 214, 1)'
  },
} as const;

