"use client"
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { KeyNoteTheme } from '@/scripts/templatetypes';
// --- TYPE-SAFE SCHEMA (TYPESCRIPT ONLY) ---
export type WDCThemeColors = {
  syncRed: '#8B0000';
  majesticBrown: '#5C4033';
  surfaceBeige: '#F5F5DC'; // Secondary Color 1
  studioBg: '#D2B48C';    // Requested Background Color
};

export const THEME: WDCThemeColors = {
  syncRed: '#8B0000',
  majesticBrown: '#5C4033',
  surfaceBeige: '#F5F5DC',
  studioBg: '#D2B48C',
};

export interface KeynoteSection {
  id: string;
  subheader: string;
  paragraph : string;
  headline: string;
  body_content: string;
  imageUrl?: string;
}

export interface KeynotePresentation {
  topic: string;
  pageCount: number;
  sections: KeynoteSection[];
}

type BuilderStep = 'init' | 'editing';

export default function KeynoteBuilder() {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('init');
  const [presentation, setPresentation] = useState<KeynotePresentation>({
    topic: '',
    pageCount: 3,
    sections: [],
  });
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  const finalizeSetup = () => {
    const generatedSections: KeynoteSection[] = Array.from({ length: presentation.pageCount }).map((_, i) => ({
      id: crypto.randomUUID(),
      subheader: `0${i + 1} // ANALYTICAL FRAMEWORK`,
      headline: '',
      paragraph : "",
      body_content: '',
    }));

    setPresentation(prev => ({ ...prev, sections: generatedSections }));
    setCurrentStep('editing');
  };


  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateSectionField = <K extends keyof KeynoteSection>(
    index: number,
    field: K,
    value: KeynoteSection[K]
  ) => {
    setPresentation(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = { ...updatedSections[index], [field]: value };
      return { ...prev, sections: updatedSections };
    });
  };

  //Updating theme of the slide with each change
 const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
const [slideTheme, setSlideTheme] = useState({
  primary: "#8B0000",   // Target: Headers/Accents
  secondary: "#5C4033", // Target: Subheaders/Body
  surface: "#F5F5DC",   // Target: Background
});

const updateTheme = (key: string, value: string) => {
  setSlideTheme(prev => ({ ...prev, [key]: value }));
};
  // --- LOCAL IMAGE HANDLER ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSectionField(activeSectionIndex, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  //TRIGGER BUTTON TO GENERATE THE SLIDE: LET GO
 const GetkeyNoteSlide = async()=> {
   const {headline} = presentation?.sections[0]
    try{
     const response =await fetch("/api/keynote-template", {
        method : "POST",
        headers : {
            "Content-Type" : "application/pdf",
              "Content-Disposition": `attachment; filename=${headline || "Keynote"}.pdf`,
        },
        body : JSON.stringify({
        templateName : "Slides_Template",
        userInput : presentation,
        slideTheme : slideTheme
    })
     })
       if(response.ok){
const blob = await response.blob();
  console.log(blob);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  //Ensure the filename is strictly pdf
  const fileName = `${presentation?.topic?.replace(/s+/g, "_") || "Keynote"}.pdf`
  a.setAttribute("download",fileName);
  document?.body?.appendChild(a);
  a?.parentNode?.removeChild(a);
  window?.URL?.revokeObjectURL(url)
  a?.click()
 // a.download = `${headline || "Keynote"}.pdf`;
 
       }
    }catch(error){
        throw new Error("Unable to generate Keynote slide")
   }
 }

  const currentSection = presentation.sections[activeSectionIndex];

  // --- UI: SETUP STEP ---
  if (currentStep === 'init') {
    return (
      <div style={{ backgroundColor: THEME.studioBg }} className="min-h-screen flex items-center justify-center p-4 md:p-6">
        <div style={{ backgroundColor: THEME.surfaceBeige }} className="p-8 md:p-10 rounded-2xl border border-[#5C4033]/10 shadow-2xl w-full max-w-xl space-y-8">
          <header className="border-b border-[#5C4033]/10 pb-6">
            <p style={{ color: THEME.syncRed }} className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">KEYNOTE ENGINE v1.0</p>
            <h1 className="text-2xl md:text-3xl font-black text-[#5C4033] tracking-tighter">Presentation Setup</h1>
          </header>

          <section className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5C4033]/60">Global Topic</label>
              <input 
                type="text"
                placeholder="Market Analysis..."
                className="w-full bg-transparent border-b-2 focus:ring-0 focus:outline-none text-2xl font-extrabold pb-3 text-[#5C4033] placeholder:text-[#5C4033]/20"
                style={{ borderBottomColor: THEME.majesticBrown }}
                onChange={(e) => setPresentation(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center gap-6">
              <input 
                type="number" 
                value={presentation.pageCount}
                className="w-20 bg-[#5C4033]/10 p-4 rounded-xl text-3xl font-black text-center text-[#5C4033]"
                onChange={(e) => setPresentation(prev => ({ ...prev, pageCount: parseInt(e.target.value) }))}
              />
              <p className="text-[#5C4033]/50 text-xs">Define total pages for the document.</p>
            </div>
          </section>

          <button 
            onClick={finalizeSetup}
            className="w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95"
            style={{ backgroundColor: THEME.syncRed }}
          >
            Start Workspace
          </button>
        </div>
      </div>
    );
  }

  // --- UI: EDITOR STEP ---
  return (
    <div style={{ backgroundColor: THEME.studioBg }} className="h-screen flex flex-col overflow-hidden font-sans">
      
      {/* Top Studio Bar */}
      <header style={{ backgroundColor: THEME.surfaceBeige }} className="h-14 md:h-16 border-b border-[#5C4033]/10 flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span style={{ color: THEME.syncRed }} className="text-[8px] md:text-[9px] font-black tracking-[0.2em] shrink-0">WDC // KEYNOTE</span>
          <span className="text-xs font-semibold text-[#5C4033]/60 truncate">Topic: {presentation.topic || "Untitled"}</span>
        </div>
        <button
          onClick={()=> setIsThemeModalOpen(true)} 
          style={{ backgroundColor: THEME.syncRed }} 
          className="text-[10px] md:text-xs px-4 md:px-6 py-2 rounded-full font-bold text-white shadow-lg active:scale-95"
        >
          Export PDF
        </button>
      </header>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* NAVIGATOR: Responsive Horizontal/Vertical */}
        <aside className="w-full md:w-20 bg-[#5C4033]/5 border-b md:border-b-0 md:border-r border-[#5C4033]/10 flex md:flex-col items-center p-3 md:py-6 gap-3 shrink-0 overflow-x-auto no-scrollbar">
          {presentation.sections.map((section, i) => (
            <button 
              key={section.id} 
              onClick={() => setActiveSectionIndex(i)}
              className={`aspect-video w-14 md:w-full rounded border-2 transition-all shrink-0 ${activeSectionIndex === i ? 'bg-[#F5F5DC]' : 'bg-[#5C4033]/10 border-transparent'}`}
              style={{ borderColor: activeSectionIndex === i ? THEME.syncRed : 'transparent' }}
            />
          ))}
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 items-center justify-start md:justify-center relative overflow-y-auto">
          
          <div style={{ backgroundColor: THEME.surfaceBeige }} className="w-full max-w-7xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-[#5C4033]/10 rounded-sm relative md:aspect-video">
            
            <div style={{ backgroundColor: THEME.syncRed }} className="absolute top-0 left-0 h-1 w-full z-10" />
            
            {/* INPUTS: Subheader, Headline, Paragraph */}
            {currentSection && (
              <div className="w-full lg:w-3/5 p-6 md:p-12 lg:p-16 flex flex-col min-h-[450px] md:min-h-0">
                
                <input 
                  type="text"
                  value={currentSection.subheader}
                  onChange={(e) => updateSectionField(activeSectionIndex, 'subheader', e.target.value)}
                  style={{ color: THEME.syncRed }}
                  className="bg-transparent font-black tracking-widest text-[9px] md:text-[11px] outline-none uppercase mb-4"
                  placeholder="SECTION SUBHEADER"
                />

                <textarea 
                  value={currentSection.headline}
                  onChange={(e) => updateSectionField(activeSectionIndex, 'headline', e.target.value)}
                  style={{ color: THEME.majesticBrown }}
                  className="bg-transparent text-2xl md:text-5xl lg:text-6xl font-extrabold outline-none leading-tight md:leading-none resize-none h-24 md:h-36 mb-4"
                  placeholder="Majestic Headline"
                />

                <textarea 
                  value={currentSection.body_content}
                  onChange={(e) => updateSectionField(activeSectionIndex, 'body_content', e.target.value)}
                  style={{ color: THEME.majesticBrown }}
                  className="bg-transparent opacity-80 text-sm md:text-base leading-relaxed outline-none flex-1 resize-none font-medium min-h-[150px] md:min-h-0"
                  placeholder="Enter detailed paragraph content here..."
                />
              </div>
            )}

        <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-[#5C4033]/10 relative group bg-[#5C4033]/5 min-h-[300px] lg:min-h-0">
              {currentSection?.imageUrl ? (
                <div className="relative w-full h-full">
                  <img src={currentSection.imageUrl} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Slide Visual" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black text-[10px] font-bold px-4 py-2 rounded-full uppercase"
                    >
                      Change
                    </button>
                    <button 
                      onClick={() => updateSectionField(activeSectionIndex, 'imageUrl', '')}
                      className="bg-[#8B0000] text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-12 hover:bg-[#5C4033]/10 transition-all group"
                >
                  <div className="flex flex-col items-center gap-4 text-[#5C4033]/40 group-hover:scale-110 transition-transform">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#5C4033]/20 flex items-center justify-center text-3xl font-light">+</div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">Upload Asset</p>
                      <p className="text-[8px] font-medium opacity-60">JPG, PNG, WEBP supported</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Hidden Native Input */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
{isThemeModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5C4033]/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-[#F5F5DC] w-full max-w-md rounded-sm shadow-2xl border border-[#5C4033]/20 overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#5C4033] p-6 flex justify-between items-center">
        <div>
          <h2 className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Slide Design Engine</h2>
          <p className="text-[#D2B48C] text-[8px] font-bold uppercase mt-1">Configure PDF Output Palettes</p>
        </div>
        <button onClick={() => setIsThemeModalOpen(false)} className="text-[#D2B48C] hover:text-white transition-colors text-xl">✕</button>
      </div>

      {/* Inputs */}
      <div className="p-8 space-y-6">
        {Object.entries(slideTheme).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between group">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-[#5C4033] uppercase tracking-widest">{key} Color</label>
              <span className="text-[9px] font-mono text-[#8B0000] opacity-60 uppercase">{value}</span>
            </div>
            <div className="relative">
              <input 
                type="color" 
                value={value}
                onChange={(e) => updateTheme(key, e.target.value)}
                className="w-12 h-12 cursor-pointer border-2 border-white shadow-md rounded-sm" 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="p-6 bg-[#5C4033]/5 border-t border-[#5C4033]/10">
        <button 
          onClick={() => {
            GetkeyNoteSlide()
            setIsThemeModalOpen(false)
          }
          }
          className="w-full py-3 bg-[#8B0000] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#5C4033] transition-colors"
        >
          Confirm Design Specs
        </button>
      </div>
    </div>
  </div>
)}
          

          <p className="mt-6 md:absolute md:bottom-6 md:left-12 text-[10px] font-bold text-[#5C4033]/40 uppercase tracking-widest">
            Section {activeSectionIndex+1}  {presentation.pageCount}
          </p>
        
        </main>
      </div>
    </div>
  );
}



















































// "use client"
// import React, { useState } from 'react';
// import { compileKeynotePDF } from '@/lib/pdfEngine';
// // --- TYPE-SAFE SCHEMA (TYPESCRIPT ONLY) ---
// // This acts as the single source of truth for the system.

// export type WDCThemeColors = {
//   syncRed: '#8B0000';
//   majesticBrown: '#5C4033';
//   surface: '#FDF5E6';
//   studioBg: '#111111';
// };

// // Strict enforcement of the two-color palette
// export const THEME: WDCThemeColors = {
//   syncRed: '#8B0000',
//   majesticBrown: '#5C4033',
//   surface: '#FDF5E6',
//   studioBg: '#111111',
// };

// // Section Definition: Ensures every slide has the same required fields
// export interface KeynoteSection {
//   id: string; // Required for keying loops
//   subheader: string;      // maps to SyncRed field in PDF
//   headline: string;       // maps to MajesticBrown field in PDF
//   body_content: string;   // maps to MajesticBrown paragraph in PDF
//   imageUrl?: string;      // Optional Visual Asset URL
// }

// // Complete Presentation Object
// export interface KeynotePresentation {
//   topic: string;
//   pageCount: number; // Derived
//   sections: KeynoteSection[];
// }

// // System State Types
// type BuilderStep = 'init' | 'editing' | 'preview';

// // --- TYPE-SAFE PAGE (REACT & TAILWIND) ---

// export default function KeynoteBuilder() {
  
//   // State 1: Flow Control
//   const [currentStep, setCurrentStep] = useState<BuilderStep>('init');
  
//   // State 2: Keynote Data (Uses strict interface)
//   const [presentation, setPresentation] = useState<KeynotePresentation>({
//     topic: '',
//     pageCount: 3, // Default to start
//     sections: [],
//   });

//   // State 3: Editing Context
//   const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

//   // --- LOGIC: TYPE-SAFE FLOW SYNCHRONIZATION ---

//   // 1. Initial Popup Flow (Initialize Presentation Structure)
//   const finalizeSetup = () => {
//     const generatedSections: KeynoteSection[] = Array.from({ length: presentation.pageCount }).map((_, i) => ({
//       id: crypto.randomUUID(), // Stable ID for keys
//       subheader: `0${i + 1} // ANALYTICAL FRAMEWORK`, // Default structure
//       headline: '',
//       body_content: '',
//     }));

//     setPresentation(prev => ({
//       ...prev,
//       sections: generatedSections
//     }));
    
//     setCurrentStep('editing'); // Shift flow to Editor
//   };

//   // 2. Editing Flow (Type-safe field updates)
//   const updateSectionField = <K extends keyof KeynoteSection>(
//     index: number,
//     field: K,
//     value: KeynoteSection[K]
//   ) => {
//     setPresentation(prev => {
//       const updatedSections = [...prev.sections];
//       updatedSections[index] = {
//         ...updatedSections[index],
//         [field]: value
//       };
//       return { ...prev, sections: updatedSections };
//     });
//   };

//   const currentSection = presentation.sections[activeSectionIndex];



// //   The Trigger Button to Call the Sides
// const GetkeyNoteSlide = async()=> {

//     try{
//      const response =await fetch("/api/keynote-template", {
//         method : "POST",
//         headers : {
//             "Content-Type" : "application/json"
//         },
//         body : JSON.stringify({
//         templateName : "ACADEMIC_ASSIGNMENT",
//         userInput : presentation
//     })
//      })
//        if(response.ok){
// const blob = await response.blob();
//   console.log(blob);
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "KeyNotePresentation.pdf";
//   a.click();
//        }
//     }catch(error){
//         throw new Error("Unable to generate Keynote slide")
//     }
// }
//   // --- UI FLOW: INIT STEP (Popup) ---
//   if (currentStep === 'init') {
//     return (
//       <div style={{ backgroundColor: THEME.studioBg }} className="min-h-screen flex items-center justify-center p-6 text-slate-200">
//         <div className="bg-[#1a1a1a] p-10 rounded-2xl border border-white/5 shadow-2xl w-full max-w-xl space-y-12">
          
//           <header className="border-b border-white/5 pb-6">
//             <p style={{ color: THEME.syncRed }} className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">KEYNOTE ENGINE v1.0</p>
//             <h1 className="text-3xl font-black text-white tracking-tighter">Presentation Setup</h1>
//           </header>

//           <section className="space-y-8">
//             <div className="space-y-2">
//               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Global Keynote Topic</label>
//               <input 
//                 type="text"
//                 placeholder="Predictive Markets in..."
//                 className="w-full bg-transparent border-b-2 focus:ring-0 focus:outline-none text-3xl font-extrabold pb-3"
//                 style={{ borderBottomColor: THEME.majesticBrown }}
//                 onChange={(e) => setPresentation(prev => ({ ...prev, topic: e.target.value }))}
//               />
//             </div>
            
//             <div className="space-y-3">
//               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Content Sections</label>
//               <div className="flex items-center gap-6">
//                 <input 
//                   type="number" 
//                   min={1} max={15}
//                   value={presentation.pageCount}
//                   onChange={(e) => setPresentation(prev => ({ ...prev, pageCount: Math.min(15, Math.max(1, parseInt(e.target.value))) }))}
//                   className="w-28 bg-[#2a2a2a] p-5 rounded-2xl text-4xl font-black text-center"
//                 />
//                 <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Define total pages. We use an asymmetric layout (3/5 text, 2/5 visual) for professional flow.</p>
//               </div>
//             </div>
//           </section>

//           <button 
//             onClick={finalizeSetup}
//             className="w-full py-5 rounded-xl text-white font-bold transition-all text-lg shadow-lg hover:brightness-110 active:scale-[0.98]"
//             style={{ backgroundColor: THEME.syncRed }}
//           >
//             Generate Keynote Workspace
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // --- UI FLOW: EDITING STEP (Responsive Studio) ---
//   return (
//     <div style={{ backgroundColor: THEME.studioBg }} className="h-screen flex flex-col text-slate-200 overflow-hidden font-sans">
      
//       {/* Top Studio Bar */}
//       <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#1a1a1a]">
//         <div className="flex items-center gap-2">
//           <span style={{ color: THEME.syncRed }} className="text-[9px] font-black tracking-[0.2em]">WDC // KEYNOTE</span>
//           <span className="text-sm font-semibold text-slate-400">Topic: {presentation.topic || "Untitled Project"}</span>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="text-xs px-5 py-2 rounded-full font-bold bg-white/5 border border-white/10 hover:bg-white/10">Share</button>
//           <button
//           onClick={()=> {
//             GetkeyNoteSlide()
//           }} style={{ backgroundColor: THEME.syncRed }} className="text-xs px-6 py-2 rounded-full font-bold hover:brightness-110">Export PDF</button>
//         </div>
//       </header>

//       {/* Main Area: Navigator + Canvas */}
//       <div className="flex flex-1 overflow-hidden">
        
//         {/* 1. SLIDE NAVIGATOR (Left Sidebar, Scrollable) */}
//         <aside className="w-20 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-6 gap-3 shrink-0">
//           <div style={{ backgroundColor: THEME.syncRed }} className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white mb-4">
//             A<span className="text-white/50">W</span>
//           </div>
//           <div className="flex-1 space-y-3 overflow-y-auto w-full px-2">
//             {presentation.sections.map((section, i) => (
//               <button 
//                 key={section.id} 
//                 onClick={() => setActiveSectionIndex(i)}
//                 className={`aspect-video w-full rounded-lg border-2 transition-all cursor-pointer ${activeSectionIndex === i ? 'bg-white/5' : 'bg-[#111] border-transparent hover:bg-white/5'}`}
//                 style={{ borderColor: activeSectionIndex === i ? THEME.syncRed : 'transparent' }}
//               />
//             ))}
//           </div>
//         </aside>

//         {/* 2. THE EDITOR CANVASS (Aspect Ratio Locked, Responsive) */}
//         <main className="flex-1 flex flex-col p-6 md:p-10 lg:p-12 items-center justify-center relative">
          
//           <div className="aspect-video w-full max-w-7xl bg-white shadow-2xl flex overflow-hidden border border-slate-100 rounded-sm relative">
            
//             {/* WDC Accent Line */}
//             <div style={{ backgroundColor: THEME.syncRed }} className="absolute top-0 left-0 h-1 w-full" />
            
//             {/* THE A4-STYLE CONTENT BLOCK (Left Column) */}
//             {currentSection && (
//               <div className="w-full lg:w-3/5 p-12 lg:p-16 flex flex-col">
                
//                 {/* SyncRed Subheader (Navigation) */}
//                 <input 
//                   type="text"
//                   value={currentSection.subheader}
//                   onChange={(e) => updateSectionField(activeSectionIndex, 'subheader', e.target.value)}
//                   style={{ color: THEME.syncRed }}
//                   className="bg-transparent font-black tracking-widest text-[9px] md:text-[11px] outline-none uppercase mb-6"
//                   placeholder="01 // FRAMEWORK // ANALYSIS"
//                 />

//                 {/* MajesticBrown Headline */}
//                 <textarea 
//                   value={currentSection.headline}
//                   onChange={(e) => updateSectionField(activeSectionIndex, 'headline', e.target.value)}
//                   style={{ color: THEME.majesticBrown }}
//                   className="bg-transparent text-[#4B3621] text-3xl md:text-5xl lg:text-6xl font-extrabold outline-none leading-none resize-none h-36 mb-6"
//                   placeholder="The Majestic Title"
//                 />

//                 {/* MajesticBrown Paragraph (Bulky Content) */}
//                 <textarea 
//                   value={currentSection.body_content}
//                   onChange={(e) => updateSectionField(activeSectionIndex, 'body_content', e.target.value)}
//                   style={{ color: THEME.majesticBrown }}
//                   className="bg-transparent text-[#4B3621]/80 text-sm md:text-base leading-relaxed outline-none flex-1 resize-none font-medium"
//                   placeholder="Add your deep analytical content here. This section is structured for bulky, professional text required for formal academic or executive briefs."
//                 />
//               </div>
//             )}

//             {/* THE ASSET SLOT (Right Column) */}
//             <div className="w-0 lg:w-2/5 border-l border-slate-100 flex items-center justify-center bg-black/5 hover:bg-black/10 cursor-pointer transition-colors group">
//               <div className="flex flex-col items-center gap-4 opacity-30 group-hover:opacity-100 group-hover:scale-105 transition-all">
//                 <span className="w-16 h-16 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:text-black">
//                    M
//                 </span>
//                 <p style={{ color: THEME.majesticBrown }} className="text-[10px] font-black uppercase tracking-widest">Add Section Media</p>
//               </div>
//             </div>

//           </div>

//           {/* Contextual Info (Bottom Left) */}
//           <p className="absolute bottom-6 left-12 text-[10px] font-bold text-slate-600">Editing Section {activeSectionIndex+1} of {presentation.pageCount}</p>
        
//         </main>
//       </div>
//     </div>
//   );
// }