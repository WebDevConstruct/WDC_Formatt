// ─────────────────────────────────────────────────────────────────────────────
// pdf-engine/renderer.ts  (role mapping updated to match BodyBlock roles)
// ─────────────────────────────────────────────────────────────────────────────

import { PDFFont, PDFPage, rgb } from 'pdf-lib';
import {  FontSet, FontSizes, RenderState } from './types';
import {DocumentSegment} from '@/app/dashboard/Files/quick_assessment/assignment/page'; 
import { wrapText, wrapStyledText } from './pdf-utils';
import { PDFTemplateConfigType } from '@/scripts/templatetypes';
import { ResolvedLayout } from './types';
import { LayoutDashboard } from 'lucide-react';
import {PDFPlaceholder} from "@/scripts/templatetypes";






//TESTING ENGINE FOR THE PDF GENERATION
/**
 * Pre-block space injected ABOVE each role before any drawing occurs.
 * Larger values signal stronger hierarchy breaks to the reader.
 *
 *   subheader  → 26pt  16pt bold heading needs clear air above it
 *   paragraph  → 10pt  modest gap keeps consecutive paragraphs breathable
 *   lists      →  6pt  items are a visual unit — stay grouped
 *   conclusion → 32pt  strongest break — major document transition
 *   reference  → 32pt  same weight as conclusion
 */
const PRE_BLOCK: Record<string, number> = {
  header : 0,
  subheader:  26,
  paragraph:  10,
  lists:       6,
  conclusion: 32,
  reference:  32,
};

/**
 * Gap injected AFTER a subheader label and BEFORE its first paragraph.
 * Smaller than PRE_BLOCK so heading + body read as a paired unit.
 */
const POST_SUBHEADER_GAP = 6;

/**
 * Line height ratio — 1.45× is the professional standard for 12–16pt copy.
 *   12pt → ~17.4pt line height (intro / lists)
 *   14pt → ~20.3pt line height (body / conclusion)
 *   16pt → ~23.2pt line height (subheaders)
 *   22pt → ~31.9pt line height (cover title)
 */
const LH_RATIO = 1.45;

function lh(fontSize: number): number {
  return Math.ceil(fontSize * LH_RATIO);
}


/**
 * Simpler and more reliable approach:
 * Wrap the plain text to get line break positions (word boundaries),
 * then re-walk the STYLED source word by word, rebuilding each line
 * with [[markers]] intact.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function addPage(state: RenderState, layout: ResolvedLayout): void {
  state.page = state.doc.addPage([layout.pageWidth, layout.pageHeight]);
  state.y    = layout.pageHeight - layout.margin;
}

function ensureSpace(state: RenderState, needed: number, layout: ResolvedLayout): void {
  if (state.y - needed < layout.margin) addPage(state, layout);
}

function drawDivider(state: RenderState, layout: ResolvedLayout): void {
  ensureSpace(state, 20, layout);
  state.page.drawLine({
    start: { x: layout.margin,                    y: state.y },
    end:   { x: layout.pageWidth - layout.margin, y: state.y },
    thickness: 0.4,
    color: rgb(0.72, 0.72, 0.72),
  });
  state.y -= 16; // clearance between rule and the section label below
}

function drawLines(
  state: RenderState,
  lines: string[],
  font: PDFFont,
  fontSize: number,
  color: ReturnType<typeof rgb>,
  indent = 0,
  layout: ResolvedLayout,
  fonts : FontSet
): void {
  const lineHeight = lh(fontSize);
  for (const line of lines) {
    ensureSpace(state, lineHeight, layout);
    if (fonts && line.includes('[[')) {
      drawMixedLine(state, line, fonts, fontSize, color, layout, indent);
    } else {
      state.page.drawText(stripBold(line), {
        x:    layout.margin + indent,
        y:    state.y - fontSize,
        size: fontSize,
        font,
        color,
      });
    }
    state.y -= lineHeight;
  }
}

function drawCentered(
  page: PDFPage,
  text: string,
  font: PDFFont,
  fontSize: number,
  y: number,
  layout: ResolvedLayout
): number {
  const { contentWidth } = layout;
  const lines      = wrapText(text, contentWidth, font, fontSize);
  const lineHeight = lh(fontSize); // ← was fontSize + 6, now ratio-based
  for (const line of lines) {
    const w = font.widthOfTextAtSize(line, fontSize);
    page.drawText(line, {
      x:    (layout.pageWidth - w) / 2,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }
  return y;  // ← removed the hardcoded - 20; caller controls row gap via ROW_GAP
}

// ── Inline content resolvers ──────────────────────────────────────────────────

/**
 * Strips [[...]] markers and returns the plain text.
 * Used for measuring and wrapping — bold is applied at draw time.
 */
