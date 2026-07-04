// ─────────────────────────────────────────────────────────────────────────────
// pdf-engine/constants.ts
// ───────────────────────────────────────────────────────────────────────────
import { PDFTemplateConfigType } from '@/scripts/templatetypes';
import { ResolvedLayout } from './types';
// export const PAGE_WIDTH = 595;
// export const PAGE_HEIGHT = 841;
// export const MARGIN = 50;
// export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// export const DEFAULT_FONT_SIZES: FontSizes = {
//   title: 22,
//   header: 15,
//   subheader: 12,
//   introduction: 11,
//   paragraph: 11,
//   list: 11,
//   conclusion: 11,
//   references: 9,
// };

// export const COLORS = {
//   title: rgb(0.06, 0.06, 0.06),
//   header: rgb(0.1, 0.1, 0.1),
//   subheader: rgb(0.1, 0.35, 0.65),   // Accent blue for subheaders
//   body: rgb(0.15, 0.15, 0.15),
//   muted: rgb(0.45, 0.45, 0.45),
//   divider: rgb(0.88, 0.88, 0.88),
//   listDot: rgb(0.1, 0.35, 0.65),
// };

// // Vertical space injected BEFORE each tag type (in pts)
// export const BLOCK_SPACING: Record<string, number> = {
//   TITLE: 0,
//   HEADER: 18,
//   INTRODUCTION: 14,
//   SUBHEADER: 22,
//   PARAGRAPH: 10,
//   LIST: 5,
//   CONCLUSION: 22,
//   REFERENCES: 22,
// };
export const DEFAULT_MARGIN = 50;
 //Standard page dimensions
 const PAGE_SIZES : Record<"A4" | "LETTER" , [number , number]> = {
    A4 : [595.28, 841.89], 
    LETTER : [612, 792]
 }

 export function resolvedLayout(config: PDFTemplateConfigType): ResolvedLayout{
  const {pageSize, orientation} = config.layout;
  const {width : customW, height : customH} = config.dimensions;

  //The base dimensions
  let [w, h] : [number, number] = pageSize === "CUSTOM"
  ? [customW, customH] : PAGE_SIZES[pageSize]// fallsback to the predetermined layout
  if(orientation === "landscape")[w,h] = [h,w];
  const margin = DEFAULT_MARGIN;
  const contentWidth = w- margin * 2;
  const contentHeight = h- margin * 2;

  return {
    pageWidth : w,
    pageHeight : h,
    margin,
    contentWidth,
    contentHeight

  }
 }

