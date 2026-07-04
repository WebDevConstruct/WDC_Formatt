// ─────────────────────────────────────────────────────────────────────────────
// pdf-engine/utils.ts
// ─────────────────────────────────────────────────────────────────────────────

import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';
import { FontSet } from './types';

// ── Font Loader ──────────────────────────────────────────────────────────────
export async function loadFonts(pdfDoc: PDFDocument): Promise<FontSet> {
  return {
    serifBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    sansRegular: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    sansBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
  };
}

// ── Text Sanitizer ───────────────────────────────────────────────────────────
export function deepSanitize<T>(data: T): T {
  if (typeof data === 'string') {
    return (data
      .replace(/[\r\n\u000a\u000d]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/₦/g, 'NGN')
      .trim()) as unknown as T;
  }
  if (Array.isArray(data)) return data.map(deepSanitize) as unknown as T;
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, deepSanitize(v)])
    ) as unknown as T;
  }
  return data;
}

// ── Word Wrapper ─────────────────────────────────────────────────────────────
