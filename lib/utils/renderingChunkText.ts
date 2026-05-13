import { PDFPlaceholder } from "@/scripts/templatetypes";
import { PDFFont } from "pdf-lib";
import { wrapText } from "./wrapText";
import { DocumentSegment } from "@/app/dashboard/Files/quick_assessment/page";
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

/**
 * Renders an array of ContentRoles (Body or Conclusion) with relative vertical tracking.
 * 
 * @param page - The pdf-lib page object.
 * @param content - Array of objects (subheaders, paragraphs, lists).
 * @param startY - The vertical anchor point to begin drawing.
 * @param x - The horizontal margin (X-coordinate).
 * @param size - The base font size for paragraphs.
 * @param fonts - Object containing { regular, bold } PDFFonts.
 * @returns The final cursorY position for the next section.
 */

export async function renderStaticField(
  pdfDoc: any,
  currentPage: any,
  text: string,
  y: number,
  x: number,
  size: number,
  font: any,
  maxWidth: number = 500
): Promise<{ page: any; y: number }> {
  const lines = wrapText(text, maxWidth, font, size);
  let currentY = y;
  let page = currentPage;

  for (const line of lines) {
    // THRESHOLD CHECK: If we are 50pt from the bottom, swap pages
    if (currentY < 50) {
      page = pdfDoc.addPage([595, 841]);
      currentY = 780; // Reset to top margin
    }

    page.drawText(line, { x, y: currentY, size, font });
    currentY -= (size * 1.3);
  }

  return { page, y: currentY };
}

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

//NEW CODE
export async function renderSequentialFlow(
  pdfDoc: any,
  currentPage: any,
  content: DocumentSegment[],
  startY: number,
  x: number,
  size: number,
  fonts: { regular: any; bold: any }
): Promise<{ page: any; y: number }> {
  let cursorY = startY;
  let page = currentPage;
  const maxWidth = 500;

  for (const item of content) {
    const isSubheader = item.role === "subheader";
    const isList = item.role === "lists";
    const font = isSubheader ? fonts.bold : fonts.regular;
    const currentSize = isSubheader ? size + 1 : size;
    const indent = isList ? 20 : 0;

    const lines = wrapText(item.content, maxWidth - indent, font, currentSize);
    
    // PRE-CALCULATE BLOCK HEIGHT: If the whole block won't fit, move to new page
    const blockHeight = lines.length * (currentSize * 1.3) + 20;
    if (cursorY - blockHeight < 50) {
      page = pdfDoc.addPage([595, 841]);
      cursorY = 780;
    }

    if (isSubheader) cursorY -= 15;

    lines.forEach((line) => {
      page.drawText(line, {
        x: x + indent,
        y: cursorY,
        size: currentSize,
        font: font,
      });
      cursorY -= (currentSize * 1.3);
    });

    cursorY -= 8; // Item gap
  }

  return { page, y: cursorY };
}