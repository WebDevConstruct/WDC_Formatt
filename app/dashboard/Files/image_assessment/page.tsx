"use client"
import React, { useState, useRef} from 'react';
import { 
  ChevronDown, 
  Plus, 
  Trash2, 
  Layout, 
  BookOpen, 
  FileText, 
  Database 
} from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import { Settings2, 
 Terminal, Monitor} from "lucide-react";
  import {motion} from "framer-motion";
  import { useUser } from '@clerk/nextjs';
  import { useGlobalContext } from '@/app/Context';
  import { KeynoteSection } from '../../Slides/page';
  import {createWorker} from "tesseract.js";
  import { DocumentSegment } from '../quick_assessment/assignment/page';
  import { studentDataType } from '@/scripts/templatetypes';
// --- TYPES & INTERFACES ---

interface ContentBlock {
  id: number;
  subHeader: string;
  paragraph: string;
}

interface MetadataState {
  cover: {
    author: string;
    topic: string;
    recipient: string;
  };
  introduction: string;
  conclusion: string;
  dataSource: string;
}

type SectionId = 'cover' | 'intro' | 'content' | 'conclusion' | 'source' | null;
type ImagePreview = {
  file : File;
  previewUrl : string;
  id : string;
  status : "pending" | "processing" | "completed" | "error";
  extractedText ?: string
}
const ImageAssessment = () => {
    const [openSection, setOpenSection] = useState<SectionId>('cover');
      const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
        { id: 0, subHeader: '', paragraph: '' }
      ]);
      const [presentation, setPresentation] = useState({
        topic : "",
        pageCount : 3,
        image : ""
      })
      const [images, setImages] = useState<ImagePreview[]>([]);
      const [isProcessing, setIsProcessing] = useState(false);
       //1. COLLECTION STEP: ADD IMAGES TO QUEUE

 
    
      // 2. Metadata State
      const [meta, setMeta] = useState<MetadataState>({
        cover: { author: '', topic: '', recipient: '' },
        introduction: '',
        conclusion: '',
        dataSource: ''
      });
    

    //  2. READING STEP: PROCESS THE QUEUE
    const processImages = async()=> {
      setIsProcessing(true);
      const worker = await createWorker("eng");
      for (const img of images){
        if(img?.status === "completed") continue;


        //UPDATE UI TO SHOW WHICH IMAGE IS BEING READ
        updateImageStatus(img.id, "processing");
        try{
          const {data: {text}} = await worker?.recognize(img.file);
          const words = wdcSmoothChunker(text)
          setImages(prev => prev.map(item=> item?.id === img?.id
            ? {...item, status : "completed", extractedText : words} 
            : item
          ))
          console.log(text);
        }catch(error){
updateImageStatus(img?.id, "error")
        }
      }
      await worker?.terminate();
      setIsProcessing(false)
    }

    //HELP UPDATING THE IMAGE STATUS
    const updateImageStatus = (id : string, status : ImagePreview["status"])=> {
      setImages(prev => prev?.map(item=> item?.id === id ? {...item, status} : item))
    }
      // --- LOGIC HANDLERS ---
   
      const addContentBlock = (): void => {
       // const newBlock: ContentBlock = { id : prev.length, subHeader: '', paragraph: '' };
        setContentBlocks(prev => [...prev,  { id : prev.length, subHeader: '', paragraph: '' }]);
      };
    
      const updateContentBlock = (id: number, field: keyof Omit<ContentBlock, 'id'>, value: string): void => {
        setContentBlocks(prev => prev.map(block => 
          block.id === id ? { ...block, [field]: value } : block
        ));
      };
    
      const removeContentBlock = (id: number): void => {
        if (contentBlocks.length > 1) {
          setContentBlocks(prev => prev.filter(block => block.id !== id));
        }
      };

    //   Image Related Logic
      const fileInputRef = useRef<HTMLInputElement>(null);
      const updateSectionField =( value : string) => {
        setPresentation(prev => {
         
        
          return { ...prev, image: value };
        });
      };
      const [readText, setReadText] = useState("");
      const [imageUrl, setImageUrl] = useState("");
      // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      //   const file = e.target.files?.[0];
      //   if (file) {
      //     const reader = new FileReader();
      //     reader.onloadend = () => {
      //       updateSectionField(reader.result as string);
      //       setImageUrl(reader.result as string);
      //     };
      //     reader.readAsDataURL(file);
      //   }
      // };

      //ValdateWDCStructure
      const [segments, setSegments] = useState<DocumentSegment[]>([]);
      const [bodyReq, setBodyReq] = useState<studentDataType>()
      const validateWDCStructure = async(file : File): Promise<{isValid : boolean; detectedElements : string[]}> => {
       const worker = await createWorker("eng");

       const {data} = await worker?.recognize(file);
         const text = wdcSmoothChunker(data?.text)
  //    console.log(text)
       const lines = text?.split("\n")?.filter(l=> l.trim()?.length > 0);
       console.log(lines)
       const detectedElements : string[] = [];
   

       //1. HEADERS/ TITKE DETECTION
      const hasHeaders = lines.some(line => {
  const trimmed = line.trim();
  
  // 1. Check for the existing All-Caps standard
  const isAllCaps = trimmed.length < 50 && trimmed === trimmed.toUpperCase();
  
  // 2. Check for Sentence/Title Case patterns
  const isSentenceTitle = 
    trimmed.length < 50 &&               // Short enough to be a title
    /^[A-Z]/.test(trimmed) &&            // Starts with a Capital
    !/[.!?]$/.test(trimmed);             // Does NOT end with punctuation (Strongest indicator)

  return isAllCaps || isSentenceTitle;
});
       if(hasHeaders) detectedElements?.push("HEADERS");
      // const cleanContent =  lines.find(line => line.length > 80 && /[.!?]$/.test(line.trim())) || "";
      const hasParagraphs = lines.some(line => line.length > 80 && /[.!?]$/.test(line.trim()));
       if(hasParagraphs) detectedElements?.push("PARAGRAPHS");
     
        //3. LIST DETECT
   const hasLists = lines.some(line => {
  const trimmed = line.trim();
  return (
    /^[0-9]+\s*[\.\)]/.test(trimmed) || // Matches "1.", "1)", "1. "
    /^[\-\*\•]/.test(trimmed)           // Matches "-", "*", "•" with or without space
  );
});

