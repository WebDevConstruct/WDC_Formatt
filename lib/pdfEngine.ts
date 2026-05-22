
import {PDFDocument, PDFFont, StandardFonts, rgb} from "pdf-lib"
import { wrapText } from "./utils/wrapText";
import { db } from "./prisma";
import { PDFTemplateConfigType, KeyNoteTheme} from "@/scripts/templatetypes";
import { KeynotePresentation, } from "@/app/dashboard/Slides/page";
import { KeyNoteTemplateConfig } from "@/scripts/seed-template";
import { PDFPlaceholder } from "@/scripts/templatetypes";
import { DocumentSegment } from "@/app/dashboard/Files/quick_assessment/page";
import { studentDataType } from "@/scripts/templatetypes";
import { renderStaticField, renderSequentialFlow } from "./utils/renderingChunkText";
import { additionalHeaders } from "@/scripts/templatetypes";
// Helper to convert Hex to RGB for pdf-lib
const hexToRgb = (hex: string) => {
  const r = hex ?  parseInt(hex.slice(1, 3), 16) / 255 : 0;
  const g = hex ? parseInt(hex.slice(3, 5), 16) / 255 : 0 ;
  const b = hex ?  parseInt(hex.slice(5, 7), 16) / 255 : 0 ;
  return {r, g, b};
}


// export async function compilePDF(template: PDFTemplateConfigType, studentData: studentDataType) {
//   const pdfDoc = await PDFDocument.create();
//  // const page = pdfDoc.addPage([595, 841]); // A4
  
//   const fonts = {
//     regular: await pdfDoc.embedFont(StandardFonts.TimesRoman),
//     bold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
//   };
// const PAGE_WIDTH = 595; // A4 Width
//   const CENTER_X = PAGE_WIDTH / 2;

//   // --- 1. THE FRONT PAGE (COVER) ---
//   const coverPage = pdfDoc.addPage([595, 841]);
//   let coverY = 650; // Starting height for the header blocks
//   const COVER_TEXT_SIZE = 22;
//   const COVER_MAX_WIDTH = 450; // Padding for the cover text

//   // Helper: Renders BOLD, UPPERCASE, CENTERED, and WRAPPED text blocks
//   const renderCoverBlock = (label: string, value: string, y: number): number => {
//     const combinedText = `${label.toUpperCase()} ${value.toUpperCase()}`;
//     const lines = wrapText(combinedText, COVER_MAX_WIDTH, fonts.bold, COVER_TEXT_SIZE);
    
//     let currentY = y;
//     lines.forEach(line => {
//       const lineWidth = fonts.bold.widthOfTextAtSize(line, COVER_TEXT_SIZE);
//       coverPage.drawText(line, {
//         x: CENTER_X - (lineWidth / 2),
//         y: currentY,
//         size: COVER_TEXT_SIZE,
//         font: fonts.bold,
//       });
//       currentY -= (COVER_TEXT_SIZE * 1.2); // Line height
//     });
    
//     return currentY - 40; // Space between blocks (e.g., between TOPIC and NAME)
//   };

//   // Render the Three Mandatory Front Page Sections
//   coverY = renderCoverBlock("TOPIC:", studentData.assignment_title, coverY);
//   coverY = renderCoverBlock("NAME:", studentData.student_name, coverY);
//   coverY = renderCoverBlock("TO:", studentData.recipientName, coverY);

//   // 4. Institutional Branding (Optional Footer)
//  // const footerText = "FACULTY OF MANAGEMENT SCIENCES | UNILAG 2027";
//   // coverPage.drawText(footerText, {
//   //   x: centerX - (fonts.regular.widthOfTextAtSize(footerText, 10) / 2),
//   //   y: 100,
//   //   size: 10,
//   //   font: fonts.regular,
//   // });

//   // 1. ANCHOR: Start at the top-most placeholder (usually assignment_title)
//   const contentPage = pdfDoc.addPage([595, 841])
//   const titlePlaceholder = template.placeholders.find(p => p.varName === 'assignment_title');
//   let cursorY = titlePlaceholder ? titlePlaceholder.y : 780;
//   const marginX = titlePlaceholder ? titlePlaceholder.x : 50;

