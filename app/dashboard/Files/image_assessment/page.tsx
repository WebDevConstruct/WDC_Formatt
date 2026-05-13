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

    //   Image Related Logic
      const fileInputRef = useRef<HTMLInputElement>(null);
      const updateSectionField =( value : string) => {
        setPresentation(prev => {
         
        
          return { ...prev, image: value };
        });
      };
      const [readText, setReadText] = useState("");
      const [imageUrl, setImageUrl] = useState("");
      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            updateSectionField(reader.result as string);
            setImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
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
      <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-[#5C4033]/10
       relative group bg-[#5C4033]/5 min-h-[300px] lg:min-h-0">
              {imageUrl ? (
                <div className="relative w-full h-full">
                  <img src={imageUrl} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Slide Visual" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black text-[10px] font-bold px-4 py-2 rounded-full uppercase"
                    >
                      Change
                    </button>
                    <button 
                      onClick={() => {updateSectionField(""); setImageUrl("")}}
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