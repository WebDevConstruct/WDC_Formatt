
import {PDFFont} from "pdf-lib";


//NEW WRAP TEXT
/**
 * High-fidelity text wrapping for the PDF-lib engine.
 * Uses font metrics to ensure precision on the A4 canvas.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont, // Expecting a PDFFont object from pdf-lib
  fontSize: number
): string[] {
  // 1. Handle edge cases for empty or short content
  if (!text) return [];
  
  const words = text.split(/\s+/); // Split by any whitespace
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    // 2. Simulate adding the next word to the current line
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    // 3. Measure the actual pixel-width of the simulated line
    const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testLineWidth > maxWidth && currentLine !== "") {
      // 4. If it's too wide, push the completed line and start fresh
      lines.push(currentLine);
      currentLine = word;
    } else {
      // 5. If it fits, keep building the line
      currentLine = testLine;
    }
  });

  // 6. Capture the final line remaining in the buffer
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

//OLD WRAP TEXT
// export function wrapText(text: string, maxWidth: number, font: PDFFont , fontSize: number) {
  
//   const words = text.split(' ');
//   const lines: string[] = [];
//   let currentLine = words[0];

//   for (let i = 1; i < words.length; i++) {
//     const word = words[i];
//     // Measure word width using the specific font being used
//     const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
    
//     if (width < maxWidth) {
//       currentLine += ` ${word}`;
//     } else {
//       lines.push(currentLine);
//       currentLine = word;
//     }
//   }
//   lines.push(currentLine);
//   return lines;
// }

//