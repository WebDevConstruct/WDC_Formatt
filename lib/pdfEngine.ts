
import {PDFDocument, PDFFont, StandardFonts, rgb} from "pdf-lib"
import { wrapText } from "./utils/wrapText";
import { db } from "./prisma";
import { PDFTemplateConfigType,BasePlaceholder, KeyNoteTheme } from "@/scripts/templatetypes";
import { KeyNoteTemplateConfigType } from "@/scripts/templatetypes";
import { KeynotePresentation, } from "@/app/dashboard/Slides/page";
import { KeyNoteTemplateConfig } from "@/scripts/seed-template";

// Helper to convert Hex to RGB for pdf-lib
const hexToRgb = (hex: string) => {
  const r = hex ?  parseInt(hex.slice(1, 3), 16) / 255 : 0;
  const g = hex ? parseInt(hex.slice(3, 5), 16) / 255 : 0 ;
  const b = hex ?  parseInt(hex.slice(5, 7), 16) / 255 : 0 ;
  return {r, g, b};
}



export async function compilePDF(studentData :  BasePlaceholder){
 // 1. Fetch the Blueprint from Neon
  const template = await db.pDFTemplate.findUnique({
    where: { name: "ACADEMIC_ASSIGNMENT" }
  });

  if (!template) throw new Error("Template not found");
  const { placeholders } = template.config as unknown as PDFTemplateConfigType;
const config = template.config as unknown as PDFTemplateConfigType;
  // 2. Setup the Document & Assets
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

  // Load the Fonts (The "Assets")
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  //const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);


  let logoImage = null;
  if (config.assets?.logoUrl) {
    const logoBytes = await fetch(config.assets.logoUrl).then(res => res.arrayBuffer());
    // Use embedPng or embedJpg depending on the file type
    logoImage = await pdfDoc.embedPng(logoBytes); 
  }

 

  // Draw the logo if it exists
  if (logoImage) {
    page.drawImage(logoImage, {
      x: 50, // Usually top left
      y: config.dimensions.height - 100,
      width: 50,
      height: 50,
    });
  }
  // 3. The Execution Loop
  placeholders.forEach((item)=> {
    // Get the actual text the student wrote for this field
    // const contentType = item?.varName as keyof studentDataType
  const content = String((studentData as Record<string, any>)[item.varName] || "")
    const activeFont = item.isBold ? fontBold : fontRegular;

    // --- THE WRAPTEXT INTEGRATION ---
    if (item.type === "paragraph") {
      const lines = wrapText(content, item.maxWidth, activeFont, item.fontSize);
      
      let currentY = item.y;
      lines.forEach((line) => {
        page.drawText(line, {
          x: item.x,
          y: currentY,
          size: item.fontSize,
          font: activeFont,
        });
        // Move down based on the lineHeight we seeded in Neon
        currentY -= (item.lineHeights || 15); 
      });
    } else {
      // For Headers/Subheaders (No wrapping needed)
      page.drawText(content, {
        x: item.x,
        y: item.y,
        size: item.fontSize,
        font: activeFont,
      });
    }
  });

  // 4. Finalize
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}


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
    page.drawRectangle({ x: 0, y: height - 5, width, height: 5, color: rgb(primaryColor.r, primaryColor.g, primaryColor.b) });

    let currentY = height - 60;

    // A. Subheader (Safe Wrap)
    const subheaderText = section.subheader || "";
    const subheaderLines = TextWrap(subheaderText.toUpperCase(), TEXT_MAX_WIDTH, boldFont, 11);
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
    const bodyLines = TextWrap(section.body_content || "", TEXT_MAX_WIDTH, regularFont, 16);
    bodyLines.forEach(line => {
      if (currentY > 40) {
        page.drawText(line, { x: 60, y: currentY, size: 16, font: regularFont, color: rgb(secondaryColor.r, secondaryColor.g, secondaryColor.b) });
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