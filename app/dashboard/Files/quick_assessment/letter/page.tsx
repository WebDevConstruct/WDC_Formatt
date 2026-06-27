"use client"
import { LetterDataConfigType } from '@/lib/pdfEngine';
import {useState, useEffect} from "react";
import {useUser} from "@clerk/nextjs"
import { InputField } from '../assignment/page';
import {Send, Settings2, FileText} from "lucide-react"
import LetterPreviewModal from '@/app/components/LetterPreview';
import {useGlobalContext} from "@/app/Context"
type TextRole = "header" | "introduction" | "paragraph" | "sign-off"
   export interface MetadataState {

  letter : {
    From : string;
    Receiver : string;
    phone : string;
    email : string;
    address : string
  }
}
const LetterAssessment = () => {
    const {user} = useUser();
    const [prompt, setPrompt] = useState("");
    const [intent, setIntent] = useState("")
    const [creatingPDFState, setCreatingPDFState] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const {letterPreviewModal, setLetterPreviewModal, trackChange, setTrackChange}  = useGlobalContext();
   const [letterReq, setLetterReq] = useState<LetterDataConfigType>({
     sender_name : "",
          recipient_name : "",
          letter_title : "Letter",
          salutation : ``,
          content : [],
          templateName : "",
          phone :  "",
          email : "",
          address :  "",
          conclusion : ""
        })
 const [meta, setMeta] = useState<MetadataState>({
     letter: { From: '', Receiver: '', phone: "", email : "", address : "" }
  });
  const [wordCount, setWordCount] = useState(0)

  // ====== \\\  ========\\\

  const generateLetter = async(data : LetterDataConfigType)=> {
    console.log("generating Letter")
    setEditMode(false)
   const {sender_name, recipient_name} = data;
if(data?.content?.length > 0){
// alert("generating Letter Response...")
    try {
      setCreatingPDFState(true)
    const response = await fetch("/api/letter", {
      method : "POST",
      headers : {
        "Content-Type" : "application/pdf",
        "Content-Disposition" : `attachment; filename=${sender_name}_${recipient_name}.pdf`
      },
      body : JSON.stringify(data)
    })
   // console.log(JSON.stringify({body}));
  
   
    const blob = await response.blob();
    console.log(blob);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `${sender_name}_${recipient_name}.pdf`
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
       }else{
        alert("Unable to generate the letter..")
       }
  }
  
    const parseLetterOutput = (
      rawText: string, 
     // formInputs: Partial<LetterDataConfigType>
    ): LetterDataConfigType => {
      
      // 1. Initialize the core object with your frontend form data
      const data: LetterDataConfigType = {
        sender_name : meta?.letter?.From || user?.firstName + " " + user?.lastName,
          recipient_name : meta?.letter?.Receiver || "To Whom It May Concern",
          letter_title : "Letter",
          salutation : `Dear ${meta?.letter?.Receiver || "To Whom It May Concern"},`,
          content : [],
          templateName : "ACADEMIC_ASSIGNMENT",
          phone : meta?.letter?.phone || "",
          email : meta?.letter?.email || "",
          address : meta?.letter?.address || "",
          conclusion : ""
      };
    
      // 2. Split the LLM response into processable lines
      const lines = rawText.split('\n');
      let segmentIndex = 0;
    
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return; // Ignore blank lines
    
        // --- A. Extract the Main Subject Header ---
        if (trimmedLine.startsWith('# HEADER:')) {
          const actualContent = trimmedLine.replace('# HEADER:', '').trim();
          
          // We map this to both the explicit title property and the content stream
          data.letter_title = actualContent; 
          
          data.content.push({
            id: `seg-${crypto.randomUUID()}`,
            role: "header" as TextRole, 
            content: actualContent,
            index: segmentIndex++
          });
    
          return;
        }
    
        // --- B. Extract the Introduction / Salutation Block ---
        if (trimmedLine.startsWith('## INTRODUCTION:')) {
          const actualContent = trimmedLine.replace('## INTRODUCTION:', '').trim();
          
          data.content.push({
            id: `seg-${crypto.randomUUID()}`,
            role: "paragraph" as TextRole, // 'paragraph' works best for PDF rendering flow
            content: actualContent,
            index: segmentIndex++
          });
          return;
        }
    
        // --- C. Extract Core Body & Sign-Off Paragraphs ---
        if (trimmedLine.startsWith('### PARAGRAPH:')) {
          const actualContent = trimmedLine.replace('### PARAGRAPH:', '').trim();
          
          // Simple heuristic: If the paragraph contains common sign-offs, tag it specifically.
          // Otherwise, it's just a standard body paragraph.
          const isSignOff = /sincerely|yours faithfully|best regards/i.test(actualContent);
          
          data.content.push({
            id: `seg-${crypto.randomUUID()}`,
            role: (isSignOff ? "sign-off" : "paragraph") as TextRole,
            content: actualContent,
            index: segmentIndex++
          });
         
          return;
        }
        
        // --- D. Fallback for un-tagged text (Safety Net) ---
        // If the LLM hallucinates and drops a tag, we still capture the text
        if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
           data.content.push({
            id: `seg-${crypto.randomUUID()}`,
            role: "paragraph" as TextRole,
            content: trimmedLine,
            index: segmentIndex++
          });
        }
    
        if(trimmedLine?.length  > 0 && trimmedLine?.startsWith("## CONCLUSION:")){
          const actualContent = trimmedLine.replace('## CONCLUSION:', '').trim();
          data.conclusion = actualContent;
        }
      });
      console.log(data);
       setLetterReq(data)
    //   setTimeout(()=> {
    //     console.log("Running to generate the letter...")
    // generateLetter(data)
    //   },1000)
    
      return data;
    };

    //// =========  \\\ =====

     const startAssessment = (chunkValue : string) => {
  //  setIsParsing(true);
    setEditMode(true)
    console.log(chunkValue)
   // setSegments([]);
  
     parseLetterOutput(chunkValue)
 
    
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

//================= Calling the LLM ==========\\
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
        wordCount,
        intent : intent || "",
        track : "letter",
        TrackInfo : {
          senderName  : meta?.letter?.From || user?.firstName + " " + user?.lastName,
          receiverName : meta?.letter?.Receiver || "Not Set",
        }
      })
      
     })
     if(response.ok){
         setLetterPreviewModal(true);
      const data = await response.text();
      startAssessment(data?.toString())
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
  return (

       
  <div className="bg-[#F2F0E9] h-auto py-8  flex items-start lg:px-[20%] px-5 
  flex-col gap-8  lg:gap-10 w-full">
  <div className="flex lg:flex-row flex-col  w-full justify-between gap-4 ">
       <InputField 
              label="From(Sender Name)" 
              value={meta.letter?.From}
              onChange={(val) => {
                setMeta({...meta, letter : {...meta.letter, From: val}})
              
              //  setSegments((value)=> value["title"])
              }}
            />
            <InputField 
              label="TO(Recipient Name)" 
              value={meta.letter?.Receiver}
              onChange={(val) => setMeta({...meta, letter: {...meta.letter, Receiver: val}})}
            />
  </div>
  {/* The Email Adress and Phone Number */}
  <div className="flex lg:flex-row flex-col  w-full
     justify-between gap-4">
    <InputField 
      label="Email Address" 
      value={meta.letter?.email}
      onChange={(val) => setMeta({...meta, letter: {...meta.letter, email: val}})}
    />
    <InputField 
      label="Phone Number" 
      value={meta.letter?.phone}
      onChange={(val) => setMeta({...meta, letter: {...meta.letter, phone: val}})}
    />
  </div>
  {/* Adress Field */}
  <div className= "flex justify-start">
      <InputField 
      label="Address" 
      value={meta.letter?.address}
      onChange={(val) => setMeta({...meta, letter: {...meta.letter, address: val}})}
    />
    </div>

     <div className= {`flex lg:flex-row flex-col w-full
     justify-between gap-4`}>
      {/* PROMPT TEXT AREA */}
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

              {/* INTENT TEXTAREA */}
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

            <LetterPreviewModal
             generatePDF={()=>{
              console.log("GENERATING PDF")
                     generateLetter(letterReq)
             }} 
             regenerateContent ={handleGenerate}
            isOpen ={letterPreviewModal} 
            onClose={()=> setLetterPreviewModal((prev : boolean)=> !prev)}
             letterData={letterReq} 
             setLetterData={setLetterReq}/>
  </div>


  
  )
}

export default LetterAssessment