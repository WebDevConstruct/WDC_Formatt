//ORIGINAL CODE FOR LETTER ASSESSMENT
// "use client"
// import { LetterDataConfigType } from '@/lib/pdfEngine';
// import {useState, useEffect, useRef} from "react";
// import {useUser} from "@clerk/nextjs"
// import { InputField } from '../assignment/page';
// import {Send, Settings2, FileText} from "lucide-react"
// import LetterPreviewModal from '@/app/components/LetterPreview';
// import {useGlobalContext} from "@/app/Context"
// type TextRole = "header" | "introduction" | "paragraph" | "sign-off"
//    export interface MetadataState {

//   letter : {
//     From : string;
//     Receiver : string;
//     phone : string;
//     email : string;
//     address : string
//   }
// }
// const LetterAssessment = () => {
//     const {user} = useUser();
//     const [prompt, setPrompt] = useState("");
//     const [intent, setIntent] = useState("")
//     const [creatingPDFState, setCreatingPDFState] = useState(false);
//     const [displayedText, setDisplayedText] = useState("");
//     const [isParsing, setIsParsing] = useState(false);
//     const [editMode, setEditMode] = useState(false);
//     const [loadingState, setLoadingState] = useState<boolean>(false);
//     const {letterPreviewModal, setLetterPreviewModal, trackChange, setTrackChange}  = useGlobalContext();
//    const [letterReq, setLetterReq] = useState<LetterDataConfigType>({
//      sender_name : "",
//           recipient_name : "",
//           letter_title : "Letter",
//           salutation : ``,
//           content : [],
//           templateName : "",
//           phone :  "",
//           email : "",
//           address :  "",
//           conclusion : ""
//         })
//  const [meta, setMeta] = useState<MetadataState>({
//      letter: { From: '', Receiver: '', phone: "", email : "", address : "" }
//   });
//   const [wordCount, setWordCount] = useState(0)

//   // ====== \\\  ========\\\

//   const generateLetter = async(data : LetterDataConfigType)=> {
//     console.log("generating Letter")
//     setEditMode(false)
//    const {sender_name, recipient_name} = data;
// if(data?.content?.length > 0){
// // alert("generating Letter Response...")
//     try {
//       setCreatingPDFState(true)
//     const response = await fetch("/api/letter", {
//       method : "POST",
//       headers : {
//         "Content-Type" : "application/pdf",
//         "Content-Disposition" : `attachment; filename=${sender_name}_${recipient_name}.pdf`
//       },
//       body : JSON.stringify(data)
//     })
//    // console.log(JSON.stringify({body}));
  
   
//     const blob = await response.blob();
//     console.log(blob);
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     const fileName = `${sender_name}_${recipient_name}.pdf`
//     a.setAttribute("download",fileName);
//     document?.body?.appendChild(a);
//     a?.click()
//     //Clean Up
//     window?.URL?.revokeObjectURL(url)
//       a?.parentNode?.removeChild(a);
//   } catch(error){
//     alert("Request failed why trying to generate your pdf")
//     throw new Error("Could not Create the Assignment");
//   }finally{
//     setCreatingPDFState(false)
//   }
//        }else{
//         alert("Unable to generate the letter..")
//        }
//   }
  
//   const rawLetterBufferChunk = useRef<string>("");
// const letterThrottleRef = useRef<NodeJS.Timeout | null>(null);
// const parseLetterOutput = (rawText: string): LetterDataConfigType => {
//   // 1. Initialize the core object fresh on every single parse call
//   const data: LetterDataConfigType = {
//     sender_name: meta?.letter?.From || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || ""),
//     recipient_name: meta?.letter?.Receiver || "To Whom It May Concern",
//     letter_title: "Letter",
//     salutation: `Dear ${meta?.letter?.Receiver || "To Whom It May Concern"},`,
//     content: [],
//     templateName: "ACADEMIC_ASSIGNMENT",
//     phone: meta?.letter?.phone || "",
//     email: meta?.letter?.email || "",
//     address: meta?.letter?.address || "",
//     conclusion: ""
//   };

//   // 2. Split the current snapshot of the LLM response into processable lines
//   const lines = rawText.split('\n');
//   let segmentIndex = 0;

//   lines.forEach((line) => {
//     const trimmedLine = line.trim();
//     if (!trimmedLine) return; // Ignore blank lines

//     // --- A. Extract the Main Subject Header ---
//     if (trimmedLine.startsWith('# HEADER:')) {
//       const actualContent = trimmedLine.replace('# HEADER:', '').trim();
//       data.letter_title = actualContent; 
      