// 🏛️ WDC_SUBHEADER_LOGIC_TEST
const hasSubheaders = lines.some(line => {
  const trimmed = line.trim();
  
  // 1. Nested Numbering Pattern (e.g., 1.1, 2.4.1, Section 2)
  const isNestedNumbering = /^((\d+\.)+\d+|Section\s\w+|Part\s\d+)/i.test(trimmed);
const findHeaders = segments?.find(seg => seg?.role === "header")
  // 2. Structural Heuristic
  const isSubheaderPattern = 
    findHeaders &&
    trimmed.length > 15 &&               // Longer than a simple title
    trimmed.length < 75 &&               // Shorter than a paragraph
    /^[A-Z]/.test(trimmed) &&            // Starts with a Capital
    !/[.!?]$/.test(trimmed)            // No terminal punctuation
       // Specifically NOT all-caps (to distinguish from main titles)

  return isNestedNumbering || isSubheaderPattern;
});

if (hasSubheaders) detectedElements.push("SUBHEADERS");
        if(hasLists) detectedElements?.push("LIST_STRUCTURE");
        await worker?.terminate();
   // setFileStructure(detectedElements);
        //REJECTION LOGIC
const paragraphSort = segments?.filter(seg => seg?.role === "paragraph");
const listSorts =  segments?.filter(seg => seg?.role === "lists");
const subheaderSorts =  segments?.filter(seg => seg?.role === "subheader" );
const concl_content =  segments?.filter(seg => seg?.role === "conclusion");

            //The type of bodyReq
            const info: studentDataType = {
      assignment_title: meta?.cover?.topic ? meta?.cover?.topic : "",
      student_name: meta?.cover?.author ? meta?.cover?.author: user ?
       `${user?.firstName ? user?.firstName + " " + user?.lastName : user?.username }` : "",
       recipientName : meta?.cover?.recipient ? meta?.cover?.recipient : "" ,
      intro_title: "",
      intro_content: "",
      body_title: [],
      lists : [],
      body_content: [],
      concl_title : "",
      concl_content: [],
      references: ""
    };
        //Assign the texts to the respective roles in the segment array
        lines.forEach((line : string, index)=> {
       const roleCheck =     segments?.find(seg => seg?.role === "header")
     const value = line?.trim()?.length < 50 &&               // Short enough to be a title
    /^[A-Z]/.test(line?.trim()) &&            // Starts with a Capital
    !/[!?]$/.test(line?.trim()) 
    &&    roleCheck === undefined ? "header" :
      roleCheck?.role === "header" &&
    line?.trim().length > 5 &&               // Longer than a simple title
    line?.trim().length < 75 &&               // Shorter than a paragraph
    /^[A-Z]/.test(line?.trim()) &&            // Starts with a Capital
    !/[.!?]$/.test(line?.trim()) ?  "subheader" :     /^[0-9]+\s*[\.\)]\s+/.test(line?.trim()) ||
    /^[\-\*\•]\s+/.test(line?.trim()) ? "lists" : "paragraph"    ;   
          //Couple of tests
        
          segments?.push({
            id : `seg-${crypto?.randomUUID()}`,
            role : value,
            content : line,
            index : index

          })


          info?.body_content?.push({
            id : `seg-${crypto?.randomUUID()}`,
            role : value,
            content : line,
            index : value === "lists" ? listSorts?.length 
            : value === "paragraph"  ? paragraphSort?.length : value === "subheader" ? subheaderSorts?.length : index
})
      
          if(value === "header" && info){
            info.intro_title  = line;
          }else if(value === "header" && info){
            info.intro_title  = line;
          }else if(value === "lists"){
            info.lists = listSorts
          }
        })
        setBodyReq(info);