function stripBold(text: string): string {
  return text.replace(/\[\[(.+?)\]\]/g, '$1');
}

/**
 * Splits a line into segments: { text, bold } pairs.
 * Renderer iterates these and switches font per segment.
 */
interface TextSegment { text: string; bold: boolean; }

function parseBoldSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\[\[(.+?)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), bold: false });
  }
  return segments;
}

/**
 * Draws a single line of mixed bold/regular text from left to right.
 * Returns the total width drawn (useful for underlines if needed).
 */
function drawMixedLine(
  state: RenderState,
  rawLine: string,
  fonts: FontSet,
  fontSize: number,
  color: ReturnType<typeof rgb>,
  layout: ResolvedLayout,
  indent = 0
): void {
  const segments = parseBoldSegments(rawLine);
  let cursorX    = layout.margin + indent;

  for (const seg of segments) {
    const font = seg.bold ? fonts.sansBold : fonts.sansRegular;
    state.page.drawText(seg.text, {
      x:    cursorX,
      y:    state.y - fontSize,
      size: fontSize,
      font,
      color,
    });
    cursorX += font.widthOfTextAtSize(seg.text, fontSize);
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// Token Renderer
// ─────────────────────────────────────────────────────────────────────────────

export function renderToken(
  block: DocumentSegment,
  state: RenderState,
  fonts: FontSet,
  sizes: FontSizes,
  layout: ResolvedLayout
): void {
  const { role, content } = block;
  if (!content?.trim()) return;

  const { contentWidth } = layout;

  // Role-aware pre-block spacing (replaces the flat -= 10)
  state.y -= PRE_BLOCK[role] ?? 10;

  switch (role) {
 case 'header': {
  const lines      = wrapText(content, layout.contentWidth, fonts.sansBold, sizes.header);
  const lineHeight = lh(sizes.header);

  for (const line of lines) {
    ensureSpace(state, lineHeight, layout);

    const w = fonts.sansBold.widthOfTextAtSize(line, sizes.header);
    const x = (layout.pageWidth - w) / 2;

    state.page.drawText(line, {
      x,
      y:    state.y - sizes.header,
      size: sizes.header,
      font: fonts.sansBold,
      color: rgb(0, 0, 0),
    });

    // Underline hugs the text width, centered with the text
    state.page.drawLine({
      start:     { x,        y: state.y - sizes.header - 2 },
      end:       { x: x + w, y: state.y - sizes.header - 2 },
      thickness: 0.6,
      color:     rgb(0, 0, 0),
    });

    state.y -= lineHeight;
  }

  // Breathing room then a full-width divider below the header
  state.y -= 8;

  break;
}

  // Divider below the header to separate it from intro paragraph
  
    case 'subheader': {
      ensureSpace(state, lh(sizes.subheader) + POST_SUBHEADER_GAP, layout);
      const lines = wrapText(content, contentWidth, fonts.sansBold, sizes.subheader);
      drawLines(state, lines, fonts.sansBold, sizes.subheader, rgb(0, 0, 0), 0, layout, fonts);
      state.y -= POST_SUBHEADER_GAP; // tight coupling between heading and its paragraph
      break;
    }

    case 'paragraph': {
    const styledLines = wrapStyledText(content, contentWidth, fonts.sansRegular, fonts?.sansBold, sizes?.paragraph, )
      drawLines(state, styledLines, fonts.sansRegular, sizes.paragraph, rgb(0.08, 0.08, 0.08), 0, layout, fonts);
      break;
    }

   // ── QUOTE and LIST definition cases in renderToken ────────────────────────────

case 'quote': {
  const [attribution, quoteText] = content.split('|').map(s => s.trim());

  // Left accent bar — visual cue that this is a pull quote
  state.page.drawLine({
    start:     { x: layout.margin,     y: state.y - 4 },
    end:       { x: layout.margin,     y: state.y - lh(sizes.paragraph) * 2 - 4 },
    thickness: 2.5,
    color:     rgb(0.1, 0.1, 0.1),
  });

  const quoteIndent = 14;
  const quoteWidth  = contentWidth - quoteIndent;

  // Quote body — italic weight via sansRegular at slightly smaller size
  const quoteLines = wrapText(`"${quoteText}"`, quoteWidth, fonts.sansRegular, sizes.paragraph);
  drawLines(state, quoteLines, fonts.sansRegular, sizes.paragraph, rgb(0.12, 0.12, 0.12), quoteIndent, layout, fonts);

  // Attribution — muted, smaller
  const attrSize  = sizes.paragraph - 2;
  const attrLines = wrapText(`— ${attribution}`, quoteWidth, fonts.sansBold, attrSize);
  drawLines(state, attrLines, fonts.sansBold, attrSize, rgb(0.4, 0.4, 0.4), quoteIndent, layout, fonts);

  state.y -= 6;
  break;
}

case 'lists': {
  const numberWidth = fonts.sansBold.widthOfTextAtSize(`${state.listIndex}. `, sizes.list);
  const textIndent  = Math.ceil(numberWidth) + 10;
  const textWidth   = contentWidth - textIndent;

  // Definition list: "Term:: explanation" — term is bold, rest is regular
  const isDefinition = content.includes('::');
  let displayContent = content;

  if (isDefinition) {
    const [term, explanation] = content.split('::').map(s => s.trim());
    // Re-encode as inline bold so drawLines handles it uniformly
    displayContent = `[[${stripBold(term)}]]: ${" "} ${explanation}`;
  }

  
  const styledLines = wrapStyledText(displayContent, textWidth, fonts.sansRegular, fonts?.sansBold, sizes?.list, )
  const blockHeight = lh(sizes.list) * styledLines.length;
  ensureSpace(state, blockHeight, layout);

  state.page.drawText(`${state.listIndex}.`, {
    x:    layout.margin,
    y:    state.y - sizes.list,
    size: sizes.list,
    font: fonts.sansBold,
    color: rgb(0, 0, 0),
  });

  // Pass fonts so drawMixedLine can switch bold/regular per segment
  drawLines(state, styledLines, fonts.sansRegular, sizes.list, rgb(0.08, 0.08, 0.08), textIndent, layout, fonts);
  break;
}

    case 'conclusion': {
      drawDivider(state, layout);
      ensureSpace(state, lh(sizes.subheader) + 12, layout);
      state.page.drawText('CONCLUSION', {
        x:    layout.margin,
        y:    state.y - sizes.subheader,
        size: sizes.subheader,
        font: fonts.sansBold,
        color: rgb(0, 0, 0),
      });
      state.y -= sizes.subheader + POST_SUBHEADER_GAP + 6;
      const lines = wrapText(content, contentWidth, fonts.sansRegular, sizes.conclusion);
      drawLines(state, lines, fonts.sansRegular, sizes.conclusion, rgb(0.08, 0.08, 0.08), 0, layout, fonts);
      break;
    }

    case 'reference': {
      drawDivider(state, layout);
      ensureSpace(state, lh(sizes.subheader) + 12, layout);
      state.page.drawText('REFERENCES', {
        x:    layout.margin,
        y:    state.y - sizes.subheader,
        size: sizes.subheader,
        font: fonts.sansBold,
        color: rgb(0, 0, 0),
      });
      state.y -= sizes.subheader + POST_SUBHEADER_GAP + 6;
      const lines = wrapText(content, contentWidth, fonts.sansRegular, sizes.references);
      drawLines(state, lines, fonts.sansRegular, sizes.references, rgb(0.3, 0.3, 0.3), 0, layout, fonts);
      break;
    }
  }
}


//ORIGINAL RENDERING SYSTEM TO HELP DRAWLINES, DRAWTEXTS TO ACT AS ROLES FOR THE PDF GENERATION
// function addPage(state: RenderState, layout : ResolvedLayout): void {
//   state.page = state.doc.addPage([layout?.pageWidth, layout?.pageHeight]);
//   state.y = layout?.pageHeight- layout?.margin;
// }


// function ensureSpace(state: RenderState, needed: number, layout : ResolvedLayout): void {
//   if (state.y - needed < layout?.margin) addPage(state, layout);
// }

// function drawDivider(state: RenderState, layout : ResolvedLayout): void {
//   ensureSpace(state, 12, layout);
//   state.page.drawLine({
//     start: { x: layout?.margin, y: state.y },
//     end: { x: layout?.pageWidth - layout?.margin, y: state.y },
//     thickness: 0.5,
//   //  color: COLORS.divider,
//   });
//   state.y -= 10;
// }

// function drawLines(
//   state: RenderState,
//   lines: string[],
//   font: PDFFont,
//   fontSize: number,
//   color: ReturnType<typeof rgb>,
//   indent = 0,
//   layout : ResolvedLayout
// ): void {
//   const lineHeight = fontSize + 5;
//   for (const line of lines) {
//     ensureSpace(state, lineHeight, layout);
//     state.page.drawText(line, {
//       x: layout?.margin + indent,
//       y: state.y - fontSize,
//       size: fontSize,
//       font,
//       color,
//     });
//     state.y -= lineHeight;
//   }
// }

// function drawCentered(
//   page: PDFPage,
//   text: string,
//   font: PDFFont,
//   fontSize: number,
//   y: number,
//   layout : ResolvedLayout
// ): number {
//     const {contentWidth} = layout
//   const lines = wrapText(text, contentWidth, font, fontSize);
//   const lineHeight = fontSize + 6;
//   for (const line of lines) {
//     const w = font.widthOfTextAtSize(line, fontSize);
//     page.drawText(line, {
//       x: (layout?.pageWidth - w) / 2,
//       y,
//       size: fontSize,
//       font,
//       color: rgb(0,0,0),
//     });
//     y -= lineHeight;
//   }
//   return y - 20;
// }

// // ── Token Renderer — role values match BodyBlock from parseChunk ──────────────
// export function renderToken(
//   block: DocumentSegment,
//   state: RenderState,
//   fonts: FontSet,
//   sizes: FontSizes,
//   layout : ResolvedLayout
// ): void {
//   const { role, content } = block;
//   if (!content?.trim()) return;

//   state.y -=  10;

//   //state.y -= BLOCK_SPACING[role.toUpperCase()] ?? 10;
// const {contentWidth} = layout
//   switch (role) {
  
//     case 'subheader': {
//      // state.listIndex = 1;
//       const lines = wrapText(content, contentWidth, fonts.sansBold, sizes.subheader);
//       drawLines(state, lines, fonts.sansBold, sizes.subheader, rgb(0,0,0), 0, layout);
//       state.y -= 3;
//       break;
//     }

//     case 'paragraph': {
//         const indent = 10
//       const lines = wrapText(content, contentWidth, fonts.sansRegular, sizes.paragraph);
//       drawLines(state, lines, fonts.sansRegular, sizes.paragraph, rgb(0,0,0),  indent,  layout);
//       break;
//     }

//     case 'lists': {
//       const indent = 16;
//       const lines = wrapText(content, contentWidth - indent, fonts.sansRegular, sizes.list);
//       ensureSpace(state, (sizes.list + 5) * lines.length, layout);
      
//       state.page.drawText(`${state.listIndex}. `, {
//         x: layout?.margin,
//         y: state.y - sizes.list,
//         size: sizes.list,
//         font: fonts.sansBold,
//         color: rgb(0,0,0),
//       });
  
//       drawLines(state, lines, fonts.sansRegular, sizes.list, rgb(0,0,0), indent, layout);
//       break;
//     }

//     case 'conclusion': {
//       drawDivider(state, layout);
//       state.page.drawText('CONCLUSION', {
//         x: layout?.margin,
//         y: state.y - sizes.subheader,
//         size: sizes.subheader,
//         font: fonts.sansBold,
//         color: rgb(0,0,0),
//       });
//       state.y -= sizes.subheader + 8;
//       const lines = wrapText(content, contentWidth, fonts.sansRegular, sizes.conclusion);
//       drawLines(state, lines, fonts.sansRegular, sizes.conclusion, rgb(0,0,0), 0, layout);
//       break;
//     }

//     case 'reference': {
//       drawDivider(state, layout);
//       state.page.drawText('REFERENCES', {
//         x: layout?.margin,
//         y: state.y - sizes.subheader,
//         size: sizes.subheader,
//         font: fonts.sansBold,
//         color: rgb(0,0,0),
//       });
//       state.y -= sizes.subheader + 8;
//       const lines = wrapText(content, contentWidth, fonts.sansRegular, sizes.references);
//       drawLines(state, lines, fonts.sansRegular, sizes.references, rgb(0,0,0), 0, layout);
    
//       break;
//     }
  
//   }
//  // state.listIndex++;
// }

// ── Cover Page ─────────────────────────────────────────────────────────────────
export function renderCoverPage(
  state: RenderState,
  fonts: FontSet,
  studentData: { assignment_title?: string; student_name?: string; recipientName?: string },
  additionalHeaders: Array<{ subHeader?: string; paragraph?: string }>,
  layout : ResolvedLayout,

): void {
    const {pageWidth, pageHeight} = layout;
  const coverPage = state.doc.addPage([pageWidth, pageHeight]);
  let y = 580;

  
  const row = (label: string, value?: string) => {
    if (!value?.trim()) return;
    const text = label ? `${label.toUpperCase()} ${value.toUpperCase()}` : value.toUpperCase();
    y = drawCentered(coverPage, text, fonts.serifBold, 20, y, layout);
    y -= 20;
  };

  row(studentData.assignment_title ? 'TOPIC:' : '', studentData.assignment_title);
  row('NAME:', studentData.student_name);
  row(studentData.recipientName ? 'TO:' : '', studentData.recipientName);
  for (const h of additionalHeaders ?? []) {
    row(h.subHeader ? `${h.subHeader}:` : '', h.paragraph);
  }
}