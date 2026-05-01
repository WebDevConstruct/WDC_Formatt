'use client';
import { useState } from 'react';
import { Settings2, FileText, Send,   Zap, X,
 ChevronDown, Terminal, Monitor, Layers} from "lucide-react";
  import {motion, AnimatePresence} from "framer-motion";
import { useGlobalContext } from '@/app/Context';
import Image from "next/image";
import cancel from "../../Images/cancel_24dp_8C1AF6_FILL0_wght400_GRAD0_opsz24.svg"
export const dynamic = 'force-dynamic';
export const formData = {
  "assignment_title": "Speed: The Velocity of Innovation",
  "subheader": "Course: Finance & Tech Integration (FTI 301)",
  "student_name": "Oladimeji Balogun",
  "submission_date": "October 24, 2026",
  "body_content": "The intersection of speed and creative thinking defines the modern frontier of financial technology. In building scalable financial systems, speed is not merely a performance metric but a strategic requirement. When developing predictive payment models, the ability to process vast arrays of statistical data—including regression analysis and ANOVA—at high velocity determines the utility of the tool for finance professionals. This assignment explores how assistive AI tools, integrated via stacks like React, Next.js, and Prisma, can reduce the latency between a financial hypothesis and its technical execution. By mastering atomic habits in our coding workflow, we ensure that the systems we build are not just fast, but inherently robust and adaptable to the volatile nature of global markets.",
  "references": "1. Housel, M. (2020). The Psychology of Money. \n2. Clear, J. (2018). Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones. \n3. Garcia, H. & Miralles, F. (2016). Ikigai: The Japanese Secret to a Long and Happy Life. \n4. Deisenroth, M. P. (2020). Mathematics for Machine Learning."
}


type FormatDropDownType = {
  label : string,
  Format : "HeaderFormat" | "SubHeaderFormat"
  arrayValue : Array<FormatTypes>
}
const SystemSpec = ({ label, value }: {label : string, value : string}) => (
  <div className="flex justify-between items-center p-2 border-b border-[#5C4033]/10 text-[10px] font-black uppercase tracking-widest">
    <span className="text-[#5C4033]/60">{label}</span>
    <span className="text-[#8B0000]">{value}</span>
  </div>
);


