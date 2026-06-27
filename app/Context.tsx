"use client"
import { createContext, PropsWithChildren, useContext } from "react";
import { useState, useMemo} from "react";

const ContextHolder  = createContext<any>({});
export const useGlobalContext = ()=> useContext(ContextHolder);
export const ContextProvider =({children}: PropsWithChildren)=> {
    const [trackChange, setTrackChange] = useState<"letter" | "essay" | "assignment" | "research-padi">("assignment");
const [prompt, setPrompt] = useState("");
const [intent, setIntent] = useState("");
const [hFormat, setHFormat] = useState([
  {id : 1, Format : "Bold", selected : false},
    {id : 2, Format : "Underline", selected : false}
  ]);
const [shFormat, setSHFormat] = useState([
   {id : 1, Format : "Bold", selected : false},
    {id : 2, Format : "Underline", selected : false}
]);
const [wordCount, setWordCount] = useState(0);
const [title,setTitle] = useState("");
const [userDetailsModal, setUserDetailsModal] = useState(false);
const [letterPreviewModal, setLetterPreviewModal] = useState(false)
   const holdValues = useMemo(() => ({
    prompt, setPrompt,
    intent, setIntent,
    hFormat, setHFormat,
    shFormat, setSHFormat,
    wordCount, setWordCount,
    title, setTitle,
    userDetailsModal, setUserDetailsModal, trackChange, setTrackChange,
    letterPreviewModal,  setLetterPreviewModal
  }), [prompt, intent, hFormat, shFormat, wordCount, title, userDetailsModal, trackChange, letterPreviewModal]);
    return (
        <ContextHolder.Provider value ={holdValues}>
        {children}
        </ContextHolder.Provider>
    )
} 
