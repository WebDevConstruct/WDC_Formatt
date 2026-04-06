"use client"
import { createContext, PropsWithChildren, useContext } from "react";
import { useState, useMemo} from "react";

const ContextHolder  = createContext<any>({});
export const useGlobalContext = ()=> useContext(ContextHolder);
export const ContextProvider =({children}: PropsWithChildren)=> {
    
const [prompt, setPrompt] = useState("");
const [intent, setIntent] = useState("");
const [hFormat, setHFormat] = useState("bold");
const [shFormat, setSHFormat] = useState("underline");
const [wordCount, setWordCount] = useState(0);
const [title,setTitle] = useState("");
const [userDetailsModal, setUserDetailsModal] = useState(false)
   const holdValues = useMemo(() => ({
    prompt, setPrompt,
    intent, setIntent,
    hFormat, setHFormat,
    shFormat, setSHFormat,
    wordCount, setWordCount,
    title, setTitle,
    userDetailsModal, setUserDetailsModal
  }), [prompt, intent, hFormat, shFormat, wordCount, title, userDetailsModal]);
    return (
        <ContextHolder.Provider value ={holdValues}>
        {children}
        </ContextHolder.Provider>
    )
} 
