import { DocumentSegment } from "@/app/dashboard/Files/quick_assessment/assignment/page";
export type PlaceholderType = 'header' | 'subheader' | 'paragraph';


export interface KeyNoteTheme {
  primary  : string,
  secondary : string,
  canvas : string,
  surface : string
}

// export type ListStyle = {
//   type : "number" | "bullet",
//   startAt : number
// }

// export type FormattedText = {
//   content: string;
//   fontSize: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl';
//   fontFamily: 'font-sans' | 'font-serif' | 'font-mono';
//   isBold: boolean;
//   isUnderline: boolean;
//   listSymbol ?:ListStyle;
// };


export type studentDataType = {
  // Main Headers
  assignment_title: string;
  student_name: string;
   recipientName : string;
  // Section 1
  intro_title: string;
  intro_content: string;
  
  // Section 2
 
  
  // Section 3
  body_title: Array<DocumentSegment>;
  body_content: Array<DocumentSegment>;
  lists: Array<DocumentSegment>;
  
  // Section 4
  concl_title: string;
  concl_content: Array<DocumentSegment>;

  // Optional Footer
  references?: string;
};
// export interface BasePlaceholder {
//   varName: keyof  studentDataType;
//   type: PlaceholderType; // Required for the engine to know how to render
//   x: number;
//   y: number;
//   fontSize: number;
//   fontFamily: string;
//   isBold?: boolean;
//   color?: { r: number; g: number; b: number };
//   format?: 'currency' | 'date' | 'uppercase' | 'none';
//   alignment?: 'left' | 'center' | 'right';
//   maxWidth: number;
//   lineHeights: number;
// }

// Specialization for multi-line text


// Specialization for single-line text
// export interface HeaderField extends BasePlaceholder {
//   type: 'header' | 'subheader';
// }

// This is the union type that Prisma needs to map to
//export type PlaceholderField = HeaderField | ParagraphField;
export type PDFPlaceholder = {
  varName: keyof  studentDataType;
  type: PlaceholderType;   
  x: number;             // Horizontal coordinate on A4 (0-595)
  y: number;             // Vertical coordinate on A4 (0-841)
  fontSize: number;      // Pt size of the text
  isBold: boolean;       // Determines if fontBold or fontRegular is used
  color?: { r: number; g: number; b: number };
  format?: 'currency' | 'date' | 'uppercase' | 'none';
  alignment?: 'left' | 'center' | 'right';
  maxWidth: number;
  lineHeights: number;   // Optional: Boundary for the wrapping engine
}

export interface PDFTemplateConfigType {
  layout: {
    pageSize: 'A4' | 'LETTER' | 'CUSTOM';
    orientation: 'portrait' | 'landscape';
  };
  dimensions: {
    width: number;
    height: number;
  };
  assets?: {
    logoUrl?: string;
    signatureUrl?: string;
    backgroundUrl?: string;
  };
   placeholders: PDFPlaceholder[]
}

//kEYNOTE TEMPLATE CONFIG TYPES


//Types
/**
 * Core types for the Keynote Engine Layout System.
 * Separates structural 'bones' from dynamic 'theme' values.
 */

export type PlaceHolderType = 'header' | 'subheader' | 'paragraph' | 'image';


export type additionalHeaders = {
  id : number,
  subHeader : string,
  paragraph : string
}
export interface KeyNotePlaceholder {
  varName: string;
  type: PlaceHolderType;
  x: number;
  y: number;
  fontSize?: number;
  isBold?: boolean;
  /** 
   * Maps to the SlideTheme keys (e.g., 'primary', 'secondary') 
   * to allow user-driven color customization. 
   */
  color?: 'primary' | 'secondary'; 
  fontFamily?: string;
  maxWidth?: number;
  lineHeight?: number;
  width?: number; // Specifically for type 'image'
  height?: number; // Specifically for type 'image'
}

export interface KeyNoteTemplateConfigType {
  
    layout: {
      pageSize: 'A4' | 'Letter' | string;
      orientation: 'landscape' | 'portrait';
    };
    dimensions: {
      width: number;
      height: number;
    };
    placeholders: KeyNotePlaceholder[];
  };


// Example usage implementation:

