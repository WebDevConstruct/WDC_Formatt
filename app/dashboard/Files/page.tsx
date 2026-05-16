"use client"
import React, {useState} from 'react';
import { CheckCircle2, ArrowRight, Gem, Compass, Shield,BookOpenCheck } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";

const TEMPLATES = [
  {
    id: 'quick',
    title: 'Quick Assessment',
    tagline: 'Velocity Through Clarity',
    navigateTo :"/dashboard/Files/quick_assessment",
    serviceVibe: 'Flex', 
    description: 'A high-velocity framework for the precise student. Refined, rapid, and inherently professional.',
    perks: [
      { label: 'Academic Velocity', detail: 'Instant PDF rendering optimized for immediate review.' },
      { label: 'Majestic Presets', detail: 'Hard-coded Bold Headers for immediate visual authority.' },
      { label: 'Sync-Red Logic', detail: 'Subtle error-checking ensuring your memo meets WDC standards.' }
    ],
    features: ['1-Page Official Memo', '2-Page Structural Report'],
    theme: {
      bg: 'bg-[#F9F7F2]', // Warm Parchment
      border: 'border-[#483C32]/20',
      accent: 'text-[#483C32]', // Majestic Brown
      buttonBg: 'bg-[#483C32]',
      tagBg: 'bg-[#483C32]/10',
      shadow: 'hover:shadow-[0_20px_60px_-15px_rgba(72,60,50,0.2)]',
      icon: <Gem size={24} className="text-white" />
    }
  },
  {
    id: 'critical',
    title: 'Critical Assessment',
    tagline: 'The Executive Masterpiece',
    serviceVibe: 'The Control Room',
    navigateTo : "/dashboard/Files/critical_assessment",
    description: 'The gold standard for scholars. A bespoke workspace for data-driven precision and heavy-duty reports.',
    perks: [
      { label: 'Bespoke Sovereignty', detail: 'Total structural control over every header and sub-header.' },
      { label: 'Analytical Grounding', detail: 'AI analysis anchored strictly to your provided raw data.' },
      { label: 'Gold Standard Formatting', detail: 'Intelligent recognition of SWOT arrays and Ratio tables.' }
    ],
    features: ['Custom Prompt Injection', 'Manual Sectional Control'],
    theme: {
      bg: 'bg-[#1A1614]', // Deepest Obsidian Brown
      border: 'border-[#D4AF37]/30', // Gold Border
      accent: 'text-[#D4AF37]', // Majestic Gold
      buttonBg: 'bg-[#D4AF37]',
      tagBg: 'bg-[#D4AF37]/10',
      shadow: 'hover:shadow-[0_30px_80px_-15px_rgba(212,175,55,0.25)]',
      icon: <Compass size={24} className="text-black" />
    }
  },
  {
    id: 'image',
    title: 'Image Assessment',
    tagline: 'PDF caricature of image',
    navigateTo :"/dashboard/Files/image_assessment",
    serviceVibe: 'Image-To-PDF_TEXT-Gen', 
    description: 'A high-velocity framework for the precise student. Refined, rapid, and inherently professional.',
    perks: [
      { label: 'Image to text PDF Conversion', detail: 'Transform images into editable text within PDFs.' },
      { label: 'Quick Generation within 2-3 minutes', detail: 'Avoid long time intervals at the CyberCafe or with the typist.' },
      { label: 'Impromptu Assignment', detail: 'Take a snapshot of the image, and get your PDF ready in no time!' }
    ],
    features: ['Your Customised FrontPage', 'Unlimited Pages', "Manual and AI-Driven Formatting"],
    theme: {
      bg: 'bg-[#F9F7F2]', // Warm Parchment
      border: 'border-[#483C32]/20',
      accent: 'text-[#483C32]', // Majestic Brown
      buttonBg: 'bg-[#483C32]',
      tagBg: 'bg-[#483C32]/10',
      shadow: 'hover:shadow-[0_20px_60px_-15px_rgba(72,60,50,0.2)]',
      icon: <BookOpenCheck size={24} className="text-white" />
    }
  },
];

