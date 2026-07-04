// ─────────────────────────────────────────────────────────────────────────────
// pdf-engine/types.ts  (updated — ParsedToken/TagType removed)
// ─────────────────────────────────────────────────────────────────────────────

import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib';
import { DocumentSegment } from '@/app/dashboard/Files/quick_assessment/assignment/page';
// Mirrors the shape produced by parseChunk
// export interface BodyBlock {
//   id: string;
//   role: 'subheader' | 'paragraph' | 'lists' | 'conclusion' | 'reference';
//   content: string;
//   index: number;
// }

export interface StudentDataType {
  assignment_title?: string;
  student_name?: string;
  recipientName?: string;
  intro_title?: string;      // from # HEADER:
  intro_content?: string;    // from ## INTRODUCTION:
  body_title?: string[];
  lists?: string[];
  body_content: DocumentSegment[];
  concl_title?: string;
  concl_content: DocumentSegment[];
  references?: string;
}

export interface RenderState {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  listIndex: number;
  pageWidth : number;
  pageHeight : number;
  margin : number

}

export interface FontSet {
  serifBold: PDFFont;
  sansRegular: PDFFont;
  sansBold: PDFFont;
}

export interface FontSizes {
  title: number;
  header: number;
  subheader: number;
  introduction: number;
  paragraph: number;
  list: number;
  conclusion: number;
  references: number;
}

// export interface AdditionalHeader {
//   subHeader?: string;
//   paragraph?: string;
// }

export interface PDFTemplateConfigFontType {
  fontSizes?: Partial<FontSizes>;
}
export interface ResolvedLayout{
pageWidth : number, 
pageHeight : number,
margin : number,
contentWidth : number,
contentHeight : number
}