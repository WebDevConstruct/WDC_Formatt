"use client"
import { createContext, PropsWithChildren, useContext } from "react";
import { useState,  } from "react";

const ContextHolder  = createContext<any>({});
export const useGlobalContext = ()=> useContext(ContextHolder)
export const ContextProvider =({children}: PropsWithChildren)=> {
  const [config, setConfig] = useState({
      prompt: '',
     // targetPage: 'Assessment Report',
      title: '',
      titleFormat: 'Uppercase-Bold',
      subTitles: '',
      subTitleFormat: 'Sentence-case-Italic',
      paragraphs: '',
      paragraphFormat: 'Standard-Justified'
    });

    const holdValues ={
        config
        , setConfig
    }
    return (
        <ContextHolder value ={holdValues} >
        {children}
        </ContextHolder>
    )
} 