const MajesticBrownSelection = () => {
 // const router = useRouter()
    const [onSelect,  setOnSelect] = React.useState("");
  

  
  return (
    <div className="min-h-screen bg-[#F2F0E9] py-20 px-6 antialiased font-sans">
      {/* Signature Header */}

      <Link href="/dashboard" 
      className ="flex gap-2 items-center my-4">
        <Image src="/ArrowBack.svg" alt="Back to Dashboard" width={24} height={24}/>
        <p className="text-lg font-bold text-[#483C32]/80 hover:opacity-90 hover:text-[17px]">
         Dashboard</p>  
      </Link>

      <header className="max-w-5xl mx-auto text-center mb-24">
        <div className="flex justify-center items-center mb-8">
            <div className="h-[1px] w-16 bg-[#483C32]/30"></div>
            <Shield className="mx-4 text-[#D4AF37]" size={20} />
            <div className="h-[1px] w-16 bg-[#483C32]/30"></div>
        </div>
        <h2 className="text-xs font-bold tracking-[0.4em] text-[#483C32] uppercase mb-4">
          WDC — Architectural Document Suite
        </h2>
        <h1 className="text-5xl md:text-6xl font-serif text-[#2C2520] mb-8 tracking-tight">
          Select Your <span className="italic">Majestic</span> Path
        </h1>
        <p className="max-w-2xl mx-auto text-[#483C32]/80 text-lg leading-relaxed font-light">
          Your vision deserves an engine of equivalent stature. 
          Choose the mode that aligns with your strategic intent.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-10 w-full">
        {TEMPLATES.map((template) => (
          <div 
            key={template.id}
            onClick={() => setOnSelect(template.id)}
            className={`group relative ${template.theme.bg}  ${template.theme.border}
             border-[1.5px] rounded-[2.5rem] md:w-1/2 w-full md:p-12 p-8 transition-all 
            duration-700 cursor-pointer overflow-hidden ${template.theme.shadow} hover:-translate-y-3`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className={`p-1 ${template.theme.buttonBg} rounded-2xl shadow-xl`}>
                  {template.theme.icon}
                </div>
                <span className={`text-[10px] font-black ${template.theme.accent} ${template.theme.tagBg} px-5 py-2 rounded-full uppercase tracking-[0.25em] border ${template.id === 'critical' ? 'border-[#D4AF37]/20' : 'border-[#483C32]/20'}`}>
                  {template.serviceVibe}
                </span>
              </div>

              <h3 className={`text-4xl font-serif font-bold mb-3 ${template.id === 'critical' ? 'text-white' : 'text-[#2C2520]'}`}>
                {template.title}
              </h3>
              <p className={`${template.theme.accent} font-bold text-[11px] mb-8 uppercase tracking-[0.2em] opacity-90`}>
                {template.tagline}
              </p>
              
              {/* SERVICE PERKS ARRAY */}
              <div className={`mb-10 p-8 rounded-[2rem] ${template.id === 'quick' ? 'bg-white/60 border border-[#483C32]/5' : 'bg-white/[0.03] border border-white/5'}`}>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${template.id === 'quick' ? 'text-[#483C32]/40' : 'text-[#D4AF37]/50'}`}>
                  Quality Standards
                </h4>
                <div className="space-y-6">
                  {template.perks.map((perk, index) => (
                    <div key={index} className="flex items-start group/perk">
                      <CheckCircle2 size={18} className={`${template.theme.accent} mr-4 mt-1 shrink-0`} />
                      <div className="text-sm">
                        <span className={`font-bold block mb-1 ${template.id === 'critical' ? 'text-white' : 'text-[#2C2520]'}`}>
                          {perk.label}
                        </span>
                        <span className={`${template.id === 'critical' ? 'text-gray-400' : 'text-gray-600'} font-light leading-relaxed`}>
                          {perk.detail}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION & METADATA */}
              <div className={`space-y-6 mb-12 ${template.id === 'critical' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className={`text-sm italic border-l-2 ${template.id === 'critical' ? 'border-[#D4AF37]' : 'border-[#483C32]'} pl-6 py-1`}>
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {template.features.map((feature, idx) => (
                    <span key={idx} className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-widest ${template.id === 'critical' ? 'border-white/10 text-gray-300' : 'border-[#483C32]/10 text-[#483C32]'}`}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* FINAL ACTION */}
              <Link href={template?.navigateTo} className={`flex items-center ${template.theme.accent} font-black text-xs
               uppercase tracking-[0.3em] group-hover:gap-6 transition-all duration-500`}>
                Initialize Build <ArrowRight size={20} className="ml-3" />
              </Link>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
          </div>
        ))}
      </div>

      <footer className="mt-24 text-center">
         <p className="text-[#483C32] font-serif italic text-sm opacity-50">
            Majestic reporting for the modern intellect.
         </p>
      </footer>

    </div>
    
  );
};

export default MajesticBrownSelection;