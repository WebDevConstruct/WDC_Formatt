'use client';
import { useState } from 'react';
import { Settings2, FileText, Send, 
 Terminal, Monitor, Layers, Layout, ChevronDown, Plus, Trash2,} from "lucide-react";
import { useGlobalContext } from '@/app/Context';
import Image from "next/image";
import { useUser } from '@clerk/nextjs';
import Link from "next/link";
import { studentDataType } from '@/scripts/templatetypes';
import { Modal } from '@/components/Modal';
import PDFGeneratingLoader from "@/app/components/PDFGenerationLoader";
import {FileIcon, SpatulaIcon} from "@/app/components/PDFGenerationLoader";
import TrackDropDown from "@/app/components/TrackdropDown";
import {TrackType} from "@/app/components/TrackdropDown";
import {LetterDataConfigType} from "@/lib/pdfEngine";

export const dynamic = 'force-dynamic';

export const formData = {
  "assignment_title": "Speed: The Velocity of Innovation",
  "subheader": "Course: Finance & Tech Integration (FTI 301)",
  "student_name": "Oladimeji Balogun",
  "submission_date": "October 24, 2026",
  "body_content": "The intersection of speed and creative thinking defines the modern frontier of financial technology. In building scalable financial systems, speed is not merely a performance metric but a strategic requirement. When developing predictive payment models, the ability to process vast arrays of statistical data—including regression analysis and ANOVA—at high velocity determines the utility of the tool for finance professionals. This assignment explores how assistive AI tools, integrated via stacks like React, Next.js, and Prisma, can reduce the latency between a financial hypothesis and its technical execution. By mastering atomic habits in our coding workflow, we ensure that the systems we build are not just fast, but inherently robust and adaptable to the volatile nature of global markets.",
  "references": "1. Housel, M. (2020). The Psychology of Money. \n2. Clear, J. (2018). Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones. \n3. Garcia, H. & Miralles, F. (2016). Ikigai: The Japanese Secret to a Long and Happy Life. \n4. Deisenroth, M. P. (2020). Mathematics for Machine Learning."
}


const chunkData = `# TITLE: SUSTAINABLE ARCHITECTURAL FRAMEWORKS

## HEADER: CORE DESIGN PRINCIPLES

## SUBHEADER: Environmental Integration
### PARAGRAPH: Modern architecture must prioritize environmental harmony...
### LIST: Passive solar orientation
### LIST: High-thermal mass insulation
### LIST: Rainwater harvesting systems

## SUBHEADER: Structural Integrity
### PARAGRAPH: The foundation of any enduring system...
### LIST: Reinforced concrete foundations
### LIST: Modular steel framing
### LIST: Seismic dampening technologies

## CONCLUSION: Sustainable design is not merely a trend...

# REFERENCES: Journal of Sustainable Urbanism, 2025...`
interface SectionProps {
  title: string;
  id: Exclude<SectionId, null>;
  activeId: SectionId;
  setActive: (id: SectionId) => void ;
  icon: React.ReactNode;
  children: React.ReactNode;
}


//Additional COVER BLOCK

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
const TextArea: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="text-[12px] leading-[16px] font-black uppercase tracking-[0.2em] text-[#483C32]/40 ml-1">{label}</label>
    <textarea 
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/50 border border-[#483C32]/10 p-4 rounded-xl text-sm font-medium outline-none focus:border-[#D4AF37] focus:bg-white transition-all shadow-sm resize-none"
    />
  </div>
);

interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const InputField: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-0">
    <label className="text-[12px] leading-[16px] font-black 
    uppercase tracking-[0.2em] text-[#483C32]/40 ml-1">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/50 border border-[#483C32]/10 p-4 
      rounded-xl text-sm font-medium outline-none focus:border-[#D4AF37]
       focus:bg-white transition-all shadow-sm"
    />
  </div>
);





type FormatDropDownType = {
  label : string,
  Format : "HeaderFormat" | "SubHeaderFormat"
  arrayValue : Array<FormatTypes>
}



//The Roles played by each formatted text in the PDF.
// 1. Define the Anatomy of the Document
export type TextRole = 'title' | 'subheader' | 'paragraph' | "lists" | 'conclusion' |"introduction" | "header" | "reference" | "sign-off";

export interface DocumentSegment {
  id: string;
  role: TextRole;
  content : string;
  index: number;
 // FormattedText : FormattedText 
}

export interface AssessmentState {
  segments: DocumentSegment[];
  isProcessing: boolean;
}
// 2. Add these to your component state

// FORMATTED TEXT TYPES



type FormatTypes = {
  id : number,
  Format : string,
  selected : boolean,
}


interface ContentBlock {
  id: number;
  subHeader: string;
  paragraph: string;
}

export interface MetadataState {
  cover: {
    author: string;
    topic: string;
    recipient: string;
  };

}


const getStyleOptions = (role: string) => {
  const options = {
    header: ['Bold', 'Uppercase', 'Letter-Spacing'],
    paragraph: ['FontSize', 'LineHeight', 'Underline'],
    subheader: ['Bold', 'Italic', 'Underline']
  };
  return options[role as keyof typeof options] || [];
};
type SectionId = 'cover'  | null;



export default function QuickAssessment() {
  const [trackChange, setTrackChange] = useState<TrackType>('assignment');
  const [loadingState, setLoadingState] = useState<boolean>(false);
   const [creatingPDFState, setCreatingPDFState] = useState<boolean>(false)
  const [openSection, setOpenSection] = useState<SectionId>('cover');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: 0, subHeader: '', paragraph: '' }
  ]);

  // 2. Metadata State
  const [meta, setMeta] = useState<MetadataState>({
    cover: { author: '', topic: '', recipient: '' },
 
});





