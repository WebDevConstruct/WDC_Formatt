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
console.log(sizes);
const {pageWidth, pageHeight, margin} = layout
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadFonts(pdfDoc);
 //console.log(deepSanitize(studentData));
  const clean = deepSanitize(studentData) as StudentDataType;

//if(!clean) return;
  // 2. Shared render state — single source of truth for page + Y position
  const state: RenderState = {
    doc: pdfDoc,
    page: pdfDoc.addPage([pageWidth, pageHeight]),
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
  let lastPage = state.page;
  for(const block of queue){
    if(!block?.content?.trim()){
        if(block.role === "subheader") state.listIndex = 1

     //   const pageBefore = state.page;
        renderToken(block, state, fonts, sizes, layout);
        if(block.role === "lists"){
       state.listIndex++;
       lastPage = state.page;
       
        }
       // drawSignature(lastPage, assets)
    }
  }

  return pdfDoc.save();
}