//       data.content.push({
//         id: `seg-${segmentIndex}`, // Avoid crypto.randomUUID() inside hot loops for streaming speed
//         role: "header" as TextRole, 
//         content: actualContent,
//         index: segmentIndex++
//       });
//       return;
//     }

//     // --- B. Extract the Introduction / Salutation Block ---
//     if (trimmedLine.startsWith('## INTRODUCTION:')) {
//       const actualContent = trimmedLine.replace('## INTRODUCTION:', '').trim();
      
//       data.content.push({
//         id: `seg-${segmentIndex}`,
//         role: "paragraph" as TextRole, 
//         content: actualContent,
//         index: segmentIndex++
//       });
//       return;
//     }

//     // --- C. Extract Core Body & Sign-Off Paragraphs ---
//     if (trimmedLine.startsWith('### PARAGRAPH:')) {
//       const actualContent = trimmedLine.replace('### PARAGRAPH:', '').trim();
//       const isSignOff = /sincerely|yours faithfully|best regards/i.test(actualContent);
      
//       data.content.push({
//         id: `seg-${segmentIndex}`,
//         role: (isSignOff ? "sign-off" : "paragraph") as TextRole,
//         content: actualContent,
//         index: segmentIndex++
//       });
//       return;
//     }

//     // --- D. Extract Conclusion Parameter ---
//     if (trimmedLine.startsWith("## CONCLUSION:")) {
//       const actualContent = trimmedLine.replace('## CONCLUSION:', '').trim();
//       data.conclusion = actualContent;
//       return;
//     }
    
//     // --- E. Fallback for un-tagged text (Safety Net) ---
//     if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
//       data.content.push({
//         id: `seg-${segmentIndex}`,
//         role: "paragraph" as TextRole,
//         content: trimmedLine,
//         index: segmentIndex++
//       });
//     }
//   });

//   // Push the compiled data structure directly into your application state
//   setLetterReq(data);
//   return data;
// };

// //GETTING THE CHUNK OF TEXTS FROM ANTHROPIC
// const handleGenerate = async () => {
//   setEditMode(false);
  
//   try {
//     setLoadingState(true);
//     const response = await fetch("/api/quickassessment", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({
//         prompt, 
//         wordCount,
//         intent: intent || "",
//         track: "letter",
//         TrackInfo: {
//           senderName: meta?.letter?.From || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || ""),
//           receiverName: meta?.letter?.Receiver || "Not Set",
//         }
//       })
//     });

//     if (response.ok) {
//       setLoadingState(false);
      
//       // 1. Get the raw low-level stream reader from the network interface
//       const reader = response?.body?.getReader();
//       if (!reader) return;

//       // 2. Reveal the preview canvas container instantly so streaming is visible
//       setLetterPreviewModal(true);
//       setEditMode(true);
      
//       const decoder = new TextDecoder("utf-8");
//       rawLetterBufferChunk.current = ""; // Reset the core string reference cache

//       // 3. Real-time stream processing loop
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         // Decode binary Uint8Array network packets directly back into plaintext strings
//         const incomingTextChunk = decoder.decode(value, { stream: true });
        
//         // Append tokens directly to our fast reference string cache
//         rawLetterBufferChunk.current += incomingTextChunk;

//         // 4. 🔥 THROTTLED PROGRESSIVE RENDER
//         // Skip updating React state if a rendering window timer is already ticking
//         if (!letterThrottleRef.current) {
//           letterThrottleRef.current = setTimeout(() => {
//             parseLetterOutput(rawLetterBufferChunk.current);
//             letterThrottleRef.current = null; // Open processing gate back up
//           }, 75); // 75ms delivers fluid animations with zero CPU throttling
//         }
//       }

//       // 5. Final sync execution block to catch remaining tail end tokens
//       if (letterThrottleRef.current) {
//         clearTimeout(letterThrottleRef.current);
//         letterThrottleRef.current = null;
//       }
//       parseLetterOutput(rawLetterBufferChunk.current);

//     } else {
//       alert("WDC_FORMATT AI is currently down.");
//       return;
//     }
//   } catch (error) {
//     console.error("Streaming pipeline interaction crash:", error);
//     alert("WDC_FORMATT AI is currently down.");
//   } finally {
//     setLoadingState(false);
//     setIsParsing(false);
//   }
// };
//   return (

       
//   <div className="bg-[#F2F0E9] h-auto py-8  flex items-start lg:px-[20%] px-5 
//   flex-col gap-8  lg:gap-10 w-full">
//   <div className="flex lg:flex-row flex-col  w-full justify-between gap-4 ">
//        <InputField 
//               label="From(Sender Name)" 
//               value={meta.letter?.From}
//               onChange={(val) => {
//                 setMeta({...meta, letter : {...meta.letter, From: val}})
              
//               //  setSegments((value)=> value["title"])
//               }}
//             />
//             <InputField 
//               label="TO(Recipient Name)" 
//               value={meta.letter?.Receiver}
//               onChange={(val) => setMeta({...meta, letter: {...meta.letter, Receiver: val}})}
//             />
//   </div>
//   {/* The Email Adress and Phone Number */}
//   <div className="flex lg:flex-row flex-col  w-full
//      justify-between gap-4">
//     <InputField 
//       label="Email Address" 
//       value={meta.letter?.email}
//       onChange={(val) => setMeta({...meta, letter: {...meta.letter, email: val}})}
//     />
//     <InputField 
//       label="Phone Number" 
//       value={meta.letter?.phone}
//       onChange={(val) => setMeta({...meta, letter: {...meta.letter, phone: val}})}
//     />
//   </div>
//   {/* Adress Field */}
//   <div className= "flex justify-start">
//       <InputField 
//       label="Address" 
//       value={meta.letter?.address}
//       onChange={(val) => setMeta({...meta, letter: {...meta.letter, address: val}})}
//     />
//     </div>

//      <div className= {`flex lg:flex-row flex-col w-full
//      justify-between gap-4`}>
//       {/* PROMPT TEXT AREA */}
//         <div className="space-y-2">
//                 <label className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-[#483C32]">
//                   <FileText className="w-6 h-6 text-[#D4AF37]" /> The Prompt (Actual Assessment)
//                 </label>
//                 <textarea 
//                   placeholder="Paste the core assessment content here. Avoid adding instructions..."
//                   className="w-full h-32 bg-[#F2F0E9] border-2 border-[#483C32] p-4 rounded-2xl
//                    text-base leading-relaxed font-medium focus:border-[#D4AF37] outline-none transition-all resize-none 
//                    shadow-[6px_6px_0px_0px_rgba(72,60,50,1)]"
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                 />
//               </div>

//               {/* INTENT TEXTAREA */}
//                   <div className="space-y-2">
//                 <label className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-[#483C32]">
//                   <Settings2 className="w-6 h-6 text-[#D4AF37]" /> Intent / Strategy (Instructions)
//                 </label>
//                 <textarea 
//                   placeholder="Define the prompt strategy (e.g., Use Nigerian case studies, keep tone formal)..."
//                   className="w-full h-32 bg-white/40 border-2 border-[#483C32]/20 p-4 rounded-2xl
//                    font-medium text-base leading-relaxed focus:border-[#483C32] outline-none transition-all resize-none shadow-sm"
//                   value={intent}
//                   onChange={(e) => setIntent(e.target.value)}
//                 />
//               </div>
//     </div>
//        <button  onClick={()=> {
//               //  setEditMode(true);
             
//             handleGenerate();
//               }}
//               type="submit"
//               className="w-full bg-[#483C32] text-[#F2F0E9] py-5 rounded-2xl
//                font-black uppercase tracking-[0.4em] shadow-xl 
//                shadow-[#483C32]/20 hover:shadow-none hover:translate-y-1 hover:bg-[#2C2520] transition-all 
//                flex items-center justify-center gap-4 group"
//             >
//               <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform
//                text-[#D4AF37]" />
//               Generate PDF
//             </button>

//             <LetterPreviewModal
//              generatePDF={()=>{
//           //    console.log("GENERATING PDF")
//                      generateLetter(letterReq)
//              }} 
//              regenerateContent ={handleGenerate}
//             isOpen ={letterPreviewModal} 
//             onClose={()=> setLetterPreviewModal((prev : boolean)=> !prev)}
//              letterData={letterReq} 
//              setLetterData={setLetterReq}/>
//   </div>


  
//   )
// }

// export default LetterAssessment