const isValid = detectedElements?.length > 0 && text?.length > 50;
//console.log("Check", detectedElements?.includes("HEADERS"))
return {isValid, detectedElements}
      }



      //NEW FUNCTION

const isWdcStructuralHeader = (line: string): boolean => {
  const trimmed = line.trim();
  if (trimmed.length < 4 || trimmed.length > 55) return false;

  // Rule A: It's all uppercase (Classic WDC Header)
  const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-A-Z]/.test(trimmed);

  // Rule B: It's Sentence/Title case but has NO terminal punctuation (Subheader/Topic)
  const isTitleCaseHeader = /^[A-Z]/.test(trimmed) && !/[.!?:]$/.test(trimmed);

  return isAllCaps || isTitleCaseHeader;
};


const wdcSmoothChunker = (rawText: string): string => {
  if (!rawText) return "";

  // Core character cleanup (preserving syntax and bullet artifacts)
  const cleanSymbols = rawText.replace(/[^\w\s\d.,!?;:()'"\-\$%/•]/g, '');
  const rawLines = cleanSymbols.split('\n').map(line => line.trim());
  const healedLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    let currentLine = rawLines[i];
    if (!currentLine) continue;

    // Bullet Spacing Standardization
    if (/^•\s*/.test(currentLine)) {
      currentLine = currentLine.replace(/^•\s*/, '• ');
    }

    if (healedLines.length > 0) {
      const lastIdx = healedLines.length - 1;
      const previousLine = healedLines[lastIdx];

      // Evaluation Markers
      const endsWithPunctuation = /[.!?:]$/.test(previousLine);
      const currentIsBullet = /^[\-\*\•]\s+/.test(currentLine) || /^[0-9]+\s*[\.\)]/.test(currentLine);
      
      // NEW: Structural Boundary Protection
      const currentIsHeader = isWdcStructuralHeader(currentLine);
      const previousIsHeader = isWdcStructuralHeader(previousLine);

    
      // Only merge if: No terminal punctuation AND current is not a bullet AND neither line is a header
      if (!endsWithPunctuation && !currentIsBullet && !currentIsHeader && !previousIsHeader) {
        healedLines[lastIdx] = previousLine + " " + currentLine;
        continue;
      }
    }

    healedLines.push(currentLine);
  }

  // Group into double-newline chunks for structural parsing
  return healedLines
    .map(line => line.replace(/[ \t]+/g, ' '))
    .filter(line => line.length > 3)
    .join("\n\n");
};
const {user} = useUser()

