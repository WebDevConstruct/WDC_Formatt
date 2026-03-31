'use client';
import { useState } from 'react';
import { ChevronDown, Sparkles, FileText, Layout, Type, AlignLeft } from "lucide-react";
import { useGlobalContext } from '@/app/Context';
export const dynamic = 'force-dynamic';
export default function QuickAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const [completion, setCompletion] = useState("");
const {config, setConfig} = useGlobalContext()


  const handleGenerate = async () => {
  
    setIsLoading(true);
    setCompletion(""); 

    try {
     const response = await fetch("/api/quickassessment", {
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      credentials : "include",
      body : JSON.stringify(config)
     })

        }
    
     catch (error) {
      console.error("Axios Stream failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
  <div className="min-h-screen bg-[#FDFCF0] text-gray-900 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE INPUTS (Engine Room) */}
        <div className="lg:col-span-5 space-y-6">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#8B0000] tracking-tight flex items-center gap-2">
              <Sparkles className="w-8 h-8" /> Quick Assessment
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Configure your Majestic high-velocity report requirements.</p>
          </header>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-maroon-900/5 border border-[#E8E6D1] space-y-6">
            
            {/* Requirement 1 & 2: Title & Format */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#8B0000] flex items-center gap-2">
                  <Type className="w-3 h-3" /> Document Title
                </label>
                <input 
                  className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#8B0000] transition-all"
                  placeholder="e.g. Q1 Growth Strategy"
                  onChange={(e) => setConfig({...config, title: e.target.value})}
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Title Casing</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#8B0000] cursor-pointer"
                    onChange={(e) => setConfig({...config, titleFormat: e.target.value})}
                  >
                    <option value="Bold-Uppercase">Bold + ALL CAPS</option>
                    <option value="Title-Case">Modern Title Case</option>
                    <option value="Minimalist">Minimalist Light</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Requirement 3 & 4: Subtitles & Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#8B0000] flex items-center gap-2">
                <Layout className="w-3 h-3" /> Key Sections (Sub-headers)
              </label>
              <input 
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#8B0000]"
                placeholder="Market, Risks, Outcomes"
                onChange={(e) => setConfig({...config, subTitles: e.target.value})}
              />
            </div>

            {/* Requirement 5: The Core Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#8B0000] flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Technical Prompt
              </label>
              <textarea 
                className="w-full bg-gray-50 border-none rounded-xl p-4 h-32 focus:ring-2 focus:ring-[#8B0000] resize-none"
                placeholder="Deep dive into the customer retention patterns..."
                onChange={(e) => setConfig({...config, prompt: e.target.value})}
              />
            </div>

            <button 
              onClick={()=> handleGenerate()}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                isLoading ? 'bg-gray-200 text-gray-400' : 'bg-[#8B0000] text-white shadow-lg shadow-maroon-900/20 hover:bg-black'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate Assessment</>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: THE PREVIEW (Majestic Output) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white flex-1 rounded-3xl shadow-2xl border border-[#E8E6D1] overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Live Preview
              </span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-yellow-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
              </div>
            </div>
            
            <div className="p-10 overflow-y-auto max-h-[700px] prose-slate prose-headings:text-[#8B0000]">
              {!completion && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
                  <FileText className="w-16 h-16 text-[#8B0000]" />
                  <p className="font-medium">Your majestic assessment will appear here...</p>
                </div>
              )}
              {completion && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 whitespace-pre-wrap leading-relaxed text-gray-700">
                  {completion}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}