//const [courseType, setCourseType] = useState("main");
const { prompt, setPrompt,
      intent, setIntent,

      wordCount, setWordCount} = useGlobalContext()
//const [isStreaming, setIsStreaming] = useState(false);
//const [isProcessingRoles, setIsProcessingRoles] = useState(false);
const [courseType, setCourseType] = useState("main");
const [editMode, setEditMode] = useState(false)
const {user} = useUser();

const [segments, setSegments] = useState<DocumentSegment[]>([]);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
const [bodyReq, setBodyReq] = useState<studentDataType>( {
    assignment_title:  meta?.cover?.topic ? meta?.cover?.topic : "",
    student_name:   meta?.cover?.author ? meta?.cover?.author: user ?
     `${user?.firstName ? user?.firstName + " " + user?.lastName : user?.username }` : "",

     recipientName :  meta?.cover?.recipient ? meta?.cover?.recipient : "" , 
     
    intro_title:'',
    intro_content:'',
    body_title: [],
    lists : [],
    body_content: [],
    concl_title : "",
    concl_content: [],
    references: ""
  })

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

  //FILTERING OUT THE DOCUMENT ROLES FOR EASY MODIFICATION
//console.log(contentBlocks);
  //The Chunk Parser
  function parseChunk(rawText: string): studentDataType {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log(lines);
 let listCounter = 1;

  const data: studentDataType =  {
    assignment_title:  meta?.cover?.topic ? meta?.cover?.topic : "", 
    student_name:   meta?.cover?.author ? meta?.cover?.author: user ?
     `${user?.firstName ? user?.firstName + " " + user?.lastName : user?.username }` : "",
     recipientName :  meta?.cover?.recipient ? meta?.cover?.recipient : "" , 
    intro_title : "" , 

    intro_content: "",
    body_title:  [],
    lists : [],
    body_content: [],
    concl_title : "",
    concl_content: [],
    references:  ""
  };

  let currentSection: 'intro' | 'body' | 'concl' | 'refs' = 'intro';
//let useAlphaList = false;
  lines.forEach((line, index) => {
    // 1. Detect Tags and Metadata
    if (line.startsWith('# TITLE:') ) {
      data.assignment_title =  meta?.cover?.topic ? meta?.cover?.topic :  line.replace('# TITLE:', '').trim()
      const actualContent = meta?.cover?.topic ? meta?.cover?.topic : 
      line.replace('# TITLE:', '').trim();
      segments?.push({
       id : `seg-${crypto.randomUUID()}`,
       role : "title",
      content : actualContent,
       index : index,
      
      })
      return;
    }
    if (line.startsWith('# HEADER:')) {
      data.intro_title = line.replace('# HEADER:', '').trim();
        const actualContent = line.replace('# HEADER:', '').trim();
          segments?.push({
       id : `seg-${crypto.randomUUID()}`,
       role : "header",
       content : actualContent,
       index : index,

      })
      return;
    }
    
    // 2. Section Switching Logic
    if (line.startsWith('## INTRODUCTION:')) {
      data.intro_content = line.replace('## INTRODUCTION:', '').trim();
       const actualContent = line.replace('## INTRODUCTION:', '').trim();
          segments?.push({
       id : `seg-${crypto.randomUUID()}`,
       role : "introduction",
    content : actualContent,
       index : index,
     
      })
      currentSection = 'intro';
      return;
    }
    if (line.startsWith('## SUBHEADER:')) {
 const actualContent = line.replace('## SUBHEADER:', '').trim()
      currentSection = 'body'; 
      data.body_content.push({
        id: crypto.randomUUID(), // Native unique ID
        role: "subheader",
    content: line.replace('## SUBHEADER:', '').trim(),
        index: index
      });
       //  const actualContent = line.replace('## SUBHEADER:', '').trim();
          segments?.push({
       id : `seg-${crypto.randomUUID()}`,
       role : "subheader",
    content : actualContent,
       index : index,
      })

      listCounter = 1; // Reset numbering for new section
     // const content = line.replace('## SUBHEADER:', '').trim();
      //let useAlphaList= /^\d/.test(content); // N
      return;
    }
    if (line.startsWith('## CONCLUSION:')) {
      const concContent =  line.replace('## CONCLUSION:', '').trim();
      currentSection = 'concl';
      data.concl_content.push({
        id: crypto.randomUUID(), // Native unique ID
        role: "conclusion",
        content: line.replace('## CONCLUSION:', '').trim(),
        index : index
      });
       
          segments?.push({
       id : `seg-${crypto.randomUUID()}`,
       role : "conclusion",
      content : concContent,
       index : index,
    
      })
  
      //   segments?.push({
      //  id : `seg-${crypto.randomUUID()}`,
      //  role : "paragraph",
      //  content : actualContent,
      //  index : index
      // })
      return;
    }
    if (line.startsWith('# REFERENCES:')) {
      currentSection = 'refs';
      data.references = line.replace('# REFERENCES:', '').trim();
      return;
    }

    // 3. Content Allocation
    const cleanContent = line.replace('### PARAGRAPH:', '').replace('### LIST:', '').trim();

    if (currentSection === 'body') {

   // const marker = useAlphaList ? `${String.fromCharCode(96 + listCounter)}.` : `${listCounter}.`;
          data.body_content.push({
            id: `seg-${crypto.randomUUID()}`,
            role: line.startsWith('### LIST:') ? "lists" : "paragraph",
           content: line.startsWith('### LIST:') ?   ` ${cleanContent}` : cleanContent,
            index: index,
  
          });
          if(line?.startsWith("### LIST:")){
          listCounter++;
          }
      //if lists
     
      //if paragraphs
         segments?.push({
       id : `seg-${crypto?.randomUUID()}`,
       role :line.startsWith('### LIST:') ? "lists" : "paragraph",
     content : cleanContent,
       index :index,

      })

    } else if (currentSection === 'concl') {
        const actualContent = line.replace('## CONCLUSION:', '').replace('### PARAGRAPH:', '').trim();
      data.concl_content.push({
        id: `seg-${crypto?.randomUUID()}`,
        role: "paragraph",
       content: cleanContent,
        index: index,
  
      
      });
      
        segments?.push({
       id : `seg-${crypto?.randomUUID()}`,
       role : line?.startsWith("## CONCLUSION") ? "conclusion" : "paragraph",
      content : actualContent,
    index : index,

      })
      //THE SUBCONTENT UNDER CONCLUSION
     
    } else if (currentSection === 'refs') {
      data.references += (data.references ? "\n" : "") + cleanContent;
         const actualContent = line.replace('### PARAGRAPH:', '').trim();
          segments?.push({
       id : `seg-${crypto.randomUUID()}`,
       role : "reference",
       content : actualContent,
       index : index,
      })
    }
  });
  setBodyReq(data);
  return data;

  
}
// const [letterReq, setLetterReq] = useState<LetterDataConfigType>({
//     sender_name :'',
//       recipient_name : "",
//       letter_title :  "",
//       salutation : ``,
//       content : [],
//       templateName : "ACADEMIC_ASSIGNMENT",
//       phone : "",
//       email : "",
//       address : "",
//       conclusion : ""
//   })

