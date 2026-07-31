// ─────────────────────────────────────────────────────────────────────────────
// pdf-engine/compile.ts  (updated — driven by studentDataType from parseChunk)
// ─────────────────────────────────────────────────────────────────────────────

import { PDFDocument } from 'pdf-lib';
import {
PDFTemplateConfigFontType,
  RenderState,
  StudentDataType,
} from './types';
import { DocumentSegment,  } from '@/app/dashboard/Files/quick_assessment/assignment/page';
import { deepSanitize, loadFonts } from './pdf-utils';
import { renderCoverPage, renderToken } from './renderer';
import {PDFTemplateConfigType, additionalHeaders} from "@/scripts/templatetypes";
import {FontSizes} from "@/lib/utils/pdf-engine/types";
import {resolvedLayout} from "../../utils/pdf-engine/constant";
import { extractFontSizes } from './pdf-utils';
import {StandardFonts} from "pdf-lib";
import {LetterDataConfigType} from "@/lib/pdfEngine";

export async function compilePDF(
  template: PDFTemplateConfigType,
  studentData: StudentDataType,
  additionalHeaders: additionalHeaders[] = []
): Promise<Uint8Array> {
  // 1. Bootstrap
  //1. Resolve layout + extract font sizes - 
//console.log(resolvedLayout(template))
const layout = resolvedLayout(template);
 
const sizes = extractFontSizes(template?.placeholders);
//console.log(sizes);
const {pageWidth, pageHeight, margin} = layout
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadFonts(pdfDoc);
 //console.log(deepSanitize(studentData));
  const clean = deepSanitize(studentData) as StudentDataType;
const coverPage = pdfDoc.addPage([pageWidth, pageHeight])
//if(!clean) return;
  // 2. Shared render state — single source of truth for page + Y position
  const state: RenderState = {
    doc: pdfDoc,
    page: coverPage,
    y: pageHeight - margin,
    listIndex: 1,
    pageWidth,
    pageHeight,
    margin
  };

  // 3. Cover page
  renderCoverPage(state, fonts, clean, additionalHeaders, layout);

  // 4. Fresh content page after cover
  state.page = pdfDoc.addPage([pageWidth, pageHeight]);
  state.y = pageHeight - margin;

  // 5. Build render queue directly from parseChunk's studentDataType output
  const queue: DocumentSegment[] = [
    // Header + Introduction
    ...(clean.intro_title
      ? [{ id: 'header', role: 'header' as const, content: clean.intro_title, index: -2 }]
      : []),
    ...(clean.intro_content
      ? [{ id: 'intro', role: 'paragraph' as const, content: clean.intro_content, index: -1 }]
      : []),

    // Body (subheaders, paragraphs, lists — already ordered by parseChunk)
    ...(clean.body_content ?? []),

    // Conclusion blocks
    ...(clean.concl_content ?? []),

    // References as a single block
    ...(clean.references?.trim()
      ? [{ id: 'refs', role: 'reference' as const, content: clean.references, index: Infinity }]
      : []),
  ];
 

  if (!queue.length) {
    throw new Error(
      '[Formatt PDF Engine] Render queue is empty. ' +
      'Ensure parseChunk has processed the AI output before compilePDF is called.'
    );
  }

  // 6. Sequential render loop — renderer handles pagination internally
  for (const block of queue) {
    if (!block.content?.trim()) continue;

    // Reset list counter at every new subheader (mirrors parseChunk behaviour)
    if (block.role === 'subheader') state.listIndex = 1;

    renderToken(block, state, fonts, sizes, layout);

    if (block.role === 'lists') state.listIndex++;
  }
 
  

  return pdfDoc.save();
}


//THE COMPILE LETTER PDF
// ============================================================
// 1) ADD THESE FIELDS TO LetterDataConfigType (in your types file)
// ============================================================
//
// export interface LetterDataConfigType {
//   ...existing fields (sender_name, recipient_name, letter_title,
//      salutation, content, templateName, phone, email, address, conclusion)...
//
//   date?: string;                     // user-supplied date (ISO string from <input type="date">)
//   addressAlignment?: "left" | "right"; // sender block alignment — "left" is recommended
//   senderAdditionalInfo?: string;
//   recipientAddress?: string;
//   recipientPosition?: string;
//   recipientOrganization?: string;
//   recipientAdditionalInfo?: string;
// }

