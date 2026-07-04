import { PDFPlaceholder } from "@/scripts/templatetypes";
import { PDFFont } from "pdf-lib";
import { wrapText } from "./wrapText";
import {PDFDocument, rgb} from "pdf-lib"

// export function renderSingleField(page: any, text: string, config: PDFPlaceholder, fonts: any) {
//   const activeFont = config.isBold ? fonts.bold : fonts.regular;
  
//   // Standard wrapping for intro_content strings
//   const lines = wrapText(text, config.maxWidth, activeFont, config.fontSize);
  
//   let currentY = config.y;
//   lines.forEach(line => {
//     page.drawText(line, {
//       x: config.x,
//       y: currentY,
//       size: config.fontSize,
//       font: activeFont,
//     });
//     currentY -= config.lineHeights;
//   });
// }

// /**
//  * Renders an array of ContentRoles (Body or Conclusion) with relative vertical tracking.
//  * 
//  * @param page - The pdf-lib page object.
//  * @param content - Array of objects (subheaders, paragraphs, lists).
//  * @param startY - The vertical anchor point to begin drawing.
//  * @param x - The horizontal margin (X-coordinate).
//  * @param size - The base font size for paragraphs.
//  * @param fonts - Object containing { regular, bold } PDFFonts.
//  * @returns The final cursorY position for the next section.
//  */

// export async function renderStaticField(
//   pdfDoc: PDFDocument,
//   page: any,
//   content: string,
//   y: number,
//   margin: number,
//   fontSize: number,
//   font: any
// ): Promise<{ page: any; y: number }> {
//   let currentPage = page;
//   let currentY = y;
//   const { width, height } = currentPage.getSize();
//   const maxWidth = width - (margin * 2);
//   const lineSpacing = fontSize + 4;

//   if (!content) return { page: currentPage, y: currentY };

//   const lines = wrapText(content, maxWidth, font, fontSize);
//   for (const line of lines) {
//     // Dynamic Pagination Check
//     if (currentY - lineSpacing < margin) {
//       currentPage = pdfDoc.addPage([width, height]);
//       currentY = height - margin;
//     }
//     currentPage.drawText(line, {
//       x: margin,
//       y: currentY - fontSize,
//       size: fontSize,
//       font,
//       color: rgb(0.15, 0.15, 0.15),
//     });
//     currentY -= lineSpacing;
//   }
//   return { page: currentPage, y: currentY };
// }
//This is for Arrayed item?.varName

//OLD CODE
// export async function renderSequentialFlow(page: any, content: DocumentSegment[], config: PDFPlaceholder, fonts: any) {
//   let cursorY = config.y; // Start at the placeholder's defined Y

//   content.forEach((item) => {
//     const isSubheader = item.role === 'subheader';
//     const isList = item.role === 'lists';
    
//     const activeFont = isSubheader ? fonts.bold : fonts.regular;
//     const activeSize = isSubheader ? config.fontSize + 2 : config.fontSize;
//     const indent = isList ? 15 : 0;

//     // Apply "Institutional Breathing Room" before subheaders
//     if (isSubheader) cursorY -= 12;

//     const lines = wrapText(item.content, config.maxWidth - indent, activeFont, activeSize);

//     lines.forEach(line => {
//       page.drawText(line, {
//         x: config.x + indent,
//         y: cursorY,
//         size: activeSize,
//         font: activeFont,
//       });
//       cursorY -= config.lineHeights;
//     });

//     // Small gap after every block
//     cursorY -= 6;
//   });
// }
// Parses sequential item arrays, capturing subheaders to apply measured underlining
 
const BASELINE = 12; // Base font size
const LINE_HEIGHT = BASELINE * 1.4;
// type PDF_LAYOUT_TYPE = {
//    MARGIN_TOP: number,
//   MARGIN_BOTTOM: number,
//   // Spacing applied before/after components
//   SPACING: {
//     HEADER: number,    // Major section break
//     SUBHEADER: number,  // Subsection break
//     PARAGRAPH: number,// Standard text gap
//     LIST_ITEM: number,// Tight grouping for lists
//   }
// // }
// export const PDF_LAYOUT = {
//   MARGIN_TOP: 50,
//   MARGIN_BOTTOM: 50,
//   // Spacing applied before/after components
//   SPACING : {
//     HEADER: BASELINE * 3,    // Major section break
//     SUBHEADER: BASELINE * 2,  // Subsection break
//     PARAGRAPH: BASELINE * 1.5,// Standard text gap
//     LIST_ITEM: BASELINE * 1.2,// Tight grouping for lists
//   }
// };

//SPACING FRAMEWORK
// Add this as the core manager in compilePDF
// export async function renderPageBlock(
//   role: string,
//   content: string,
//   context: { page: any, y: number, doc: any }
// ) {
//   const spacing = PDF_LAYOUT.SPACING[role.toUpperCase()] || PDF_LAYOUT.SPACING.PARAGRAPH;

//   // 1. Mandatory Top Buffer
//   const targetY = context.y - spacing;