//TESTING THE CURRENT CODE FOR DESIGN CONSIDERATIONS
"use client"
import { LetterDataConfigType } from '@/lib/pdfEngine';
import {useState, useEffect, useRef} from "react";
import {useUser} from "@clerk/nextjs"
import { InputField } from '../assignment/page';
import {
  Send, Settings2, FileText, Plus, X, ChevronDown,
  User, Mail, Phone, CalendarDays, Building2, MapPin, AlignLeft, AlignRight
} from "lucide-react"
import LetterPreviewModal from '@/app/components/LetterPreview';
import {useGlobalContext} from "@/app/Context"
import {AddressAlignment} from "@/lib/pdfEngine";
type TextRole = "header" | "introduction" | "paragraph" | "sign-off"

type AccordionSection = "sender" | "receiver"

export interface MetadataState {
  letter: {
    topic: string; // the subject of the letter — shown uppercase + underlined
    sender: {
      fullName: string;
      fullAddress: string;
      email: string;
      phone: string;
      date: string;
      alignment: AddressAlignment; // left is recommended
      additionalInfo: string[];
    };
    receiver: {
      fullName: string;
      position: string;
      organization: string;
      address: string;
      salutation: string; // e.g. "Dear Sir/Ma", "Dear Recruitment Team"
      additionalInfo: string[]; // user can add as many extra fields as needed
    };
  }
}

// ============================================================
// Small field primitives — kept local so the form reads as one
// clean formal document, not a grid of generic inputs.
// ============================================================
const FieldLabel = ({ icon: Icon, children, required }: { icon?: any; children: React.ReactNode; required?: boolean }) => (
  <label className="text-xs font-black uppercase tracking-[0.18em] flex items-center gap-2 text-[#483C32]">
    {Icon && <Icon className="w-4 h-4 text-[#D4AF37]" />}
    {children}
    {required && <span className="text-[#B3261E] normal-case tracking-normal">*</span>}
  </label>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-white/60 border-2 border-[#483C32]/25 px-4 py-2.5 rounded-xl
      text-sm font-medium not-italic focus:border-[#D4AF37] outline-none transition-all
      placeholder:not-italic placeholder:text-[#483C32]/40 ${props.className || ""}`}
  />
);

// ============================================================
// Accordion Section wrapper
// ============================================================
const AccordionSection = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
  step,
}: {
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  step: number;
}) => (
  <div className={`w-full border-2 rounded-3xl overflow-hidden transition-all
    ${isOpen ? "border-[#483C32] bg-white/40" : "border-[#483C32]/20 bg-white/10"}`}>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
    >
      <div className="flex items-center gap-4">
        <span className="w-8 h-8 shrink-0 rounded-full bg-[#483C32] text-[#F2F0E9]
          flex items-center justify-center text-sm font-black">
          {step}
        </span>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#483C32]">{title}</p>
          <p className="text-xs text-[#483C32]/60 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ChevronDown className={`w-5 h-5 text-[#483C32] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <div className="px-6 pb-6 pt-1 border-t border-[#483C32]/10">
        {children}
      </div>
    )}
  </div>
);

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
    const [activeSection, setActiveSection] = useState<AccordionSection>("sender");
    const [showValidation, setShowValidation] = useState(false);

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
   letter: {
     topic: "",
     sender: {
       fullName: "",
       fullAddress: "",
       email: "",
       phone: "",
       date: "",
       alignment: "left",
       additionalInfo: [""],
     },
     receiver: {
       fullName: "",
       position: "",
       organization: "",
       address: "",
       salutation: "",
       additionalInfo: [""],
     },
   },
  });
  const [wordCount, setWordCount] = useState(0)

  const setSenderField = (field: keyof MetadataState["letter"]["sender"], value: string) => {
    setMeta((prev) => ({
      ...prev,
      letter: { ...prev.letter, sender: { ...prev.letter.sender, [field]: value } },
    }));
  };

  const setReceiverField = (field: Exclude<keyof MetadataState["letter"]["receiver"], "additionalInfo">, value: string) => {
    setMeta((prev) => ({
      ...prev,
      letter: { ...prev.letter, receiver: { ...prev.letter.receiver, [field]: value } },
    }));
  };

  const updateReceiverExtra = (idx: number, value: string) => {
    setMeta((prev) => {
      const next = [...prev.letter.receiver.additionalInfo];
      next[idx] = value;
      return { ...prev, letter: { ...prev.letter, receiver: { ...prev.letter.receiver, additionalInfo: next } } };
    });
  };

  //Sender Update
  const updateSenderExtra = (idx: number, value: string) => {
    setMeta((prev) => {
      const next = [...prev.letter.sender.additionalInfo];
      next[idx] = value;
      return { ...prev, letter: { ...prev.letter, sender: { ...prev.letter.sender, additionalInfo: next } } };
    });
  };

  const addReceiverExtra = () => {
    setMeta((prev) => ({
      ...prev,
      letter: {
        ...prev.letter,
        receiver: { ...prev.letter.receiver, additionalInfo: [...prev.letter.receiver.additionalInfo, ""] },
      },
    }));
  };

  const addSenderExtra = () => {
    setMeta((prev) => ({
      ...prev,
      letter: {
        ...prev.letter,
        sender: { ...prev.letter.sender, additionalInfo: [...prev.letter.sender?.additionalInfo, ""] },
      },
    }))
  }

  const removeReceiverExtra = (idx: number) => {
    setMeta((prev) => {
      if (prev.letter.receiver.additionalInfo.length <= 1) return prev;
      const next = prev.letter.receiver.additionalInfo.filter((_, i) => i !== idx);
      return { ...prev, letter: { ...prev.letter, receiver: { ...prev.letter.receiver, additionalInfo: next } } };
    });
  };

    const removeSenderExtra = (idx: number) => {
    setMeta((prev) => {
      if (prev.letter.sender.additionalInfo.length <= 1) return prev;
      const next = prev.letter.sender.additionalInfo.filter((_, i) => i !== idx);
      return { ...prev, letter: { ...prev.letter, sender: { ...prev.letter.sender, additionalInfo: next } } };
    });
  };

  // Sender info is the one section we require, since it's what makes the
  // address genuinely useful: who it's from, where to reach them, and
  // where to send a reply.
  const senderIsValid =
    meta.letter.sender.fullName.trim().length > 0 &&
    meta.letter.sender.fullAddress.trim().length > 0 &&
    (meta.letter.sender.email.trim().length > 0 || meta.letter.sender.phone.trim().length > 0);

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
  
  const rawLetterBufferChunk = useRef<string>("");
