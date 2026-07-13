import {StandardFonts, PDFDocument} from "pdf-lib";
import { FontSizes
 } from "./types";
 import { PDFPlaceholder } from "@/scripts/templatetypes";
 import {PDFFont} from "pdf-lib"; 
/**
 * Derives FontSizes from the template's placeholders array.
 * Maps varName → FontSizes key. Falls back to DEFAULT_FONT_SIZES
 * for any varName not present in the placeholders.
 *
 * varName mapping:
 *   assignment_title              → title
 *   intro_title | body_title |
 *   concl_title                  → subheader
 *   intro_content | body_content |
 *   concl_content                → paragraph
 *   lists                        → list
 *   reference                    → references
 *   student_name | recipientName → header
 * **/
export async function loadFonts(pdfDoc : PDFDocument){
    return{
        serifBold : await pdfDoc.embedFont(StandardFonts?.TimesRomanBold),
        sansRegular : await pdfDoc?.embedFont(StandardFonts?.TimesRoman),
        sansBold : await pdfDoc?.embedFont(StandardFonts?.TimesRomanBold)
    }
}

export function deepSanitize<T>(data: T): T{
    if(typeof data === "string"){
        return data?.replace(/[\r\n\u000a\u000d]+/g, "")
        .replace(/\s+/g, ' ')                // Normalizes multiple spaces
      .trim() as T;
    } 
    if(Array?.isArray(data)){
        return data?.map(deepSanitize) as T
    }
    if(typeof data === "object" && data !== null){
        return Object?.fromEntries(
    Object?.entries(data)?.map(([key, value])=> [key, deepSanitize(value)])
)  as T  }
return data;
}


export function extractFontSizes(placeholder: PDFPlaceholder[]): FontSizes {
const withSize = (p : PDFPlaceholder): p is PDFPlaceholder & {fontSize : number}=> p.fontSize != null;
    const lookup = new Map<string, number>(placeholder?.filter(withSize).map((p)=> [p.varName, p.fontSize]));
   // console.log(lookup);
    const pick = (...varNames : string[]): number | undefined => {
        for(const name of varNames){
        
            const size = lookup.get(name);
            if(size != null) return size;
        }
        return undefined;
    }
return{
    title : pick("assignment_title") ?? 0,
    header : pick("intro_title") ?? 0,
    subheader : pick( "body_title", "concl_title") ?? 0,
    introduction : pick("intro_title") ?? 0,
    paragraph : pick("body_content", "intro_content") ?? 0,
    list : pick("lists") ?? 0,
    conclusion : pick("concl_content") ?? 0,
    references : pick("references") ?? 0




}
}

export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): string[] {
  if (!text?.trim()) return [];

  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

//ADDING A  STYLED TEXT FUNCTION TO HANDLE BOLD MARKERS
export function wrapStyledText(
  styledText: string,
  maxWidth: number,
  regularFont: PDFFont,
  boldFont: PDFFont,
  fontSize: number
): string[] {
  // No markers present — skip tokenizing and fall straight through
  // to standard word-wrap using the regular font only
  if (!styledText.includes('[[')) {
    return wrapText(styledText, maxWidth, regularFont, fontSize);
  }

  const tokens = styledText.split(/(\[\[.+?\]\])|\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine  = '';
  let currentWidth = 0;

  for (const token of tokens) {
    const isSpan     = token.startsWith('[[') && token.endsWith(']]');
    const plainToken = isSpan ? token.slice(2, -2) : token;
    const font       = isSpan ? boldFont : regularFont;
    const tokenWidth = font.widthOfTextAtSize(plainToken, fontSize);
    const spaceWidth = regularFont.widthOfTextAtSize(' ', fontSize);
    const widthToAdd = currentLine ? spaceWidth + tokenWidth : tokenWidth;

    if (currentLine && currentWidth + widthToAdd > maxWidth) {
      lines.push(currentLine);
      currentLine  = token;
      currentWidth = tokenWidth;
    } else {
      currentLine  = currentLine ? `${currentLine} ${token}` : token;
      currentWidth += widthToAdd;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}