//PDF Trigger
const imageTriggerForPDF = async()=> {

   const body = {
      templateName : "ACADEMIC_ASSIGNMENT",
      userInput :bodyReq,
      contentBlock : contentBlocks
    }
    console.log(body);
     const {userInput} = body;
  try {
  const response = await fetch("/api/quickassessment-template", {
    method : "POST",
    headers : {
      "Content-Type" : "application/pdf",
      "Content-Disposition" : `attachment; filename=${userInput?.assignment_title}.pdf`
    },
    body : JSON.stringify({body})
  })
 // console.log(JSON.stringify({body}));

 
const blob = await response.blob();
  console.log(blob);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fileName = `${userInput?.assignment_title || "ASSIGNMENT"}.pdf`
  a.setAttribute("download",fileName);
  document?.body?.appendChild(a);
  a?.click()
  //Clean Up
  window?.URL?.revokeObjectURL(url)
    a?.parentNode?.removeChild(a);
} catch(error){
  throw new Error("Could not Create the Assignment");
}
}

//IMAGE TRIGGER FUNCTION....
//GIVING THE USER THE PROWESS TO EDIT GENERATED CONTENT FROM THE PDF
const [editingId, setEditingId] = useState<string | null>(null);
// Update a specific segment's content in the state
const handleSegmentChange = (id: string, newContent: string) => {
  setSegments(prev => prev.map(seg => 
    seg.id === id ? { ...seg, content: newContent } : seg
  ));
};


 const [systemStatus, setSystemStatus] = useState("")
 //
 
  const handleFileChange = async(e : React.ChangeEvent<HTMLInputElement>)=> {
    if(!e.target?.files) return;
   const file = e.target.files[0];
        if(e.target.files){
         // console.log(fileStructure);
          setSystemStatus("SCANNING_STRUCTURE....");
          const {isValid, detectedElements} = await validateWDCStructure(file);
          if(!isValid){
            alert("INVALID DOCUMENT STRUCTURE")
            return;
          }
          const newFiles = Array?.from(e.target.files)?.map(file=> ({
            file,
            previewUrl : URL?.createObjectURL(file),
            id : Math?.random()?.toString(36)?.substr(2,9),
            status : "pending" as const,
            extractedText : detectedElements?.join(" ")
          }))
          setImages(prev => [...prev, ...newFiles])
          setSystemStatus("STRUCTURE_VERIFIED")
        }
       }
       console.log(segments);
      // console.log(detectedElement)
  return (
    <div className='w-full flex flex-col gap-10 px-7 bg-[#F2F0E9] py-20 min-h-screen '>
           <Link href="/dashboard/Files" 
      className ="flex gap-2 items-center my-4">
        <Image src="/ArrowBack.svg" alt="Back to Dashboard" width={24} height={24}/>
        <p className="text-lg font-bold text-[#483C32]/80 hover:opacity-90 hover:text-[17px]">
        Files Engine Room</p>  
      </Link>
   
        <div className='flex gap-10 justify-between  w-full md:flex-row flex-col'>
    <div className="flex  flex-col lg:w-1/2 w-full px-5 py-10 ">
        

        
        <SectionWrapper 
          title="Cover Section" 
          id="cover" 
          activeId={openSection} 
          setActive={setOpenSection}
          icon={<Layout className="w-5 h-5 text-[#D4AF37]" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <InputField 
              label="Author Name" 
              value={meta.cover.author}
              onChange={(val) => setMeta({...meta, cover: {...meta.cover, author: val}})}
            />
            <InputField 
              label="Official Topic" 
              value={meta.cover.topic}
              onChange={(val) => setMeta({...meta, cover: {...meta.cover, topic: val}})}
            />
            <InputField 
              label="Submitted To" 
              value={meta.cover.recipient}
              onChange={(val) => setMeta({...meta, cover: {...meta.cover, recipient: val}})}
            />
          </div>
        </SectionWrapper>

        {/* --- SECTION: CONTENT (DYNAMIC) --- */}
        <SectionWrapper 
          title="The Content" 
          id="content" 
          activeId={openSection} 
          setActive={setOpenSection}
          icon={<BookOpen className="w-5 h-5 text-[#D4AF37]" />}
        >
          <div className="space-y-6 pt-4">
            {contentBlocks.map((block, index) => (
              <div key={block.id} className="p-6 bg-white/40 border border-[#483C32]/10 rounded-2xl relative group">
                <div className="absolute -left-3 top-6 bg-[#483C32] text-[#F2F0E9] text-[9px] px-2 py-1 rounded font-black tracking-widest">
                  BLOCK 0{index + 1}
                </div>
                {contentBlocks.length > 1 && (
                  <button 
                    onClick={() => removeContentBlock(block.id)}
                    className="absolute top-4 right-4 text-[#483C32]/20 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="space-y-4">
                  <InputField 
                    label="SubHeader" 
                    value={block.subHeader}
                    onChange={(val) => updateContentBlock(block.id, 'subHeader', val)}
                  />
                  <TextArea 
                    label="Context Paragraph" 
                    value={block.paragraph}
                    onChange={(val) => updateContentBlock(block.id, 'paragraph', val)}
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={addContentBlock}
              className="w-full py-5 border-2 border-dashed border-[#483C32]/20 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all bg-white/10"
            >
              <Plus className="w-4 h-4" /> Add Structural Element
            </button>
          </div>
        </SectionWrapper>

        {/* --- SECTION: DATA SOURCE --- */}
        <SectionWrapper 
          title="Data Intelligence" 
          id="source" 
          activeId={openSection} 
          setActive={setOpenSection}
          icon={<Database className="w-5 h-5 text-[#D4AF37]" />}
        >
          <div className="pt-4 space-y-4">
            <InputField 
              label="Primary Source Authority" 
              placeholder="e.g., Bloomberg, CBN, BBC" 
              value={meta.dataSource}
              onChange={(val) => setMeta({...meta, dataSource: val})}
            />
            <div className="p-4 bg-[#483C32] text-[#F2F0E9] rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                Source Failover: Active Institutional Redirect
              </p>
            </div>
          </div>
        </SectionWrapper>
        </div>
        {/* Image Section */}
      {/* <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-[#5C4033]/10
       relative group bg-[#5C4033]/5 min-h-[300px] lg:min-h-0">
{/* NEW CODE */}

    
<div className="grid grid-cols-1 lg:grid-cols-2 md:w-1/2 w-full  mt-6 border-t border-[#483C32]">
  {/* 1. SELECTION & PREVIEW AREA */}
  <div className="relative border-r border-b border-[#483C32]  w-full bg-white min-h-[300px]">
    {images?.length > 0 ? (
      <div className="relative w-full h-full group">
        {/* We display the last uploaded image or the active processing image */}
        <Image fill={true}  objectFit='contain'
          src={images[images.length - 1].previewUrl} 
          className="w-full h-full object-cover animate-in fade-in duration-500" 
          alt="WDC UNIT VISUAL" 
        />
        
        {/* WDC_STATUS_OVERLAY */}
        <div className="absolute top-2 left-2 bg-[#D4AF37] text-[#2C2520] text-[9px] 
        font-bold px-2 py-1 uppercase tracking-widest z-20 w-full">
          {images[images.length - 1].status === 'completed' ? 'VERIFIED_DATA' : 'PENDING_EXTRACTION'}
        </div>

        <div className="absolute inset-0 bg-[#2C2520]/60 opacity-0 
        group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 w-full">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-[#2C2520] text-[10px] font-bold px-4 py-2 uppercase border border-[#483C32]"
          >
            Add Page
          </button>
          <button 
            onClick={() => setImages([])} // Clears the queue
            className="bg-[#8B0000] text-white text-[10px] font-bold px-4 py-2 uppercase"
          >
            Purge Queue
          </button>
        </div>
      </div>
    ) : (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-full flex flex-col items-center justify-center 
        cursor-pointer p-12 hover:bg-[#D4AF37]/5 transition-all group"
      >
        <div className="flex flex-col items-center gap-4 w-full text-[#483C32]/40 group-hover:scale-105 transition-transform">
          <div className="h-20 rounded-none border-2 w-full border-dashed border-[#D4AF37] flex items-center justify-center text-3xl font-light text-[#D4AF37]">+</div>
          <div className="text-center">
            <p className="text-[10px] font-black text-[#2C2520] uppercase tracking-[0.3em] mb-1">Upload WDC Asset</p>
            <p className="text-[8px] font-medium text-gray-400 uppercase">Institutional Archive (JPG, PNG, WEBP)</p>
          </div>
        </div>
      </div>
    )}

    {/* Hidden Native Input */}
    <input 
      type="file" 
      ref={fileInputRef}
      onChange={handleFileChange}
      accept="image/*"
      multiple
      className="hidden"
    />
  </div>

  {/* 2. PROCESSING & LOG AREA */}
  <div className="border-b h-full border-[#483C32] py-3 bg-gray-50 flex flex-col justify-between">
    <div className="h-full">
      <h3 className="text-[11px] font-bold text-[#2C2520] uppercase tracking-widest mb-4">Extraction Log</h3>
      <div className="space-y-2 md:max-h-85 h-full overflow-y-auto">
        {images.map((img, idx) => (
          <div  key={img.id} className="flex flex-col gap-10 h-full w-full px-5">
          <div key={img.id} className="flex justify-between items-center text-[9px] border-b border-gray-200 pb-1">
            <span className="text-gray-600 font-bold">UNIT_{String(idx + 1).padStart(2, '0')}</span>
            <span className={img.status === 'completed' ? 'text-[#D4AF37]' : 'text-gray-400'}>
              {img.status.toUpperCase()}
            </span>
              
          </div>
          {segments.length > 0 ? (
        <div className="space-y-6 bg-[#483C32]">
          {segments.map((seg) => (
            <div 
              key={seg.id}
              onClick={() => setEditingId(seg.id)}
              className={`relative group pl-6 border-l-2 transition-all cursor-pointer py-2 ${
                editingId === seg.id 
                ? 'border-[#D4AF37] bg-white/5 rounded-r-2xl' 
                : 'border-white/10 hover:border-white/30'
              }`}
            >
              {/* Role Tag - Floating High-Contrast Label */}
              <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm transition-all ${
                editingId === seg.id ? 'bg-[#D4AF37] text-[#2C2520]' : 'bg-[#483C32] text-white/40'
              }`}>
                {seg.role} {seg.role === 'subheader' || seg.role === 'paragraph' ? seg.index : ''}
              </div>

              {editingId === seg.id ? (
                /* --- EDIT MODE --- */
                <textarea
                  autoFocus
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-[#F2F0E9] resize-none overflow-hidden leading-relaxed"
                  value={seg.content}
                  onChange={(e) => handleSegmentChange(seg.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  rows={seg.content.length / 45 + 1}
                />
              ) : (
                /* --- DISPLAY MODE (App Theme Typography) --- */
                <div className="space-y-2">
              
                  {seg.role === 'subheader' && (
                    <h2 className="text-sm font-bold text-[#F2F0E9] uppercase tracking-wide opacity-90">
                      {seg.content}
                    </h2>
                  )}

                   {seg.role === 'lists' && (
                    <ol className="list-disc list-inside text-[#F2F0E9]">
                      <li>{seg.content}</li>
                  </ol>
                  )}

                  {seg.role === 'paragraph' && (
                    <p className="text-xs text-[#F2F0E9]/70 leading-relaxed font-medium">
                      {seg.content}
                    </p>
                  )}
                  {seg.role === 'conclusion' && (
                    <p className="text-xs italic font-bold text-[#D4AF37] pt-4 border-t border-white/5">
                      {seg.content}
                    </p>
                  )}
                  {(seg.role === 'header' ) && (
      <p className="text-[13.5px] font-semibold text-[#D4AF37] tracking-[0.3em] uppercase mb-4 ">
        { seg.content}
      </p>
    )}
    
    {seg.role === 'title' && (
      <h1 className="text-2xl font-serif font-black text-[#D4AF37] italic uppercase mb-6 leading-tight">
        {seg.content}
      </h1>
    )}

                  {seg.role === 'reference' && (
                    <h2 className="text-lg text-[#F2F0E9]/70 italic leading-relaxed font-medium">
                      {seg.content}
                    </h2>
                  )}

    {seg.role === 'introduction' && (
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">

        <p className="text-xs text-[#F2F0E9] leading-relaxed italic">{seg.content}</p>
      </div>
    )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="h-full flex flex-col items-center justify-center opacity-10 text-center text-[#F2F0E9]">
          <Terminal className="w-12 h-12 mb-4" />
          <p className="uppercase font-black text-[10px] tracking-[0.3em]">System Idling: Awaiting Input</p>
        </div>
      )}

          </div>
        ))}
      </div>
    </div>

    {images.length > 0 && (
      <button
        onClick={processImages}
        disabled={isProcessing}
        className={`w-full py-4 text-[10px] font-bold tracking-[0.4em] uppercase border-2 transition-all mt-4
          ${isProcessing 
            ? "border-gray-200 text-gray-400" 
            : "border-[#483C32] text-[#2C2520] hover:bg-[#2C2520] hover:text-white"
          }
        `}
      >
        {isProcessing ? "Executing Tesseract Engine..." : "Initiate Reading"}
      </button>
    )}
  </div>
</div>
            </div>
            <div className="w-full flex md:justify-center">
       <button onClick={()=> {
        imageTriggerForPDF();
       }} className="py-[16px] md:w-[179px] w-full px-7 text-white bg-[#2C2520] rounded-2xl text-[14px] leading-5 font-semibold">
      Create PDF
       </button>
            </div>
            </div>
   
  

  )
}
interface SectionProps {
  title: string;
  id: Exclude<SectionId, null>;
  activeId: SectionId;
  setActive: (id: SectionId) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionProps> = ({ title, id, activeId, setActive, icon, children }) => {
  const isOpen = activeId === id;
  return (
    <div className="border-b border-[#483C32]/10 pb-2">
      <button 
        onClick={() => setActive(isOpen ? null : id)}
        className="w-full flex justify-between items-center py-6 text-left group transition-all"
      >
        <div className="flex items-center gap-5">
          <div className={`p-2 rounded-lg transition-all ${isOpen ? 'bg-[#483C32] text-[#F2F0E9]' : 'bg-transparent'}`}>
            {icon}
          </div>
          <h3 className={`text-xl font-serif font-black uppercase tracking-tight transition-colors ${isOpen ? 'text-[#483C32]' : 'text-[#483C32]/40'}`}>
            {title}
          </h3>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-[#D4AF37]' : 'text-[#483C32]/20'}`} />
      </button>
      {isOpen && (
        <div className="pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const InputField: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#483C32]/40 ml-1">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/50 border border-[#483C32]/10 p-4 rounded-xl text-sm font-medium outline-none focus:border-[#D4AF37] focus:bg-white transition-all shadow-sm"
    />
  </div>
);

const TextArea: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#483C32]/40 ml-1">{label}</label>
    <textarea 
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/50 border border-[#483C32]/10 p-4 rounded-xl text-sm font-medium outline-none focus:border-[#D4AF37] focus:bg-white transition-all shadow-sm resize-none"
    />
  </div>

);
export default ImageAssessment