//   // // 2. RENDER HEADER (Title & Name)
//   // cursorY = renderStaticField(contentPage, studentData.assignment_title, cursorY, marginX, 16, fonts.bold);
//   // //  cursorY -= 5; // Tight gap for header
  
//   // // cursorY = renderStaticField(contentPage, studentData.student_name, cursorY, marginX, 14, fonts.regular);


//   // cursorY =renderStaticField(contentPage, studentData?.intro_title, cursorY, marginX, 12, fonts.bold, 400)
//   // cursorY -= -5 
//   // // 3. RENDER INTRODUCTION (Relative to Header)
//   // cursorY -= 25; // Standard Section Gap
//   // cursorY = renderStaticField(contentPage, studentData.intro_content, cursorY, marginX, 12, fonts.regular, 500);

//   // // 4. RENDER BODY CONTENT (Relative to Intro)
//   // // No jumping to a new 'y'—we start exactly where the intro left off
//   // cursorY -= 20; 
//   // cursorY = await renderSequentialFlow(contentPage, studentData.body_content, cursorY, marginX, 12, fonts);

//   // // 5. RENDER CONCLUSION (Relative to Body)
//   // if (studentData.concl_content.length > 0) {
//   //   cursorY -= 20;
//   //   cursorY = await renderSequentialFlow(contentPage, studentData.concl_content, cursorY, marginX, 12, fonts);
//   // }

//   // 6. RENDER REFERENCES (The Final Footer)
//   if (studentData.references) {
//     cursorY -= 30; // Larger gap to signify the end of the paper
//     // Draw "References" label
//     contentPage.drawText("References", { x: marginX, y: cursorY, size: 10, font: fonts.bold });
//     cursorY -= 15;
//     renderStaticField(contentPage, studentData.references, cursorY, marginX, 10, fonts.regular, 500);
//   }

//   return await pdfDoc.save();
// }
export async function compilePDF(template: PDFTemplateConfigType, studentData: studentDataType, headers : Array<additionalHeaders>) {
  const pdfDoc = await PDFDocument.create();
  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    bold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  };

  // --- PAGE 1: THE FRONT PAGE (Automatic Upper-Middle Centering) ---
  const coverPage = pdfDoc.addPage([595, 841]);
  let coverY = 600;
  
  const renderCover = (label: string, val: string, y: number) => {
    const text = `${label.toUpperCase()} ${val.toUpperCase()}`;
    const lines = wrapText(text, 450, fonts.bold, 22);
    let curY = y;
    lines.forEach(l => {
      const w = fonts.bold.widthOfTextAtSize(l, 22);
      coverPage.drawText(l, { x: 297.5 - (w/2), y: curY, size: 22, font: fonts.bold });
      curY -= 28;
    });
    return curY - 45;
  };

  coverY = renderCover(`${studentData.assignment_title, coverY ? "TOPIC:" : ""}`, studentData.assignment_title, coverY);
  coverY = renderCover("NAME:", studentData.student_name, coverY);
  coverY = renderCover(`${studentData.recipientName, coverY ? "TO:" : ""}`, studentData.recipientName, coverY);
  headers?.forEach((item)=>  coverY = renderCover(`${item?.subHeader ? `${item?.subHeader}:` : ""}`, item?.paragraph, coverY))
 
  // --- PAGE 2+: DYNAMIC CONTENT ---
  let contentPage = pdfDoc.addPage([595, 841]);
  let cursorY = 780; // Top Margin
  const marginX = 50;

  // 1. Render INTRO_TITLE (Bold & Uppercase)
  const titleResult = await renderStaticField(
    pdfDoc, 
    contentPage, 
    studentData.intro_title?.toUpperCase(), 
    cursorY, 
    marginX, 
    13, // Slightly larger than body text
    fonts.bold
  );
  
  contentPage = titleResult.page;
  cursorY = titleResult.y - 10; // Tight gap after the title

  // 2. Render INTRO_CONTENT (Flowing text)
  const introResult = await renderStaticField(
    pdfDoc, 
    contentPage, 
    studentData.intro_content, 
    cursorY, 
    marginX, 
    11, 
    fonts.regular
  );

  // 3. Render BODY_CONTENT (Automatic Pagination Relay)
  const bodyResult = await renderSequentialFlow(
    pdfDoc, 
    introResult.page, 
    studentData.body_content, 
    introResult.y - 25, 
    marginX, 
    11, 
    fonts
  );
  // Conclusion
  const conclResult = await renderSequentialFlow(
    pdfDoc, bodyResult.page, studentData.concl_content, bodyResult.y - 25, 50, 11, fonts
  );

  // References
  if (studentData.references) {
    const refY = conclResult.y - 35;
    conclResult.page.drawText("REFERENCES", { x: 50, y: refY, size: 10, font: fonts.bold });
    await renderStaticField(
      pdfDoc, conclResult.page, studentData.references, refY - 15, 50, 9, fonts.regular
    );
  }

  return await pdfDoc.save();
}