const letterThrottleRef = useRef<NodeJS.Timeout | null>(null);
const parseLetterOutput = (rawText: string): LetterDataConfigType => {
  // 1. Initialize the core object fresh on every single parse call
  const { sender, receiver, topic } = meta.letter;

  const receiverExtras = receiver.additionalInfo.map((l) => l.trim()).filter(Boolean).join("\n");
  const senderName = sender.fullName.trim() || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || "");
  const receiverName = receiver.fullName.trim() || "To Whom It May Concern";
  const finalSalutation = receiver.salutation.trim() || `Dear ${receiverName},`;

  const data: LetterDataConfigType = {
    sender_name: senderName,
    recipient_name: receiverName,
    letter_title: topic.trim() || "Letter",
    salutation: finalSalutation,
    content: [],
    templateName: "ACADEMIC_ASSIGNMENT",
    phone: sender.phone || "",
    email: sender.email || "",
    // Sender's address block.
    address: sender.fullAddress,
    // NOTE: new fields — add these to LetterDataConfigType in pdfEngine.ts
    // and have compileLetterPDF render them accordingly.
    recipientAddress: receiver.address,
    recipientPosition: receiver.position,
    recipientOrganization: receiver.organization,
    recipientAdditionalInfo: receiverExtras,
    senderAdditionalInfo: sender.additionalInfo || [""],
    date: sender.date,
    addressAlignment: sender.alignment, // "left" (recommended) or "right"
    conclusion: ""
  };

  // 2. Split the current snapshot of the LLM response into processable lines
  const lines = rawText.split('\n');
  let segmentIndex = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return; // Ignore blank lines

    // --- A. Extract the Main Subject Header ---
    if (trimmedLine.startsWith('# HEADER:')) {
      const actualContent = trimmedLine.replace('# HEADER:', '').trim();
      // A user-provided topic always wins over the AI-generated one.
      const finalHeader = topic.trim() || actualContent;
      data.letter_title = finalHeader;

      data.content.push({
        id: `seg-${segmentIndex}`, // Avoid crypto.randomUUID() inside hot loops for streaming speed
        role: "header" as TextRole,
        content: finalHeader,
        index: segmentIndex++
      });
      return;
    }

    // --- B. Extract the Introduction / Salutation Block ---
    if (trimmedLine.startsWith('## INTRODUCTION:')) {
      const actualContent = trimmedLine.replace('## INTRODUCTION:', '').trim();
      
      data.content.push({
        id: `seg-${segmentIndex}`,
        role: "paragraph" as TextRole, 
        content: actualContent,
        index: segmentIndex++
      });
      return;
    }

    // --- C. Extract Core Body & Sign-Off Paragraphs ---
    if (trimmedLine.startsWith('### PARAGRAPH:')) {
      const actualContent = trimmedLine.replace('### PARAGRAPH:', '').trim();
      const isSignOff = /sincerely|yours faithfully|best regards/i.test(actualContent);
      
      data.content.push({
        id: `seg-${segmentIndex}`,
        role: (isSignOff ? "sign-off" : "paragraph") as TextRole,
        content: actualContent,
        index: segmentIndex++
      });
      return;
    }

    // --- D. Extract Conclusion Parameter ---
    if (trimmedLine.startsWith("## CONCLUSION:")) {
      const actualContent = trimmedLine.replace('## CONCLUSION:', '').trim();
      data.conclusion = actualContent;
      return;
    }
    
    // --- E. Fallback for un-tagged text (Safety Net) ---
    if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
      data.content.push({
        id: `seg-${segmentIndex}`,
        role: "paragraph" as TextRole,
        content: trimmedLine,
        index: segmentIndex++
      });
    }
  });

  // Push the compiled data structure directly into your application state
  setLetterReq(data);
  return data;
};