// ============================================================
// 2) compileLetterPDF — rewritten
// ============================================================
export async function compileLetterPDF(letterData: LetterDataConfigType) {
  const pdfDoc = await PDFDocument.create();

  // No italic font embedded — this document is strictly formal, no slanted text anywhere.
  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    bold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
  };

  const PAGE_WIDTH = 595;  // A4 Standard Dimensions
  const PAGE_HEIGHT = 841;
  const marginX = 54;      // Professional 0.75-inch margins
  const maxTextWidth = PAGE_WIDTH - (marginX * 2);

  let currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = 750;

  type Align = "left" | "right";

  const ensureSpace = () => {
    if (cursorY < marginX) {
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = 780;
    }
  };

  // --- Single line, left or right aligned, with page-break protection ---
  const drawLine = (text: string, font: any, size: number, align: Align = "left") => {
    if (!text) return;
    ensureSpace();
    const width = font.widthOfTextAtSize(text, size);
    const x = align === "right" ? PAGE_WIDTH - marginX - width : marginX;
    currentPage.drawText(text, { x, y: cursorY, size, font });
    cursorY -= (size + 4);
  };

  // --- A block of text split on \n, each line word-wrapped and aligned the same way.
  //     Used for addresses and "additional info" fields, where every \n is an
  //     intentional line break rather than a paragraph to reflow. ---
  const drawLines = (text: string, font: any, size: number, align: Align = "left") => {
    if (!text) return;
    const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    rawLines.forEach((line) => {
      const words = line.split(' ');
      let current = '';

      words.forEach((word) => {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, size) > maxTextWidth) {
          drawLine(current, font, size, align);
          current = word;
        } else {
          current = test;
        }
      });
      if (current) drawLine(current, font, size, align);
    });
  };

  // --- A single line built from multiple font/size runs, e.g. a bold
  //     label followed by a regular value ("Phone: " + "0800 000 0000").
  //     Measures total width up front so right-alignment stays accurate. ---
  const drawMixedLine = (
    parts: { text: string; font: any; size: number }[],
    align: Align = "left"
  ) => {
    if (!parts.length) return;
    ensureSpace();
    const totalWidth = parts.reduce((w, p) => w + p.font.widthOfTextAtSize(p.text, p.size), 0);
    let x = align === "right" ? PAGE_WIDTH - marginX - totalWidth : marginX;

    parts.forEach((p) => {
      currentPage.drawText(p.text, { x, y: cursorY, size: p.size, font: p.font });
      x += p.font.widthOfTextAtSize(p.text, p.size);
    });

    const maxSize = Math.max(...parts.map((p) => p.size));
    cursorY -= (maxSize + 4);
  };

  // --- Convenience wrapper for "Label: value" lines ---
  const drawLabeledLine = ( value: string, size = 10, align: Align = "left") => {
    if (!value) return;
    drawMixedLine(
      [
        { text: value, font: fonts.regular, size },
      ],
      align
    );
  };

  // --- Word-wrapping paragraph renderer for the letter's body content
  //     (introduction / paragraph / conclusion segments). Honors explicit
  //     \n breaks as paragraph breaks and reflows long lines. ---
  const renderTextBlock = (text: string, size: number, font: any, lineSpacing: number) => {
    if (!text) return;

    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === '') {
        cursorY -= (lineSpacing * 0.5);
        return;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, size);

        if (width > maxTextWidth) {
          ensureSpace();
          currentPage.drawText(currentLine, { x: marginX, y: cursorY, size, font });
          cursorY -= lineSpacing;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        ensureSpace();
        currentPage.drawText(currentLine, { x: marginX, y: cursorY, size, font });
        cursorY -= lineSpacing;
      }
      cursorY -= 6; // Compact block padding for sleek corporate letter layouts
    });
  };

  // =================================================================
  // --- SECTION 1: SENDER BLOCK ---
  // Aligned per letterData.addressAlignment ("left" is recommended,
  // "right" is the traditional formal-letter placement).
  // =================================================================
  const senderAlign: Align = letterData.addressAlignment === "right" ? "right" : "left";

  drawLine(letterData.sender_name, fonts.bold, 11, senderAlign);
  drawLines(letterData.address, fonts.regular, 10, senderAlign);
  if (letterData.phone) drawLabeledLine( letterData.phone, 10, senderAlign);
  if (letterData.email) drawLabeledLine(letterData.email, 10, senderAlign);
  if (letterData.senderAdditionalInfo) {
  //  drawLines(letterData.senderAdditionalInfo, fonts.regular, 10, senderAlign);
  }

  // Date — uses the user-supplied date if present, otherwise today.
  const dateText = letterData.date
    ? new Date(letterData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  cursorY -= 10;
  drawLine(dateText, fonts.regular, 11, senderAlign);

  cursorY -= 20;

  // =================================================================
  // --- SECTION 2: RECIPIENT BLOCK (always left-aligned) ---
  // =================================================================
  drawLine(letterData.recipient_name, fonts.bold, 12, "left");
  if (letterData.recipientPosition) drawLine(letterData.recipientPosition, fonts.regular, 12, "left");
  if (letterData.recipientOrganization) drawLine(letterData.recipientOrganization, fonts.regular, 12, "left");
  if (letterData.recipientAddress) drawLines(letterData.recipientAddress, fonts.regular, 12, "left");
  if (letterData.recipientAdditionalInfo) {
    drawLines(letterData.recipientAdditionalInfo, fonts.regular, 12, "left");
  }

  cursorY -= 20;

  // =================================================================
  // --- SECTION 3: SALUTATION ---
  // =================================================================
  drawLine(letterData.salutation, fonts.regular, 14, "left");
  cursorY -= 14;

  // =================================================================
  // --- SECTION 4: SEQUENTIAL CONTENT STREAM PARSING ---
  // =================================================================
  const sortedContent =
    [...letterData.content].sort((a, b) => a.index - b.index) ||
    [{ id: 'default', role: 'paragraph', content: '', index: 0 }];

  sortedContent.forEach((segment) => {
    switch (segment.role) {
      case 'header': {
        // The letter's topic — always uppercase, always underlined.
        cursorY -= 4;
        const subjectText = `${segment.content.toUpperCase()}`;
        renderTextBlock(subjectText, 16, fonts.bold, 18);

        cursorY -= 2;
        const textWidth = fonts.bold.widthOfTextAtSize(subjectText, 11);
        ensureSpace();
        currentPage.drawLine({
          start: { x: marginX, y: cursorY },
          end: { x: marginX + textWidth , y: cursorY },
          thickness: 1,
        });
        cursorY -= 20;
        break;
      }

      case 'introduction':
      case 'paragraph':
      case 'conclusion':
        renderTextBlock(segment.content, 14, fonts.regular, 18);
        cursorY -= 8;
        break;

      case 'sign-off':
        cursorY -= 24;
        renderTextBlock(segment.content, 14, fonts.regular, 18);
        break;

      default:
        renderTextBlock(segment.content, 14, fonts.regular, 18);
        cursorY -= 8;
    }
  });

  return await pdfDoc.save();
}