//NEW ENGINE CODE
// export async function compilePDF(template : PDFTemplateConfigType, studentData: studentDataType) {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 841]); // A4 Standard
  
//   // 1. Prepare Font Styles
//   const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   // 2. The Smart Dispatcher Loop
//   for (const placeholder of template.placeholders) {
//     const dataValue = studentData[placeholder.varName];

//     // CASE A: The field is a simple string (Title, Name, Intro)
//     if (typeof dataValue === 'string') {
//       renderSingleField(page, dataValue, placeholder, { regular: fontRegular, bold: fontBold });
//     } 
    
//     // CASE B: The field is a Sequential Array (Body Content, Conclusion)
//     else if (Array.isArray(dataValue)) {
//       // We pass the current placeholder's Y as the 'Starting Anchor'
//       await renderSequentialFlow(page, dataValue, placeholder, { regular: fontRegular, bold: fontBold });
//     }
//   }
//   //Finalize
//   const pdfBytes = await pdfDoc?.save();
//   return pdfBytes;
// }

// OLD ENGINE CODE
// export async function compilePDF(studentData: PDFPlaceholder) {
//   // 1. Fetch Template & Config
//   const template = await db.pDFTemplate.findUnique({
//     where: { name: "ACADEMIC_ASSIGNMENT" }
//   });

//   if (!template) throw new Error("Template not found");
//   const config = template.config as unknown as PDFTemplateConfigType;
//   const { placeholders } = config;

//   // 2. Setup Document
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

//   const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   // --- THE FLOWING CURSOR LOGIC ---
//   // We start the cursor at the highest Y value defined in your template
//   let cursorY = Math.max(...placeholders.map(p => p.y)); 
//   const PAGE_MARGIN_BOTTOM = 50;

//   // Sort placeholders from top to bottom based on their original template Y
//   const sortedPlaceholders = [...placeholders].sort((a, b) => b.y - a.y);

//   // 3. The Dynamic Execution Loop
//   sortedPlaceholders.forEach((item) => {
   
//    // 1. Target the data value using the varName key
// const rawData = (studentData as Record<string, any>)[item?.varName];

// // 2. Transform the data into a unified string
// const content = Array.isArray(rawData)
//   ? rawData
//       .map((entry: contentRoles) => entry.content || "") // Extract ONLY the content property
//       .filter(text => text.length > 0)                  // Remove empty strings
//       .join("\n")                                       // Join with newlines for the wrapping engine
//   : String(rawData || "");
//     const activeFont = item.isBold ? fontBold : fontRegular;
// console.log(content);

//     // Identify if we need a "Section Break" (more space before subheaders)
//     const sectionPadding = item.type === "subheader" ? 20 : 10;
//     cursorY -= sectionPadding;

//     // Wrap the text based on its specific maxWidth
//     const lines = wrapText(content, item.maxWidth || 500, activeFont, item.fontSize);

