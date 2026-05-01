export type PlaceholderType = 'header' | 'subheader' | 'paragraph';


export interface KeyNoteTheme {
  primary  : string,
  secondary : string,
  canvas : string,
  surface : string
}

export type studentDataType = {
  // Main Headers
  assignment_title: string;
  student_name: string;
  
  // Section 1
  intro_title: string;
  intro_content: string;
  
  // Section 2
  method_title: string;
  method_content: string;
  
  // Section 3
  body_title: string;
  body_content: string;
  
  // Section 4
  concl_title: string;
  concl_content: string;

  // Optional Footer
  references?: string;
};
export interface BasePlaceholder {
  varName: keyof  studentDataType;
  type: PlaceholderType; // Required for the engine to know how to render
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  isBold?: boolean;
  color?: { r: number; g: number; b: number };
  format?: 'currency' | 'date' | 'uppercase' | 'none';
  alignment?: 'left' | 'center' | 'right';
}

// Specialization for multi-line text
export interface ParagraphField extends BasePlaceholder {
  type: 'paragraph';
  maxWidth: number;
  lineHeights: number;
}

// Specialization for single-line text
export interface HeaderField extends BasePlaceholder {
  type: 'header' | 'subheader';
}

// This is the union type that Prisma needs to map to
export type PlaceholderField = HeaderField | ParagraphField;

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
  placeholders: PlaceholderField[];
}

//kEYNOTE TEMPLATE CONFIG TYPES


//Types
/**
 * Core types for the Keynote Engine Layout System.
 * Separates structural 'bones' from dynamic 'theme' values.
 */

export type PlaceHolderType = 'header' | 'subheader' | 'paragraph' | 'image';

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