//Parse Output for letter


//console.log(subheaderSort);
const generateAssignment = async()=> {
  setEditMode(false)
  const body = {
      templateName : "ACADEMIC_ASSIGNMENT",
      userInput : bodyReq,
      contentBlock : contentBlocks
    }
    console.log(body);
     const {userInput} = body;
  try {
    setCreatingPDFState(true)
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
  alert("Request failed why trying to generate your pdf")
  throw new Error("Could not Create the Assignment");
}finally{
  setCreatingPDFState(false)
}
}

   const startAssessment = (chunkValue : string) => {
  //  setIsParsing(true);
    setEditMode(true)
    console.log(chunkValue)
   // setSegments([]);
  parseChunk(chunkValue)
    // parseLetterOutput(chunkValue)
 
    
    // Simulate gradual UI appearance
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(chunkValue.slice(0, i));
      i += 5;
      if (i > chunkValue.length) {
        clearInterval(interval);
        setIsParsing(false);
      }
    }, 1000);
  };



//Letter

//To Call based on Track

//console.log("SEGMENTS", segments)

//const paragraph = segments.filter((item)=> ( item?.role === "paragraph"));



//GETTING THE CHUNK OF TEXT FROM AI SDK
const [chunkdata, setChunkData] = useState("")
  const handleGenerate = async () => {
  
  
    setEditMode(false)

    try {
      setLoadingState(true)
   const response = await fetch("/api/quickassessment", {
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      credentials : "include",
      body : JSON.stringify({
        prompt, 
        intent,
        wordCount,
        track : "assignment",
        
      })
      
     })
     if(response.ok){
         setIsParsing(true);
      const data = await response.text();
     

      setChunkData(data?.toString());
     //  if(typeof chunkData === "string"){
  
        startAssessment(data?.toString())
     
     //  }
      
     console.log("Stream data Expected:", data)
     }else{
alert("WDC_FORMATT AI is currently down.")
    return;
     }

        }
    
     catch (error) {
      console.error("Axios Stream failed:", error);
      alert("WDC_FORMATT AI is currently down.")
    } finally {
      setLoadingState(false)
      setIsParsing(false);
    }
  };
//Filter the headerFormats to known which of both or both goes to the backend
const [editingId, setEditingId] = useState<string | null>(null);
const [livePreviewDefault, setLivePreviewDefault] = useState("review")
const [editProp, setEditProp] = useState({
  titleState : false, introTitleState : false,
   introContentState : false, concl_ContentState : false, referenceState : false ,
   concl_TitleState : false
})
// Update a specific segment's content in the state
const handleSegmentChange = (id: string, newContent: string, role : string) => {
  setSegments(prev => prev.map(seg => 
    seg.id === id ? { ...seg, content: newContent } : seg
  ));
//   if(role === "header"){
// setBodyReq((prev)=> ({...prev, assignment_title : newContent}))
//   }else if(role === "conclusion"){
//      setBodyReq((prev)=> ({...prev, conclusion_title : newContent}))
//   }
//   const findRole = bodyReq?.body_content?.find(item => item?.id === id)
//   console.log(findRole);


// console.log("segemntOnChange", findRole);
// console.log()
};

//PROPOGATION FOR LISTS;