//     lines.forEach((line) => {
//       // Safety: Prevent drawing off the page
//       if (cursorY < PAGE_MARGIN_BOTTOM) return;

//       page.drawText(line, {
//         x: item.x,
//         y: cursorY,
//         size: item.fontSize,
//         font: activeFont,
//       });

//       // Move cursor down based on the specific line height or a font-size ratio
//       const drop = item.lineHeights || (item.fontSize * 1.2);
//       cursorY -= drop;
//     });

//     // Add a small buffer after each completed block
//     cursorY -= 5; 
 
//   });

//   // 4. Finalize
//   const pdfBytes = await pdfDoc.save();
//   return pdfBytes;
// }


// export const compileKeynotePDF = async (data: KeynotePresentation, slideTheme : KeyNoteTheme,  ) => {
//   const pdfDoc = await PDFDocument.create();
//   const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   //const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
// const config = KeyNoteTemplateConfig
// const {width, height } = config.dimensions;
   
//   // Colors from our WDC Theme
//   // const primaryColor = hexToRgbScale(slideTheme.primary);
//   const secondaryColor = hexToRgb(slideTheme.secondary);
//   const surfaceColor = hexToRgb(slideTheme.surface);
//   const primaryColor = hexToRgb(slideTheme?.primary)
//   // 1. GENERATE TITLE SLIDE
//   const titlePage = pdfDoc.addPage([841.89, 595.28]); // Landscape A4
//   titlePage.drawRectangle({ x: 0, y: 0, width: 841.89, height: 595.28, color: rgb(surfaceColor?.r, surfaceColor?.g, surfaceColor?.b)});


//   titlePage.drawText(data.topic.toUpperCase(), {
//     x: 60,
//     y: 300,
//     size: 48,
//     font: boldFont,
//     color:  rgb(primaryColor?.r, primaryColor?.g, primaryColor?.b),
//   });

//   // 2. GENERATE CONTENT SLIDES
//   for (const section of data.sections) {
//   //  const page = pdfDoc.addPage([841.89, 595.28]);
//     const page = pdfDoc.addPage([width, height]);

//     // 1. Apply the Surface (Background)
//     page.drawRectangle({
//       x: 0,
//       y: 0,
//       width: width,
//       height: height,
//       color: rgb(surfaceColor.r, surfaceColor.g, surfaceColor.b),
//     });

//     // 2. Apply the Primary Color (Top Accent Bar)
//     page.drawRectangle({
//       x: 0,
//       y: height - 5,
//       width: width,
//       height: 5,
//       color: rgb(primaryColor.r, primaryColor.g, primaryColor.b),
//     });

//     // 3. Apply Primary Color to the Subheader
//     page.drawText(section.subheader, {
//       x: 50,
//       y: height - 50,
//       size: 10,
//       color: rgb(primaryColor.r, primaryColor.g, primaryColor.b),
//     });

//     // 4. Apply Secondary Color to the Headline & Body
//     page.drawText(section.headline, {
//       x: 50,
//       y: height - 120,
//       size: 32,
//       color: rgb(secondaryColor.r, secondaryColor.g, secondaryColor.b),
//     });

   
//      page.drawText(section.body_content, {
//       x: 50,
//       y: height -180 ,
//       size: 32,
//       color: rgb(0, 0, 0),
//     });

//     // 3. OPTIONAL IMAGE HANDLING
//     if ( section.imageUrl) {
//       try {
//         const imageBytes = await fetch(section.imageUrl).then((res) => res.arrayBuffer());
//         const image = section.imageUrl.includes('png') 
//           ? await pdfDoc.embedPng(imageBytes) 
//           : await pdfDoc.embedJpg(imageBytes);

//         // Position on the right 2/5ths of the slide
//         page.drawImage(image, {
//           x: 520,
//           y: 60,
//           width: 280,
//           height: 480,
//         });
//       } catch (e) {
//         console.error("Failed to embed image for section:", section.id);
//       }
//     }
//   }

//   const pdfBytes = await pdfDoc.save();
//   return pdfBytes;
// };



/**
 * UTILITY: Wraps text into an array of strings based on maxWidth
 */