//   // 2. Proactive Page Break check
//   if (targetY < PDF_LAYOUT.MARGIN_BOTTOM) {
//     // Add a new page and capture it
//     const newPage = context.doc.addPage([595, 841]); // Using your standard letter/A4 dimensions
//     context.page = newPage;
    
//     // Reset Y to the top margin of the new page
//     // (Assuming PAGE_HEIGHT is 841 and MARGIN_TOP is 50)
//     context.y = 841 - PDF_LAYOUT.MARGIN_TOP;
//   } else {
//     context.y = targetY;
//   }
// }
// export async function renderSequentialFlow(
//   pdfDoc: PDFDocument,
//   page: any,
//   segments: any[],
//   y: number,
//   margin: number,
//   fontSize: number,
//   fonts: { regular: any; bold: any },
//   state: any
// ): Promise<{ page: any; y: number }> {
//   let currentPage = page;
//   let currentY = y;
//   const { height } = currentPage.getSize();
//   const maxWidth = 595 - (margin * 2);
//   const MARGIN_BOTTOM = 80; // Fixed footer buffer
//   const MARGIN_TOP = 80;    // Fixed header buffer
  
//   // Tighter, academic leading
//   const LINE_HEIGHT = fontSize * 1;

//   for (const segment of segments) {
//     const safeContent = segment.content?.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() || "";
//     if (!safeContent) continue;

//     // Helper: Reset to Top Margin
//     const resetPage = () => {
//       currentPage = pdfDoc.addPage([595, 841]);
//       currentY = 841 - MARGIN_TOP;
//     };

//     switch (segment.role) {
//       case 'header': {
//         if (currentY - 50 < MARGIN_BOTTOM) resetPage();
//         currentPage.drawText(safeContent.toUpperCase(), { x: margin, y: currentY, size: fontSize + 4, font: fonts.bold });
//         currentY -= (fontSize * 2.5);
//         break;
//       }

//       case 'subheader': {
//         state.listIndex = 1;
//         if (currentY - 40 < MARGIN_BOTTOM) resetPage();
//         currentPage.drawText(safeContent.toUpperCase(), { x: margin, y: currentY, size: fontSize + 2, font: fonts.bold });
//         currentY -= (fontSize * 1.5);
//         break;
//       }

//       case 'lists': {
//         const lines = wrapText(safeContent, maxWidth - 30, fonts.regular, fontSize);
//         if (currentY - (lines.length * LINE_HEIGHT) < MARGIN_BOTTOM) resetPage();
        
//         currentPage.drawText(`${state.listIndex}.`, { x: margin, y: currentY, font: fonts.bold, size: fontSize });
//         for (const line of lines) {
//           currentPage.drawText(line, { x: margin + 25, y: currentY, font: fonts.regular, size: fontSize });
//           currentY -= LINE_HEIGHT;
//         }
//         state.listIndex++;
//         currentY -= (LINE_HEIGHT * 0.5);
//         break;
//       }

//       case 'paragraph':
//       default: {
//         const lines = wrapText(safeContent, maxWidth, fonts.regular, fontSize);
//         for (const line of lines) {
//           if (currentY - LINE_HEIGHT < MARGIN_BOTTOM) resetPage();
//           currentPage.drawText(line, { x: margin, y: currentY, size: fontSize, font: fonts.regular });
//           currentY -= LINE_HEIGHT;
//         }
//         currentY -= (LINE_HEIGHT * 0.5);
//         break;
//       }
//     }
//   }
//   return { page: currentPage, y: currentY };
//}
//ORIGINAL CODE
// export async function renderSequentialFlow(
//   pdfDoc: any,
//   currentPage: any,
//   content: DocumentSegment[],
//   startY: number,
//   x: number,
//   size: number,
//   fonts: { regular: any; bold: any }
// ): Promise<{ page: any; y: number }> {
//   let cursorY = startY;
//   let page = currentPage;
//   const maxWidth = 500;

//   for (const item of content) {
//     const isSubheader = item.role === "subheader";
//     const isList = item.role === "lists";
//     const font = isSubheader ? fonts.bold : fonts.regular;
//     const currentSize = isSubheader ? size + 1 : size;
//     const indent = isList ? 20 : 0;

//     const lines = wrapText(item.content, maxWidth - indent, font, currentSize);
    
//     // PRE-CALCULATE BLOCK HEIGHT: If the whole block won't fit, move to new page
//     const blockHeight = lines.length * (currentSize * 1.3) + 20;
//     if (cursorY - blockHeight < 50) {
//       page = pdfDoc.addPage([595, 841]);
//       cursorY = 780;
//     }

//     if (isSubheader) cursorY -= 15;

//     lines.forEach((line) => {
//       page.drawText(line, {
//         x: x + indent,
//         y: cursorY,
//         size: currentSize,
//         font: font,
//       });
//       cursorY -= (currentSize * 1.3);
//     });

//     cursorY -= 8; // Item gap
//   }

//   return { page, y: cursorY };
// }