//GETTING THE CHUNK OF TEXTS FROM ANTHROPIC
const handleGenerate = async () => {
  if (!senderIsValid) {
    setActiveSection("sender");
    setShowValidation(true);
    return;
  }
  setShowValidation(false);
  setEditMode(false);
  
  try {
    setLoadingState(true);
    const response = await fetch("/api/quickassessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        prompt, 
        wordCount,
        intent: intent || "",
        track: "letter",
        TrackInfo: {
          senderName: meta.letter.sender.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || ""),
          receiverName: meta.letter.receiver.fullName || "Not Set",
          topic: meta.letter.topic || "",
        }
      })
    });

    if (response.ok) {
      setLoadingState(false);
      
      // 1. Get the raw low-level stream reader from the network interface
      const reader = response?.body?.getReader();
      if (!reader) return;

      // 2. Reveal the preview canvas container instantly so streaming is visible
      setLetterPreviewModal(true);
      setEditMode(true);
      
      const decoder = new TextDecoder("utf-8");
      rawLetterBufferChunk.current = ""; // Reset the core string reference cache

      // 3. Real-time stream processing loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode binary Uint8Array network packets directly back into plaintext strings
        const incomingTextChunk = decoder.decode(value, { stream: true });
        
        // Append tokens directly to our fast reference string cache
        rawLetterBufferChunk.current += incomingTextChunk;

        // Skip updating React state if a rendering window timer is already ticking
        if (!letterThrottleRef.current) {
          letterThrottleRef.current = setTimeout(() => {
            parseLetterOutput(rawLetterBufferChunk.current);
            letterThrottleRef.current = null; // Open processing gate back up
          }, 75); // 75ms delivers fluid animations with zero CPU throttling
        }
      }

      // 5. Final sync execution block to catch remaining tail end tokens
      if (letterThrottleRef.current) {
        clearTimeout(letterThrottleRef.current);
        letterThrottleRef.current = null;
      }
      parseLetterOutput(rawLetterBufferChunk.current);

    } else {
      alert("WDC_FORMATT AI is currently down.");
      return;
    }
  } catch (error) {
    console.error("Streaming pipeline interaction crash:", error);
    alert("WDC_FORMATT AI is currently down.");
  } finally {
    setLoadingState(false);
    setIsParsing(false);
  }
};
  return (

  <div className="bg-[#F2F0E9] h-auto py-8 flex items-start lg:px-[20%] px-5
  flex-col gap-8 lg:gap-10 w-full not-italic">

    {/* ===== STEP 0 — Topic ===== 
        What the letter is about. Shown uppercase + underlined, matching
        how it will sit at the top of the finished document. */}
    <div className="w-full space-y-2">
      <FieldLabel icon={FileText} required>Topic of the Letter</FieldLabel>
      <TextInput
        placeholder="e.g. Request for Release of Academic Transcript"
        value={meta.letter.topic}
        onChange={(e) => setMeta((prev) => ({ ...prev, letter: { ...prev.letter, topic: e.target.value } }))}
        className="!py-3.5 !text-base !border-[#483C32] shadow-[6px_6px_0px_0px_rgba(72,60,50,1)] !rounded-2xl"
      />
      {meta.letter.topic ? (
        <p className="text-sm font-black uppercase underline underline-offset-4 decoration-2 decoration-[#D4AF37] text-[#483C32] pt-1">
          {meta.letter.topic}
        </p>
      ) : (
        <p className="text-xs text-[#483C32]/50">This is treated as a formal letter — leave blank and {`we'll`} title it for you.</p>
      )}
    </div>

    {/* ===== STEP 1 & 2 — Address ===== */}
    <div className="w-full space-y-3">
      <p className="text-xs text-[#483C32]/60">
        Every formal letter starts with knowing who {`it's`} from and who {`it's`}  for. Start with your own details below.
      </p>

      <AccordionSection
        step={1}
        title="Sender Information"
        subtitle="Your details — who this letter is coming from"
        isOpen={activeSection === "sender"}
        onToggle={() => setActiveSection("sender")}
      >
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FieldLabel icon={User} required>Full Name</FieldLabel>
            <TextInput
              placeholder="e.g. Adaeze Okonkwo"
              value={meta.letter.sender.fullName}
              onChange={(e) => setSenderField("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel icon={CalendarDays}>Date</FieldLabel>
            <TextInput
              type="date"
              value={meta.letter.sender.date}
              onChange={(e) => setSenderField("date", e.target.value)}
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <FieldLabel icon={MapPin} required>Full Address</FieldLabel>
            <textarea
              placeholder="Street, city, state, zip, country"
              value={meta.letter.sender.fullAddress}
              onChange={(e) => setSenderField("fullAddress", e.target.value)}
              className="w-full h-20 bg-white/60 border-2 border-[#483C32]/25 px-4 py-2.5 rounded-xl
                text-sm font-medium not-italic focus:border-[#D4AF37] outline-none transition-all resize-none
                placeholder:not-italic placeholder:text-[#483C32]/40"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel icon={Mail}>Email {meta.letter.sender.email || meta.letter.sender.phone ? "" : "(or Phone)"}</FieldLabel>
            <TextInput
              type="email"
              placeholder="you@example.com"
              value={meta.letter.sender.email}
              onChange={(e) => setSenderField("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel icon={Phone}>Phone {meta.letter.sender.email || meta.letter.sender.phone ? "" : "(or Email)"}</FieldLabel>
            <TextInput
              type="tel"
              placeholder="e.g. +234 800 000 0000"
              value={meta.letter.sender.phone}
              onChange={(e) => setSenderField("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <FieldLabel>Address Alignment</FieldLabel>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center gap-2 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all
                ${meta.letter.sender.alignment === "left" ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#483C32]/20"}`}>
                <input
                  type="radio"
                  name="sender-alignment"
                  checked={meta.letter.sender.alignment === "left"}
                  onChange={() => setSenderField("alignment", "left")}
                  className="accent-[#D4AF37]"
                />
                <AlignLeft className="w-4 h-4 text-[#483C32]" />
                <span className="text-sm font-bold text-[#483C32]">Left aligned <span className="font-medium text-[#483C32]/60">(recommended)</span></span>
              </label>
              <label className={`flex-1 flex items-center gap-2 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all
                ${meta.letter.sender.alignment === "right" ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#483C32]/20"}`}>
                <input
                  type="radio"
                  name="sender-alignment"
                  checked={meta.letter.sender.alignment === "right"}
                  onChange={() => setSenderField("alignment", "right")}
                  className="accent-[#D4AF37]"
                />
                <AlignRight className="w-4 h-4 text-[#483C32]" />
                <span className="text-sm font-bold text-[#483C32]">Right aligned</span>
              </label>
            </div>
          </div>

          {/* <div className="space-y-2 lg:col-span-2">
            <FieldLabel>Additional Information</FieldLabel>
            <TextInput
              placeholder="Additional sender address info"
              value={meta.letter.sender.additionalInfo}
              onChange={(e) => setSenderField("additionalInfo", e.target.value)}
            />
          </div> */}
                      <div className="space-y-2 lg:col-span-2">
            <FieldLabel>Additional Information</FieldLabel>
            {meta.letter.sender.additionalInfo.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <TextInput
                  placeholder="Additional sender address info"
                  value={val}
                  onChange={(e) => updateSenderExtra(idx, e.target.value)}
                  className="flex-1"
                />
                {meta.letter.sender.additionalInfo.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSenderExtra(idx)}
                    className="text-[#483C32]/40 hover:text-[#B3261E] transition-colors p-1 shrink-0"
                    aria-label="Remove this field"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSenderExtra}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#483C32] transition-colors mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add another field
            </button>
          </div>
        </div>

        {showValidation && !senderIsValid && (
          <p className="text-xs font-bold text-[#B3261E] mt-4">
            Please add your full name, full address, and at least an email or phone number before generating.
          </p>
        )}
      </AccordionSection>

      <AccordionSection
        step={2}
        title="Recipient Information"
        subtitle="Who this letter is addressed to"
        isOpen={activeSection === "receiver"}
        onToggle={() => setActiveSection("receiver")}
      >
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FieldLabel icon={User}>Full Name</FieldLabel>
            <TextInput
              placeholder="e.g. Dr. Musa Ibrahim"
              value={meta.letter.receiver.fullName}
              onChange={(e) => setReceiverField("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel icon={Building2}>Position</FieldLabel>
            <TextInput
              placeholder="e.g. Head of Admissions"
              value={meta.letter.receiver.position}
              onChange={(e) => setReceiverField("position", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel icon={Building2}>Organization</FieldLabel>
            <TextInput
              placeholder="e.g. University of Lagos"
              value={meta.letter.receiver.organization}
              onChange={(e) => setReceiverField("organization", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>How to Address Them</FieldLabel>
            <TextInput
              placeholder="Dear Sir/Ma, Dear Recruitment Team"
              value={meta.letter.receiver.salutation}
              onChange={(e) => setReceiverField("salutation", e.target.value)}
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <FieldLabel icon={MapPin}>Address</FieldLabel>
            <textarea
              placeholder="Street, city, state, zip, country"
              value={meta.letter.receiver.address}
              onChange={(e) => setReceiverField("address", e.target.value)}
              className="w-full h-20 bg-white/60 border-2 border-[#483C32]/25 px-4 py-2.5 rounded-xl
                text-sm font-medium not-italic focus:border-[#D4AF37] outline-none transition-all resize-none
                placeholder:not-italic placeholder:text-[#483C32]/40"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <FieldLabel>Additional Information</FieldLabel>
            {meta.letter.receiver.additionalInfo.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <TextInput
                  placeholder="Additional receiver address info"
                  value={val}
                  onChange={(e) => updateReceiverExtra(idx, e.target.value)}
                  className="flex-1"
                />
                {meta.letter.receiver.additionalInfo.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReceiverExtra(idx)}
                    className="text-[#483C32]/40 hover:text-[#B3261E] transition-colors p-1 shrink-0"
                    aria-label="Remove this field"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
                    <div className="space-y-2 lg:col-span-2">
            <FieldLabel>Additional Information</FieldLabel>
            {meta.letter.receiver.additionalInfo.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <TextInput
                  placeholder="Additional receiver address info"
                  value={val}
                  onChange={(e) => updateReceiverExtra(idx, e.target.value)}
                  className="flex-1"
                />
                {meta.letter.receiver.additionalInfo.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReceiverExtra(idx)}
                    className="text-[#483C32]/40 hover:text-[#B3261E] transition-colors p-1 shrink-0"
                    aria-label="Remove this field"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addReceiverExtra}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#483C32] transition-colors mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add another field
            </button>
          </div>
          </div>
        </div>
      </AccordionSection>
    </div>

    {/* ===== STEP 3 — Prompt & Intent ===== */}
     <div className= {`flex lg:flex-row flex-col w-full
     justify-between gap-4`}>
      {/* PROMPT TEXT AREA */}
        <div className="space-y-2">
                <FieldLabel icon={FileText}>The Prompt (Actual Assessment)</FieldLabel>
                <textarea 
                  placeholder="Paste the core assessment content here. Avoid adding instructions..."
                  className="w-full h-32 bg-[#F2F0E9] border-2 border-[#483C32] p-4 rounded-2xl
                   text-base leading-relaxed font-medium not-italic focus:border-[#D4AF37] outline-none transition-all resize-none 
                   shadow-[6px_6px_0px_0px_rgba(72,60,50,1)] placeholder:not-italic"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* INTENT TEXTAREA */}
                  <div className="space-y-2">
                <FieldLabel icon={Settings2}>Intent / Strategy (Instructions)</FieldLabel>
                <textarea 
                  placeholder="Define the prompt strategy (e.g., Use Nigerian case studies, keep tone formal)..."
                  className="w-full h-32 bg-white/40 border-2 border-[#483C32]/20 p-4 rounded-2xl
                   font-medium text-base leading-relaxed not-italic focus:border-[#483C32] outline-none transition-all resize-none shadow-sm placeholder:not-italic"
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
          //    console.log("GENERATING PDF")
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