'use client';
import { useState } from 'react';
import { Settings2, FileText, Send,   Zap, X,
 ChevronDown, Terminal, Monitor, Layers} from "lucide-react";
  import {motion, AnimatePresence} from "framer-motion";
import { useGlobalContext } from '@/app/Context';

export const dynamic = 'force-dynamic';



type FormatDropDownType = {
  label : string,
  value : string,
  onChange : (value : string) => void 
}
const SystemSpec = ({ label, value }: {label : string, value : string}) => (
  <div className="flex justify-between items-center p-2 border-b border-[#5C4033]/10 text-[10px] font-black uppercase tracking-widest">
    <span className="text-[#5C4033]/60">{label}</span>
    <span className="text-[#8B0000]">{value}</span>
  </div>
);

const FormatDropdown = ({ label, value, onChange }: FormatDropDownType) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5C4033] ml-1">
      {label}
    </label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-[#F5F5DC] border-2 border-[#5C4033] 
        p-3 rounded-xl text-sm font-bold text-[#5C4033] focus:ring-2 focus:ring-[#8B0000]
         outline-none cursor-pointer transition-all hover:bg-[#A52A2A]/5"
      >
        <option value="bold">BOLD</option>
        <option value="underline">UNDERLINE</option>
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B0000] pointer-events-none" />
    </div>
  </div>
);
export default function QuickAssessment() {

//const [courseType, setCourseType] = useState("main");
const { prompt, setPrompt,
      intent, setIntent,
      hFormat, setHFormat,
      shFormat, setSHFormat,
      wordCount, setWordCount} = useGlobalContext()
const [isStreaming, setIsStreaming] = useState(false);
  

const [courseType, setCourseType] = useState("main");


  const handleGenerate = async () => {
  
    setIsStreaming(true);
    

    try {
   const response = await fetch("/api/quickassessment", {
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      credentials : "include",
      body : JSON.stringify({
        prompt, 
        intent,
        wordCount
      })
      
     })
     if(response.ok){
      const data = await response.json();
      console.log("Stream data Expected:", data)
     }else{
    console.log("Failed")
     }

        }
    
     catch (error) {
      console.error("Axios Stream failed:", error);
    } finally {
      setIsStreaming(false);
    }
  };

const dateNow = new Date()
console.log(dateNow?.getDay());
  return (
 <div className="min-h-screen bg-[#F5F5DC] text-[#5C4033] p-4 md:p-10 font-sans selection:bg-[#8B0000] selection:text-[#F5F5DC]">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDE: THE CONFIGURATION FORM --- */}
        <div className="lg:col-span-7 space-y-8">
          <header className="space-y-2 border-l-4 border-[#8B0000] pl-6">
            <h1 className="text-4xl font-black text-[#8B0000] uppercase tracking-tighter italic">Document Architect</h1>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3 h-3" /> System Version: 30-Day Beta Cycle
            </p>
          </header>

          <form onSubmit={(e : React.FormEvent)=> {
            e.preventDefault()
           handleGenerate()
          }} 
           className="space-y-6">
            {/* 1. Prompt & Intent */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText className="w-3 h-3 text-[#8B0000]" /> The Prompt (Actual Assessment)
                </label>
                <textarea 
                  placeholder="Paste the core assessment content here. Avoid adding instructions..."
                  className="w-full h-32 bg-[#F5F5DC] border-2 border-[#5C4033] p-4 rounded-2xl text-sm font-medium focus:border-[#8B0000] outline-none transition-all resize-none shadow-[6px_6px_0px_0px_rgba(92,64,51,1)]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings2 className="w-3 h-3 text-[#8B0000]" /> Intent / Strategy (Instructions)
                </label>
                <textarea 
                  placeholder="Define the prompt strategy (e.g., Use Nigerian case studies, keep tone formal)..."
                  className="w-full h-24 bg-white/40 border-2 border-[#5C4033]/20 p-4 rounded-2xl text-sm font-medium italic focus:border-[#8B0000] outline-none transition-all resize-none"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Format Dropdowns & Word Count */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormatDropdown label="Header Style" value={hFormat} onChange={setHFormat} />
              <FormatDropdown label="SubHeader Style" value={shFormat} onChange={setSHFormat} />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5C4033]">Word Count</label>
                <input 
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full bg-[#F5F5DC] border-2 border-[#5C4033] p-3 rounded-xl text-sm font-bold text-[#8B0000] outline-none focus:ring-2 focus:ring-[#8B0000]"
                />
              </div>
            </div>

            {/* 3. Toggle & System Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#A52A2A]/5 p-6 rounded-[2rem] border border-[#A52A2A]/20">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em]">Course Association</label>
                <div className="flex gap-2 p-1 bg-[#5C4033]/10 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setCourseType("main")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${courseType === 'main' ? 'bg-[#8B0000] text-[#F5F5DC] shadow-md' : 'text-[#5C4033]'}`}
                  >MAIN COURSE</button>
                  <button 
                    type="button"
                    onClick={() => setCourseType("borrowed")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${courseType === 'borrowed' ? 'bg-[#8B0000] text-[#F5F5DC] shadow-md' : 'text-[#5C4033]'}`}
                  >BORROWED / ELECTIVE</button>
                </div>
              </div>

              <div className="bg-[#F5F5DC] rounded-2xl border border-[#5C4033]/10 p-4">
                <SystemSpec label="Header Size" value="14px" />
                <SystemSpec label="Paragraph Size" value="11px" />
                <SystemSpec label="SubHeader Size" value="12px" />
                <SystemSpec label="Margin Index" value="1.0" />
                <SystemSpec label="Line Spacing" value="1.5" />
                <SystemSpec label="Paragraph Spacing" value="6pt" />
              </div>
            </div>

            {/* 4. Generate Button */}
            <button 
              type="submit"
              className="w-full bg-[#8B0000] text-[#F5F5DC] py-5 rounded-2xl
               font-black uppercase tracking-[0.4em] shadow-xl 
              shadow-[#8B0000]/30 hover:shadow-none hover:translate-y-1 transition-all 
              flex items-center justify-center gap-4 group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Generate Institutional PDF
            </button>
          </form>
        </div>

        {/* --- RIGHT SIDE: LIVE STREAM (LARGE SCREEN) --- */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="sticky top-10 h-[calc(100vh-80px)] bg-[#5C4033] rounded-[3rem] border-4 border-[#8B0000]/30 overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 bg-[#8B0000] flex justify-between items-center text-[#F5F5DC]">
               <div className="flex items-center gap-2">
                 <Monitor className="w-4 h-4" />
                 <span className="text-xs font-black tracking-widest uppercase">Live Process Stream</span>
               </div>
               <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-[#F5F5DC]/40" /> 
                 <div className="w-2 h-2 rounded-full bg-[#F5F5DC]/40" />
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
               </div>
            </div>
            
            <div className="flex-1 p-8 font-mono text-sm text-[#F5F5DC]/80 space-y-4 overflow-y-auto custom-scrollbar">
              {isStreaming ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-[#8B0000] font-black">&gt; INITIALIZING GENERATION ENGINE...</p>
                  <p>&gt; MAPPING STRATEGY: {intent.slice(0, 30)}...</p>
                  <p>&gt; APPLYING FORMATS: H({hFormat}) SH({shFormat})</p>
                  <p>&gt; MARGIN: 1.0 | SPACING: 1.5</p>
                  <div className="pt-4 border-t border-white/10 text-white italic">
                    &gt; {prompt}
                  </div>
                  <motion.div 
                    animate={{ opacity: [0, 1] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-5 bg-[#8B0000]"
                  />
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                  <Terminal className="w-16 h-16 mb-4" />
                  <p className="uppercase font-black text-xs tracking-widest">Awaiting Command Input</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- MOBILE MODAL: LIVE STREAM (POPUP) --- */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 lg:hidden"
          >
            <div className="absolute inset-0 bg-[#5C4033]/90 backdrop-blur-md" onClick={() => setIsStreaming(false)} />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-[#5C4033] rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t-8 border-[#8B0000] overflow-hidden flex flex-col h-[75vh] shadow-2xl"
            >
              <div className="p-6 flex justify-between items-center text-[#F5F5DC]">
                <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#8B0000]" /> Active Generation
                </h4>
                <button onClick={() => setIsStreaming(false)} className="p-2 bg-white/10 rounded-full hover:bg-[#8B0000] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-8 font-mono text-xs text-[#F5F5DC]/70 overflow-y-auto space-y-4">
                <p className="text-[#8B0000] font-black tracking-tighter underline">SYSTEM LOGS:</p>
                <p className="text-white leading-relaxed">&gt; {prompt}</p>
                <p>&gt; FORMATTING COMPLETE.</p>
                <p>&gt; CALCULATING WORD COUNT: {wordCount} words.</p>
              </div>
              <div className="p-6 bg-[#8B0000]/10 border-t border-white/5">
                <button className="w-full bg-[#8B0000] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
                  Finalizing Document...
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}