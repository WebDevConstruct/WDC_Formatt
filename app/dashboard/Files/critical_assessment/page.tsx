"use client";

import React, { useState} from 'react';
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

// just a basic component to the text formats label and value
const SystemSpec = ({ label, value }: {label : string, value : string}) => (
  <div className="flex justify-between items-center p-2 border-b border-[#5C4033]/10 text-[10px] font-black uppercase tracking-widest">
    <span className="text-[#5C4033]/60">{label}</span>
    <span className="text-[#8B0000]">{value}</span>
  </div>
);
const CriticalAssessmentArchitect: React.FC = () => {
  // 1. Structural State
  const [openSection, setOpenSection] = useState<SectionId>('cover');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: 0, subHeader: '', paragraph: '' }
  ]);

  // 2. Metadata State
  const [meta, setMeta] = useState<MetadataState>({
    cover: { author: '', topic: '', recipient: '' },
    introduction: '',
    conclusion: '',
    dataSource: ''
  });

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



  //Prompts Generation

 
  const { prompt, setPrompt,
        intent, setIntent,
        wordCount, setWordCount} = useGlobalContext()
  const [isStreaming, setIsStreaming] = useState(false);
    
  
  const [courseType, setCourseType] = useState("main");
  

  
 
   
  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#483C32] py-10 font-sans selection:bg-[#D4AF37]/30">
      <div className="  space-y-6">
        
       
{/* SECTION PROMPT */}
<div className="min-h-screen bg-[#F2F0E9] text-[#483C32] p-4 md:p-10 font-sans selection:bg-[#483C32] selection:text-[#D4AF37]">
         <Link href="/dashboard/Files" 
      className ="flex gap-2 items-center my-4">
        <Image src="/ArrowBack.svg" alt="Back to Dashboard" width={24} height={24}/>
        <p className="text-lg font-bold text-[#483C32]/80 hover:opacity-90 hover:text-[17px]">
        Files Engine Room</p>  
      </Link>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDE: THE CONFIGURATION FORM --- */}
        <div className="lg:col-span-7 space-y-8">
         <header className="space-y-2">
          <h1 className="text-5xl font-serif font-black italic
           uppercase tracking-tighter">
            DOCUMENT<span className="text-[#D4AF37]"> ARCHITECT</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">
            Institutional Context Configuration 
          </p>
        </header>

          <form onSubmit={(e : React.FormEvent)=> {
            e.preventDefault()
           // generateAssignment()
          }} 
            className="space-y-8 w-full ">
            
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#483C32]/5 p-6 rounded-[2rem] border border-[#483C32]/10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#483C32]/70">Course Association</label>
                <div className="flex gap-2 p-1 bg-white/30 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setCourseType("main")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${courseType === 'main' ? 'bg-[#483C32] text-[#F2F0E9] shadow-md' : 'text-[#483C32]/60 hover:text-[#483C32]'}`}
                  >MAIN COURSE</button>
                  <button 
                    type="button"
                    onClick={() => setCourseType("borrowed")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${courseType === 'borrowed' ? 'bg-[#483C32] text-[#F2F0E9] shadow-md' : 'text-[#483C32]/60 hover:text-[#483C32]'}`}
                  >BORROWED / ELECTIVE</button>
                </div>
              </div>

              <div className="bg-[#F2F0E9]/80 backdrop-blur-sm rounded-2xl border border-[#483C32]/10 p-4">
                <SystemSpec label="Header Size" value="14px" />
                <SystemSpec label="Paragraph Size" value="11px" />
                <SystemSpec label="SubHeader Size" value="12px" />
                <SystemSpec label="Line Spacing" value="1.5" />
              </div>
            </div>

            {/* 4. Generate Button */}
          
          </form>
        </div>

        {/* --- RIGHT SIDE: LIVE STREAM (Obsidian Style) --- */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="sticky top-10 h-[calc(100vh-80px)] bg-[#2C2520] rounded-[3rem] border-4 border-[#483C32]/20 overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 bg-[#483C32] flex justify-between items-center text-[#F2F0E9]">
               <div className="flex items-center gap-2">
                 <Monitor className="w-4 h-4 text-[#D4AF37]" />
                 <span className="text-xs font-black tracking-widest uppercase">Live Process Stream</span>
               </div>
               <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-[#D4AF37]/40" /> 
                 <div className="w-2 h-2 rounded-full bg-[#D4AF37]/40" />
                 <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
               </div>
            </div>
            
            <div className="flex-1 p-8 font-mono text-sm text-[#F2F0E9]/80 space-y-4 overflow-y-auto custom-scrollbar">
              {isStreaming ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-[#D4AF37] font-black uppercase tracking-tighter">&gt; INITIALIZING GENERATION ENGINE...</p>
                  <p className="opacity-60 text-xs">&gt; MAPPING STRATEGY: {intent.slice(0, 30)}...</p>
                  {/* ... dynamic format mapping here ... */}
                  <div className="pt-4 border-t border-white/10 text-white italic opacity-70">
                    &gt; {prompt}
                  </div>
                  <motion.div 
                    animate={{ opacity: [0, 1] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-5 bg-[#D4AF37]"
                  />
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center text-[#F2F0E9]">
                  <Terminal className="w-16 h-16 mb-4" />
                  <p className="uppercase font-black text-xs tracking-widest">Awaiting Command Input</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
        {/* --- SECTION: COVER --- */} 
        <div className="flex mx-auto flex-col md:max-w-5xl w-full px-5 py-10 ">
  <h2 className="text-lg font-bold text-[#483C32]/80  font-serif">
  This side of the Critical Assessment allows the Author of the file to clearly state the 
    the Cover Section Content, to state what exacty the header, subheader is, and how the Paragraph should
     be formatted.
  </h2>
        
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

      </div>
    </div>
  );
};

// --- TYPE-SAFE SUB-COMPONENTS ---

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


export default CriticalAssessmentArchitect;