const TextWrap = (text: string, maxWidth: number, font: PDFFont, fontSize: number) => {
  // FIX: Remove newlines and carriage returns that cause the 0x000a error
  const cleanText = text.replace(/[\r\n]+/g, ' ').trim();
  
  const words = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);
  return lines;
};

export const compileKeynotePDF = async (data: KeynotePresentation, slideTheme: KeyNoteTheme) => {
  const pdfDoc = await PDFDocument.create();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const config = KeyNoteTemplateConfig;
  const { width, height } = config.dimensions;
  const TEXT_MAX_WIDTH = 440;

  const primaryColor = hexToRgb(slideTheme.primary);
  const secondaryColor = hexToRgb(slideTheme.secondary);
  const surfaceColor = hexToRgb(slideTheme.surface);

  // 1. TITLE SLIDE
  const titlePage = pdfDoc.addPage([width, height]);
  titlePage.drawRectangle({ x: 0, y: 0, width, height, color: rgb(surfaceColor.r, surfaceColor.g, surfaceColor.b) });
  
  const titleLines = TextWrap(data.topic.toUpperCase(), width - 120, boldFont, 48);
  let titleY = (height / 2) + (titleLines.length * 20); 
  titleLines.forEach(line => {
    titlePage.drawText(line, { x: 60, y: titleY, size: 48, font: boldFont, color: rgb(primaryColor.r, primaryColor.g, primaryColor.b) });
    titleY -= 55;
  });

  // 2. CONTENT SLIDES
  for (const section of data.sections) {
    const page = pdfDoc.addPage([width, height]);
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(surfaceColor.r, surfaceColor.g, surfaceColor.b) });
  //  page.drawRectangle({ x: 0, y: height - 5, width, height: 5, color: rgb(primaryColor.r, primaryColor.g, primaryColor.b) });

    let currentY = height - 60;

    // A. Subheader (Safe Wrap)
    const subheaderText = section.subheader || "";
    const subheaderLines = TextWrap(subheaderText.toUpperCase(), TEXT_MAX_WIDTH, boldFont, 16);
    subheaderLines.forEach(line => {
      page.drawText(line, { x: 60, y: currentY, size: 11, font: boldFont, color: rgb(secondaryColor.r, secondaryColor.g, secondaryColor.b) });
      currentY -= 14;
    });

    // B. Headline (Safe Wrap)
    currentY -= 20;
    const headlineLines = TextWrap(section.headline || "", TEXT_MAX_WIDTH, boldFont, 42);
    headlineLines.forEach(line => {
      page.drawText(line, { x: 60, y: currentY, size: 42, font: boldFont, color: rgb(primaryColor.r, primaryColor.g, primaryColor.b) });
      currentY -= 48;
    });

    // C. Body Content (Safe Wrap)
    currentY -= 25;
    const bodyLines = TextWrap(section.body_content || "", TEXT_MAX_WIDTH, regularFont, 14);
    bodyLines.forEach(line => {
      if (currentY > 40) {
        page.drawText(line, { x: 60, y: currentY, size: 14, font: regularFont, color: rgb(secondaryColor.r, secondaryColor.g, secondaryColor.b) });
        currentY -= 22;
      }
    });

    // 3. ROBUST IMAGE HANDLING
    if (section.imageUrl) {
      try {
        const response = await fetch(section.imageUrl);
        const imageBytes = await response.arrayBuffer();
        
        // FIX: Don't trust the URL extension. Try embedding as JPG, if it fails, try PNG.
        let image;
        try {
          image = await pdfDoc.embedJpg(imageBytes);
        } catch (jpgError) {
          try {
            image = await pdfDoc.embedPng(imageBytes);
          } catch (pngError) {
            console.error("Asset is neither valid JPG nor PNG");
          }
        }

        if (image) {
          page.drawImage(image, { x: 540, y: 60, width: 240, height: 480 });
        }
      } catch (e) {
        console.error("Image fetch/embed failed:", section.id);
      }
    }
  }

  return await pdfDoc.save();
};