type FormatTypes = {
  id : number,
  Format : string,
  selected : boolean,
}
const FormatDropdown = ({ label,  arrayValue, Format }: FormatDropDownType) => {
  const {hFormat , setHFormat, shFormat, setSHFormat} = useGlobalContext();

      //This Function is to allow the User to pick between the Bold and Underline format
//For Headers and SubHeaders. It Updates the Context accordingly.
  const addFormat = (id : number, Format : string) => {
      if(Format === "HeaderFormat"){
    setHFormat((prev : Array<FormatTypes>)=> prev.map((value)=> value?.id === id && value?.selected === false  ?
  {id : value?.id, Format : value?.Format, selected : true} :value))
      }else if(Format === "SubHeaderFormat"){
        setSHFormat((prev:  Array<FormatTypes>)=> prev?.map((value)=> value?.id === id && value?.selected === false ?
  {id : value?.id, Format : value?.Format, selected : true} :value))
      }
  }
//The Remove Format does the Opposite of the addFormat Function.
  const removeFormat = (id : number, Format : string) => {
    if(Format === "HeaderFormat"){
    setHFormat((prev: Array<FormatTypes>)=> prev?.map((value)=> value?.id === id && value?.selected === true ?
  {id : value?.id, Format : value?.Format, selected : false} :value))
    }else if(Format === "SubHeaderFormat"){
      setSHFormat((prev: Array<FormatTypes>)=> prev?.map((value)=> value?.id === id && value?.selected === true ?
  {id : value?.id, Format : value?.Format, selected : false} :value))
    }
  }

      return(
        <div className="flex flex-col gap-3">
    <label className="text-base font-black uppercase tracking-[0.2em] flex items-center">
    {label}
    </label>
      
         <div className={"flex flex-wrap gap-3 p-2  bg-[#F5F5DC] border border-[#5C4033] rounded-xl cursor-pointer"}>
              {arrayValue.map((item : FormatTypes)=>(
               <div key ={item.id} onClick ={()=> {
                if(item.selected === false){
                     addFormat(item?.id, Format)
                }else {
                  return null;
                }
                   }}
    className={`relative w-25 rounded-3xl 
    h-12.5 ${item?.selected === false ? 
       "bg-[#5C4033]": "bg-[#8B0000] opacity-100"} flex items-center leading-4
     gap-1 justify-between  px-2 `}>
    
    <p className='text-base text-white font-bold'
     onClick={()=> {
                            if(item.selected === true){
                     addFormat(item?.id, Format)
                }
                           }} color="text-white"> {item?.Format}</p>
                           {item.selected === true && (
                       <Image
                       preload={true} onClick={()=> {

                         removeFormat(item?.id, Format)
                       }}
                       className=''
                       src={cancel} 
                       width ={25} 
                       height ={25} 
                       alt="Cancel Icon" />
                      )}
                   </div>
                ))}
                </div>
                </div>
);
}
export default function QuickAssessment() {

//const [courseType, setCourseType] = useState("main");
const { prompt, setPrompt,
      intent, setIntent,
      hFormat, 
      shFormat, 
      wordCount, setWordCount} = useGlobalContext()
const [isStreaming, setIsStreaming] = useState(false);
  

const [courseType, setCourseType] = useState("main");



const generateAssignment = async( )=> {
  try {
  const response = await fetch("/api/quickassessment-template", {
    method : "POST",
    headers : {"Content-Type" : "application/json"},
    body : JSON.stringify({
      templateName : "ACADEMIC_ASSIGNMENT",
      userInput : {
      
  "assignment_title": "Scalable Predictive Models in Modern Fintech Systems",
  "student_name": "Oladimeji Balogun",
  "intro_title": "1. Introduction",
  "intro_content": "The landscape of financial technology is undergoing a seismic shift driven by the integration of high-performance software engineering and advanced statistical methodologies. As systems move toward real-time processing, the necessity for scalable architectures becomes paramount. This research explores the synergy between React-based frontend interfaces and robust backend engines, specifically focusing on how predictive payment models can be optimized for low-latency environments. By leveraging modern tech stacks, developers can bridge the gap between complex financial theory and practical, user-centric applications.",
  "method_title": "2. Methodology",
  "method_content": "Our approach utilizes a quantitative research design, incorporating regression analysis and ANOVA to evaluate the performance of different architectural patterns. The data was gathered via simulated transaction environments using a tech stack comprised of Next.js, TypeScript, and Prisma connected to a Neon PostgreSQL database. We focused on 'Estimation Theory' to predict transaction failure rates, applying Chi-square testing to ensure the statistical significance of our findings. This methodology ensures that the resulting software tools are not only aesthetically functional but mathematically sound.",
  "body_title": "3. Analysis & Discussion",
  "body_content": "Analysis of the collected data suggests that the implementation of 'Atomic Habits' in the development lifecycle—such as consistent code reviews and modular component design—leads to a 30% reduction in production bugs. Furthermore, the psychology of money plays a critical role in how users interact with financial dashboards; predictive tools must be intuitive enough to challenge user assumptions without causing cognitive overload. When building these assistive tools, it is vital to balance technical complexity with the user's need for immediate, actionable insights, a concept deeply rooted in the Ikigai of professional development: finding where skill meets market necessity.",
  "concl_title": "4. Conclusion",
  "concl_content": "In conclusion, the future of finance lies in the seamless integration of machine learning and frontend engineering. By focusing on high-speed data playback and offline functionality, as demonstrated in our educational platform initiatives, we can ensure that financial literacy and technical proficiency are accessible to all. The key to success in this domain is a commitment to continuous learning and the rigorous application of statistical principles to real-world software problems. As we move forward, the 'Architectural Virtual Space' will continue to be a benchmark for university-level research in this field."
 }
    })
  })
  const blob = await response.blob();
  console.log(blob);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Assignment.pdf";
  a.click();
} catch(error){
  throw new Error("Could not Create the Assignment")
}
}


//To CALL THE MODEL FOR THE ASSIGNMENT / TASK

  // const handleGenerate = async () => {
  
  //   setIsStreaming(true);
    

  //   try {
  //  const response = await fetch("/api/quickassessment", {
  //     method : "POST",
  //     headers : {"Content-Type" : "application/json"},
  //     credentials : "include",
  //     body : JSON.stringify({
  //       prompt, 
  //       intent,
  //       wordCount
  //     })
      
  //    })
  //    if(response.ok){
  //     const data = await response.json();
  //     console.log("Stream data Expected:", data)
  //    }else{
  //   console.log("Failed")
  //    }

  //       }
    
  //    catch (error) {
  //     console.error("Axios Stream failed:", error);
  //   } finally {
  //     setIsStreaming(false);
  //   }
  // };
//Filter the headerFormats to known which of both or both goes to the backend

const getSelectedHeaderFormat = hFormat?.filter((value : FormatTypes)=> value?.selected === true )
const getSelectedSubHeaderFormat = shFormat?.filter((value  : FormatTypes)=> value?.selected === true );
  return (
 <div className="min-h-screen bg-[#F5F5DC] text-[#5C4033] p-4 md:p-10 font-sans selection:bg-[#8B0000] selection:text-[#F5F5DC]">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDE: THE CONFIGURATION FORM --- */}
        <div className="lg:col-span-7 space-y-8">
          <header className="space-y-2 border-l-4 border-[#8B0000] pl-6">
            <h1 className="text-4xl font-black text-[#8B0000] uppercase 
            tracking-tighter italic">Document Architect</h1>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3 h-3" /> System Version: 30-Day Beta Cycle
            </p>
          </header>

          <form onSubmit={(e : React.FormEvent)=> {
            e.preventDefault()
            generateAssignment()
          // handleGenerate()
          }} 
           className="space-y-8">
            {/* 1. Prompt & Intent */}
            <div className="space-y-2">
              <div className="space-y-2">
                <label className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText className="w-10 h-10 text-[#8B0000]" /> The Prompt (Actual Assessment)
                </label>
                <textarea 
                  placeholder="Paste the core assessment content here. Avoid adding instructions..."
                  className="w-full h-32 bg-[#F5F5DC] border-2 border-[#5C4033] p-4 rounded-2xl
                   text-base leading-6.5
                  font-medium focus:border-[#8B0000] outline-none transition-all resize-none 
                  shadow-[6px_6px_0px_0px_rgba(92,64,51,1)]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings2 className="w-10 h-10 text-[#8B0000]" /> Intent / Strategy (Instructions)
                </label>
                <textarea 
                  placeholder="Define the prompt strategy (e.g., Use Nigerian case studies, keep tone formal)..."
                  className="w-full h-32 bg-white/40 border-2 border-[#5C4033]/20 p-4 rounded-2xl
                   font-medium text-base leading-6.5 focus:border-[#8B0000] outline-none transition-all resize-none"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Format Dropdowns & Word Count */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormatDropdown label="Header Style" Format = "HeaderFormat" arrayValue={hFormat}  />
              <FormatDropdown label="SubHeader Style" Format = "SubHeaderFormat" arrayValue ={shFormat}  />
              
              <div className="space-y-2">
                <label className="text-base font-black uppercase tracking-[0.2em] flex 
                items-center">Word Count</label>
                <input 
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className={"w-full bg-[#F5F5DC] border-2 border-[#5C4033] p-3 text-base rounded-xl  font-bold text-[#8B0000] outline-none focus:ring-2 focus:ring-[#8B0000]"}
                />
              </div>
            </div>

            {/* 3. Toggle & System Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#A52A2A]/5 p-6 rounded-[2rem] border border-[#A52A2A]/20">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em]">Course Association</label>
                <div className="flex gap-2 p-1  rounded-xl">
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
                  {getSelectedHeaderFormat?.map((item : FormatTypes)=> 
                  <div key={item?.id} className='gap-2 flex flex-col'>
                     <h1>&gt; APPLYING HEADER FORMATS-</h1>
                  <p>&gt; APPLYING FORMATS: BOLD FORMAT: {item?.Format=== "Bold" ? "APPLIED" : "NIL"}</p>
                      <p>&gt; APPLYING FORMATS: UNDERLINE FORMAT: {item?.Format=== "Underline" ? "APPLIED" : "NIL"}</p>
                  </div>
                  )}
                   {getSelectedSubHeaderFormat?.map((item : FormatTypes)=> 
                  <div key={item?.id} className='gap-2 flex flex-col'>
                     <h1>&gt; APPLYING SUB HEADER FORMATS-</h1>
                  <p>&gt; APPLYING FORMATS: BOLD FORMAT: {item?.Format=== "Bold" ? "APPLIED" : "NIL"}</p>
                      <p>&gt; APPLYING FORMATS: UNDERLINE FORMAT: {item?.Format=== "Underline" ? "APPLIED" : "NIL"}</p>
                  </div>
                  )}
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