const updateListStyle = (newType: 'bullet' | 'number') => {
  setBodyReq((prev) => ({
    ...prev,
    body_content: prev.body_content.map((seg, index) => {
      if (seg.role === 'lists') {
        return { 
          ...seg, 
          listStyle: { type: newType, startAt: newType === 'number' ? index + 1 : 1 } 
        };
      }
      return seg;
    })
  }));
};
  return (
//NEW DESIGN
<div className="min-h-screen bg-[#F2F0E9] text-[#483C32] p-4 md:p-10 font-sans selection:bg-[#483C32]
 selection:text-[#D4AF37] w-full">
       <Link href="/dashboard/Files" 
      className ="flex gap-2 items-center my-4">
        <Image src="/ArrowBack.svg" alt="Back to Dashboard" width={24} height={24}/>
        <p className="text-lg font-bold text-[#483C32]/80 hover:opacity-90 hover:text-[17px]">
        Files Engine Room</p>  
      </Link>
      <div className="w-full flex justify-center  mx-auto  gap-8 ">
        
        {/* --- LEFT SIDE: THE CONFIGURATION FORM --- */}
        <div className="space-y-8 justify-center flex flex-col items-center w-full md:w-3/4">
          <header className="space-y-2 border-l-4 border-[#D4AF37] pl-6 flex flex-col items-start w-full">
            <h1 className="text-4xl font-serif font-black text-[#483C32] uppercase tracking-tighter italic">Document Architect</h1>
            <p className="text-[#483C32]/60 text-xs font-bold uppercase flex gap-1 tracking-widest text-start items-start">
              <Layers className="w-3 h-3" /> What Can I do for you today
               <span className="text-[#D4AF37] italic">{" "}{user?.username ? user?.username : ""}</span>?
            </p>
          </header>
    <div className="w-full">
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
              onChange={(val) => {
                setMeta({...meta, cover: {...meta.cover, author: val}})
              
              //  setSegments((value)=> value["title"])
              }}
            />
            <InputField 
              label="Topic" 
              value={meta.cover.topic}
              onChange={(val) => setMeta({...meta, cover: {...meta.cover, topic: val}})}
            />
            <InputField 
              label="Submitted To" 
              value={meta.cover.recipient}
              onChange={(val) => setMeta({...meta, cover: {...meta.cover, recipient: val}})}
            />
          </div>
           <div className="space-y-6 pt-4">
            {contentBlocks.map((block, index) => (
              <div key={block.id} className="p-6 bg-white/40 border border-[#483C32]/10 rounded-2xl relative group">
                {/* <div className="absolute -left-3 top-6 bg-[#483C32] text-[#F2F0E9] text-[9px] px-2 py-1 rounded font-black tracking-widest">
                  BLOCK 0{index + 1}
                </div> */}
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
                    label="Label" 
                    value={block.subHeader}
                    onChange={(val) => updateContentBlock(block.id, 'subHeader', val)}
                  />
                  <TextArea 
                    label="Value" 
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
    </div>
          <form onSubmit={(e : React.FormEvent)=> {
            e.preventDefault()
           // startAssessment()
          }} 
            className="space-y-8 w-full">
            
            {/* 1. Prompt & Intent */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-[#483C32]">
                  <FileText className="w-6 h-6 text-[#D4AF37]" /> The Prompt (Actual Assessment)
                </label>
                <textarea 
                  placeholder="Paste the core assessment content here. Avoid adding instructions..."
                  className="w-full h-32 bg-[#F2F0E9] border-2 border-[#483C32] p-4 rounded-2xl
                   text-base leading-relaxed font-medium focus:border-[#D4AF37] outline-none transition-all resize-none 
                   shadow-[6px_6px_0px_0px_rgba(72,60,50,1)]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-[#483C32]">
                  <Settings2 className="w-6 h-6 text-[#D4AF37]" /> Intent / Strategy (Instructions)
                </label>
                <textarea 
                  placeholder="Define the prompt strategy (e.g., Use Nigerian case studies, keep tone formal)..."
                  className="w-full h-32 bg-white/40 border-2 border-[#483C32]/20 p-4 rounded-2xl
                   font-medium text-base leading-relaxed focus:border-[#483C32] outline-none transition-all resize-none shadow-sm"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Word Count */}
            <div className="max-w-xs space-y-2">
                <label className="text-sm font-black uppercase tracking-[0.2em] flex items-center text-[#483C32]">Word Count</label>
                <input 
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full bg-[#F2F0E9] border-2 border-[#483C32] p-3 text-base rounded-xl font-bold text-[#483C32] outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
                />
            </div>

            {/* 3. Toggle & System Specs */}

            {/* 4. Generate Button */}
            <button  onClick={()=> {
              //  setEditMode(true);
             
             handleGenerate();
              }}
              type="submit"
              className="w-full bg-[#483C32] text-[#F2F0E9] py-5 rounded-2xl
               font-black uppercase tracking-[0.4em] shadow-xl 
               shadow-[#483C32]/20 hover:shadow-none hover:translate-y-1 hover:bg-[#2C2520] transition-all 
               flex items-center justify-center gap-4 group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform
               text-[#D4AF37]" />
              Generate PDF
            </button>
          </form>
        </div>

        {/* --- RIGHT SIDE: LIVE STREAM (Obsidian Style) --- */}
        {editMode && (
          <Modal onClose={()=> {
            setEditMode(false)
            setLivePreviewDefault("review")
          }} isOpen={editMode} >
<div className={`w-full relative   top-1/2 lg:top-0 lg:block`}>
  
  <div className="sticky top-10 h-[calc(100vh-80px)] w-full
   bg-white rounded-[3rem] border-4 border-black/10 overflow-hidden
    shadow-2xl flex flex-col">
    
    {/* Header */}
    <div className="p-6 bg-black flex justify-between items-center text-white border-b border-white/20">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-white" />
        <span className="text-xs font-black tracking-widest uppercase italic">Architectural Preview</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          <button onClick={()=> {
            setLivePreviewDefault("edit")

          }}
           className="text-md rounded-lg font-semibold leading-4 text-black py-3 px-3 bg-white">
            Edit Mode
          </button>
        </div>
      </div>
    </div>

    {/* The Interactive Stream */}
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white space-y-4">
      
      {bodyReq?.body_content.length && bodyReq ? (
        <div className="space-y-6">
          
          {/* Handling Title State */}
          <div className="relative">
            <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest 
            rounded-sm transition  ${
                editProp?.titleState  ? 'bg-black text-white' : 'bg-gray-200 text-black/40'
              }`}>
            {livePreviewDefault === "edit" && (
                <p className={``}>TITLE
              </p>

            )}
            </div>
            {editProp?.titleState === true && livePreviewDefault === "edit" ? (
              <textarea
                autoFocus
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-black resize-none overflow-hidden leading-relaxed"
                value={bodyReq?.assignment_title}
                onChange={(e) => setBodyReq((prev)=> ({...prev, assignment_title :  e.target.value }))}
                onBlur={() => setEditingId(null)}
                rows={7}
              />
            ) : (bodyReq?.assignment_title && (
              <p onClick={()=> {setEditProp((prev)=> ({...prev, titleState : true}))}}
                 className="text-2xl font-serif font-black text-black italic uppercase mb-6 leading-tight">
                {bodyReq?.assignment_title}
              </p>
            ))}
          </div>

          {/* Intro Title */}
          <div className="relative">
          
             <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] font-black uppercase 
             tracking-widest rounded-sm transition-all `}>
                {livePreviewDefault === "edit" && (
                <p className={` ${
                editProp?.introTitleState   ? 'bg-black text-white' : 'bg-gray-200 text-black/40'
              }`}> introduction Title
              </p>

                 )}
              </div>
            {editProp?.introTitleState === true &&  livePreviewDefault === "edit" ? (
              <textarea
                autoFocus
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-black resize-none overflow-hidden leading-relaxed"
                value={bodyReq?.intro_title}
                onChange={(e) => setBodyReq((prev)=> ({...prev, intro_title :  e.target.value }))}
                onBlur={() => setEditingId(null)}
                rows={7}
              />
            ) : (bodyReq?.intro_title && (
              <p onClick={()=> {setEditProp((prev)=> ({...prev, introTitleState : true}))}}
                 className="text-lg font-serif font-black text-black italic uppercase mb-6 leading-tight">
                {bodyReq?.intro_title}
              </p>
            ))}
          </div>

          {/* Intro Content */}
          <div className="relative">
            <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] 
              font-black uppercase tracking-widest rounded-sm transition-all ${
                editProp?.introContentState   ? 'bg-black text-white' : 'bg-gray-200 text-black/40'
              }`}>
                {livePreviewDefault === "edit" && (
                <p className={` `}> introduction Content
              </p>

                 )}
            </div>
            {editProp?.introContentState === true && livePreviewDefault === "edit" ? (
              <textarea
                autoFocus
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-black resize-none overflow-hidden leading-relaxed"
                value={bodyReq?.intro_content}
                onChange={(e) => setBodyReq((prev)=> ({...prev, intro_content :  e.target.value }))}
                onBlur={() => setEditingId(null)}
                rows={7}
              />
            ) : (bodyReq?.intro_content && (
              <p onClick={()=> {setEditProp((prev)=> ({...prev, introContentState : true}))}}
                 className="text-base font-serif font-black text-black/70 italic uppercase mb-6 leading-tight">
                {bodyReq?.intro_content}
              </p>
            ))}
          </div>

          {/* Body Segments */}
          {bodyReq?.body_content.map((seg) => (
            <div key={seg.id}
                 onClick={() => {
                   setEditingId(seg.id);
                   setEditProp({ titleState: false, introTitleState: false, introContentState: false, concl_ContentState: false, referenceState: false, concl_TitleState: false });
                 }}
                 className={`relative group pl-6 border-l-2 
                 transition-all cursor-pointer py-2 `}>
                <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] 
              font-black uppercase tracking-widest rounded-sm transition-all  ${
 editingId !== seg.id ? 'border-black bg-gray-50 rounded-r-2xl' : 'border-black/10 hover:border-black/30 bg-black text-white'
                 
              }`}>
                {livePreviewDefault === "edit" && (
                <p className={` `}> {seg?.role}
              </p>
          

                 )}
                 </div>

              {editingId === seg.id && livePreviewDefault === "edit" ? (
                <div key={seg?.id}>
                <textarea
                  autoFocus
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-black resize-none overflow-hidden leading-relaxed"
                  value={seg.content}
                  onChange={(e) => handleSegmentChange(seg.id, e.target.value, seg?.role)}
                  onBlur={() => setEditingId(null)}
                  rows={seg.content.length / 45 + 1}
                  
                />
                </div>
              ) : (
                <div className="space-y-2">
                  {seg.role === 'subheader' && <h2 className="text-sm font-bold text-black uppercase tracking-wide opacity-90">{seg.content}</h2>}
                  {seg.role === 'lists' && <ol className="list-disc list-inside text-black">{<li>{seg.content}</li>}</ol>}
                  {seg.role === 'paragraph' && <p className="text-xs text-black/70 leading-relaxed font-medium">{seg.content}</p>}
                </div>
              )}
            </div>
          ))}

         {/* CONCLUSION TITLE */}
<div className="relative">
  <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm transition-all `}>
       {livePreviewDefault === "edit" && (
                <p className={` ${
                editProp?.concl_TitleState   ? 'bg-black text-white' : 'bg-gray-200 text-black/40'
              }`}> conclusion title
              </p>

            )}
            </div>
  {editProp?.concl_TitleState === true && livePreviewDefault === "edit" ? (
    <textarea
      autoFocus
      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-black resize-none overflow-hidden leading-relaxed"
      value={bodyReq?.concl_title}
      onChange={(e) => setBodyReq((prev) => ({...prev, concl_title: e.target.value}))}
      onBlur={() => setEditingId(null)}
      rows={7}
    />
  ) : (bodyReq?.concl_title && (
    <p onClick={() => setEditProp((prev) => ({...prev, concl_TitleState: true}))}
       className="text-base font-serif font-black text-black/70 italic uppercase mb-6 leading-tight cursor-pointer">
      {bodyReq?.concl_title}
    </p>
  ))}
</div>

{/* CONCLUSION PARAGRAPHS */}
<div className="relative">
  <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm
   transition-all ${
                editProp?.concl_ContentState   ? 'bg-black text-white' : 'bg-gray-200 text-black/40'
              }`}>
     {livePreviewDefault === "edit" && (
                <p className={` `}> conclusion paragraphs
              </p>

            )}
  </div>
  {bodyReq?.concl_content?.map((item, index) => (
    editProp?.concl_ContentState && livePreviewDefault === "edit" ? (
      <div key ={index}>
      
  <div className="absolute -top-12 left-0 z-50">
    

  </div>

      <textarea
        key={index}
        autoFocus
        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-black resize-none overflow-hidden leading-relaxed"
        value={item?.content}
        onChange={(e) => setBodyReq((prev) => ({...prev, concl_content: [{
          id: item?.id,
          role: item?.role,
          content: item?.id ? e.target.value : item?.content,
          index: item?.index,
        }]}))}
        onBlur={() => setEditingId(null)}
        rows={item.content.length / 45 + 1}
      />
      </div>
    ) : (
      <p key={index}
         onClick={() => setEditProp((prev) => ({...prev, concl_ContentState: true}))}
         className="text-base font-serif font-black text-black/70 cursor-pointer">
        {item?.content}
      </p>
    )
  ))}
</div>

{/* REFERENCE SECTION */}
<div className="relative">
  <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest
   rounded-sm transition-all`}>
   {livePreviewDefault === "edit" && (
                <p className={` ${
                editProp?.referenceState   ? 'bg-black text-white' : 'bg-gray-200 text-black/40'
              }`}> reference
              </p>

            )}
  </div>
  {editProp?.referenceState === true && livePreviewDefault === "edit" ? (
    <textarea
      autoFocus
      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-black resize-none overflow-hidden leading-relaxed"
      value={bodyReq?.references}
      onChange={(e) => setBodyReq((prev) => ({...prev, references: e.target.value}))}
      onBlur={() => setEditingId(null)}
      rows={7}
    />
  ) : (bodyReq?.references && (
    <p onClick={() => setEditProp((prev) => ({...prev, referenceState: true}))}
       className="text-base font-serif font-black text-black/70 italic uppercase mb-6 leading-tight cursor-pointer">
      {bodyReq?.references}
    </p>
  ))}
</div>
          
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center opacity-10 text-center text-black">
          <Terminal className="w-12 h-12 mb-4" />
          <p className="uppercase font-black text-[10px] tracking-[0.3em]">System Idling: Awaiting Input</p>
        </div>
      )}
    </div>

    {/* Footer */}
    <div className="flex flex-col gap-5 p-10 border-t border-black/5">
      <div className="p-4 bg-gray-100 flex justify-between items-center px-8">
        <span className="text-[9px] font-black uppercase text-black/20 tracking-widest">Active Segments: {segments.length}</span>
        <span className="text-[9px] font-black uppercase text-black animate-pulse">Live Sync Active</span>
      </div>

      <div className="w-full justify-center items-center flex gap-4">
      {segments?.length > 0 && (
        <button onClick={() => {
        generateAssignment();
        }}
                className='bg-black py-4 text-white px-4 rounded-lg text-[12px] uppercase font-bold tracking-widest shadow-md hover:bg-black/80 transition-all'>
          Done
        </button>
        
      )}
       <button onClick={() => {
         handleGenerate()
        }}
                className='bg-white py-4 text-black px-4 rounded-lg text-[12px] border-black
                uppercase font-bold tracking-widest shadow-md hover:bg-black/80 transition-all'>
          Retry
        </button>
      </div>
    </div>
  </div>
</div>
</Modal>
        )}
        {loadingState && <PDFGeneratingLoader mainText="Preparing your Content" description="Formatt is formatting the AI output" component={<SpatulaIcon />} />}
        {creatingPDFState && <PDFGeneratingLoader mainText="Creating your PDF" description="Formatt is generating the PDF file" component={<FileIcon />} />}
      </div>
    </div>


//  <div className="relative">
//   <div className={`absolute -left-2 top-0 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm transition-all ${
//                 editProp?.referenceState ? 'bg-[#D4AF37] text-[#2C2520]' : 'bg-[#483C32] text-white/40'
//               }`}>
//                 {"Reference"} 
//               </div>
//             {editProp?.referenceState === true ?  (
              
//                 <textarea
//                   autoFocus
//                   className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-[#F2F0E9] resize-none overflow-hidden leading-relaxed"
//                   value={bodyReq?.references}
//                   onChange={(e) => setBodyReq((prev)=> ({...prev, references : e.target.value}))}
//                   onBlur={() => setEditingId(null)}
//                   rows={7}
//                 />
//       ) :( bodyReq?.references && (

        
//       <p  onClick={()=> {setEditProp((prev)=>  ({...prev, referenceState : true}))}}
//        className="text-base font-serif font-black text-[#F2F0E9]/70 italic uppercase mb-6 leading-tight">
//        {bodyReq?.references}
//       </p>
      
//     ))}
//     </div>

    // OLD DESIGN
//  <div className="min-h-screen bg-[#F5F5DC] text-[#5C4033] p-4 md:p-10 font-sans selection:bg-[#8B0000] selection:text-[#F5F5DC]">
      
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
//         {/* --- LEFT SIDE: THE CONFIGURATION FORM --- */}
//         <div className="lg:col-span-7 space-y-8">
//           <header className="space-y-2 border-l-4 border-[#8B0000] pl-6">
//             <h1 className="text-4xl font-black text-[#8B0000] uppercase 
//             tracking-tighter italic">Document Architect</h1>
//             <p className="text-xs font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
//               <Layers className="w-3 h-3" /> System Version: 30-Day Beta Cycle
//             </p>
//           </header>

//           <form onSubmit={(e : React.FormEvent)=> {
//             e.preventDefault()
//             generateAssignment()
//           // handleGenerate()
//           }} 
//            className="space-y-8">
//             {/* 1. Prompt & Intent */}
//             <div className="space-y-2">
//               <div className="space-y-2">
//                 <label className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2">
//                   <FileText className="w-10 h-10 text-[#8B0000]" /> The Prompt (Actual Assessment)
//                 </label>
//                 <textarea 
//                   placeholder="Paste the core assessment content here. Avoid adding instructions..."
//                   className="w-full h-32 bg-[#F5F5DC] border-2 border-[#5C4033] p-4 rounded-2xl
//                    text-base leading-6.5
//                   font-medium focus:border-[#8B0000] outline-none transition-all resize-none 
//                   shadow-[6px_6px_0px_0px_rgba(92,64,51,1)]"
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2">
//                   <Settings2 className="w-10 h-10 text-[#8B0000]" /> Intent / Strategy (Instructions)
//                 </label>
//                 <textarea 
//                   placeholder="Define the prompt strategy (e.g., Use Nigerian case studies, keep tone formal)..."
//                   className="w-full h-32 bg-white/40 border-2 border-[#5C4033]/20 p-4 rounded-2xl
//                    font-medium text-base leading-6.5 focus:border-[#8B0000] outline-none transition-all resize-none"
//                   value={intent}
//                   onChange={(e) => setIntent(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* 2. Format Dropdowns & Word Count */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* <FormatDropdown label="Header Style" Format = "HeaderFormat" arrayValue={hFormat}  />
//               <FormatDropdown label="SubHeader Style" Format = "SubHeaderFormat" arrayValue ={shFormat}  />
//                */}
//               <div className="space-y-2">
//                 <label className="text-base font-black uppercase tracking-[0.2em] flex 
//                 items-center">Word Count</label>
//                 <input 
//                   type="number"
//                   value={wordCount}
//                   onChange={(e) => setWordCount(Number(e.target.value))}
//                   className={"w-full bg-[#F5F5DC] border-2 border-[#5C4033] p-3 text-base rounded-xl  font-bold text-[#8B0000] outline-none focus:ring-2 focus:ring-[#8B0000]"}
//                 />
//               </div>
//             </div>

//             {/* 3. Toggle & System Specs */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#A52A2A]/5 p-6 rounded-[2rem] border border-[#A52A2A]/20">
//               <div className="space-y-4">
//                 <label className="text-[10px] font-black uppercase tracking-[0.2em]">Course Association</label>
//                 <div className="flex gap-2 p-1  rounded-xl">
//                   <button 
//                     type="button"
//                     onClick={() => setCourseType("main")}
//                     className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${courseType === 'main' ? 'bg-[#8B0000] text-[#F5F5DC] shadow-md' : 'text-[#5C4033]'}`}
//                   >MAIN COURSE</button>
//                   <button 
//                     type="button"
//                     onClick={() => setCourseType("borrowed")}
//                     className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${courseType === 'borrowed' ? 'bg-[#8B0000] text-[#F5F5DC] shadow-md' : 'text-[#5C4033]'}`}
//                   >BORROWED / ELECTIVE</button>
//                 </div>
//               </div>

//               <div className="bg-[#F5F5DC] rounded-2xl border border-[#5C4033]/10 p-4">
//                 <SystemSpec label="Header Size" value="14px" />
//                 <SystemSpec label="Paragraph Size" value="11px" />
//                 <SystemSpec label="SubHeader Size" value="12px" />
//                 <SystemSpec label="Margin Index" value="1.0" />
//                 <SystemSpec label="Line Spacing" value="1.5" />
//                 <SystemSpec label="Paragraph Spacing" value="6pt" />
//               </div>
//             </div>

//             {/* 4. Generate Button */}
//             <button 
//               type="submit"
//               className="w-full bg-[#8B0000] text-[#F5F5DC] py-5 rounded-2xl
//                font-black uppercase tracking-[0.4em] shadow-xl 
//               shadow-[#8B0000]/30 hover:shadow-none hover:translate-y-1 transition-all 
//               flex items-center justify-center gap-4 group"
//             >
//               <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               Generate Institutional PDF
//             </button>
//           </form>
//         </div>

//         {/* --- RIGHT SIDE: LIVE STREAM (LARGE SCREEN) --- */}
//         <div className="hidden lg:block lg:col-span-5 relative">
//           <div className="sticky top-10 h-[calc(100vh-80px)] bg-[#5C4033] rounded-[3rem] border-4 border-[#8B0000]/30 overflow-hidden shadow-2xl flex flex-col">
//             <div className="p-6 bg-[#8B0000] flex justify-between items-center text-[#F5F5DC]">
//                <div className="flex items-center gap-2">
//                  <Monitor className="w-4 h-4" />
//                  <span className="text-xs font-black tracking-widest uppercase">Live Process Stream</span>
//                </div>
//                <div className="flex gap-1">
//                  <div className="w-2 h-2 rounded-full bg-[#F5F5DC]/40" /> 
//                  <div className="w-2 h-2 rounded-full bg-[#F5F5DC]/40" />
//                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//                </div>
//             </div>
            
//             <div className="flex-1 p-8 font-mono text-sm text-[#F5F5DC]/80 space-y-4 overflow-y-auto custom-scrollbar">
//               {isStreaming ? (
//                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//                   <p className="text-[#8B0000] font-black">&gt; INITIALIZING GENERATION ENGINE...</p>
//                   <p>&gt; MAPPING STRATEGY: {intent.slice(0, 30)}...</p>
//                   {getSelectedHeaderFormat?.map((item : FormatTypes)=> 
//                   <div key={item?.id} className='gap-2 flex flex-col'>
//                      <h1>&gt; APPLYING HEADER FORMATS-</h1>
//                   <p>&gt; APPLYING FORMATS: BOLD FORMAT: {item?.Format=== "Bold" ? "APPLIED" : "NIL"}</p>
//                       <p>&gt; APPLYING FORMATS: UNDERLINE FORMAT: {item?.Format=== "Underline" ? "APPLIED" : "NIL"}</p>
//                   </div>
//                   )}
//                    {getSelectedSubHeaderFormat?.map((item : FormatTypes)=> 
//                   <div key={item?.id} className='gap-2 flex flex-col'>
//                      <h1>&gt; APPLYING SUB HEADER FORMATS-</h1>
//                   <p>&gt; APPLYING FORMATS: BOLD FORMAT: {item?.Format=== "Bold" ? "APPLIED" : "NIL"}</p>
//                       <p>&gt; APPLYING FORMATS: UNDERLINE FORMAT: {item?.Format=== "Underline" ? "APPLIED" : "NIL"}</p>
//                   </div>
//                   )}
//                   <p>&gt; MARGIN: 1.0 | SPACING: 1.5</p>
//                   <div className="pt-4 border-t border-white/10 text-white italic">
//                     &gt; {prompt}
//                   </div>
//                   <motion.div 
//                     animate={{ opacity: [0, 1] }} 
//                     transition={{ repeat: Infinity, duration: 0.8 }}
//                     className="w-2 h-5 bg-[#8B0000]"
//                   />
//                 </motion.div>
//               ) : (
//                 <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
//                   <Terminal className="w-16 h-16 mb-4" />
//                   <p className="uppercase font-black text-xs tracking-widest">Awaiting Command Input</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* --- MOBILE MODAL: LIVE STREAM (POPUP) --- */}
//       <AnimatePresence>
//         {isStreaming && (
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 lg:hidden"
//           >
//             <div className="absolute inset-0 bg-[#5C4033]/90 backdrop-blur-md" onClick={() => setIsStreaming(false)} />
//             <motion.div 
//               initial={{ y: "100%" }}
//               animate={{ y: 0 }}
//               exit={{ y: "100%" }}
//               className="relative w-full max-w-lg bg-[#5C4033] rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t-8 border-[#8B0000] overflow-hidden flex flex-col h-[75vh] shadow-2xl"
//             >
//               <div className="p-6 flex justify-between items-center text-[#F5F5DC]">
//                 <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
//                   <Zap className="w-4 h-4 text-[#8B0000]" /> Active Generation
//                 </h4>
//                 <button onClick={() => setIsStreaming(false)} className="p-2 bg-white/10 rounded-full hover:bg-[#8B0000] transition-colors">
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//               <div className="flex-1 p-8 font-mono text-xs text-[#F5F5DC]/70 overflow-y-auto space-y-4">
//                 <p className="text-[#8B0000] font-black tracking-tighter underline">SYSTEM LOGS:</p>
//                 <p className="text-white leading-relaxed">&gt; {prompt}</p>
//                 <p>&gt; FORMATTING COMPLETE.</p>
//                 <p>&gt; CALCULATING WORD COUNT: {wordCount} words.</p>
//               </div>
//               <div className="p-6 bg-[#8B0000]/10 border-t border-white/5">
//                 <button className="w-full bg-[#8B0000] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
//                   Finalizing Document...
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//     </div>
  );
}



const SystemSpec = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-1 border-b border-[#483C32]/5 last:border-0">
    <span className="text-[9px] font-black uppercase text-[#483C32]/40 tracking-tighter">{label}</span>
    <span className="text-[10px] font-bold text-[#483C32]">{value}</span>
  </div>
);
