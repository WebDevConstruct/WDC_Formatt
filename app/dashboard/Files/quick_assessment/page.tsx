"use client";
import React, { useState } from 'react';
import Link from "next/link";
type TrackType = 'letter' | 'essay' | 'assignment' | 'research-padi';

interface DropdownProps {
  currentTrack: TrackType;
  onTrackChange: (track: TrackType) => void;
}

export default function TrackDropdown({ currentTrack, onTrackChange }: DropdownProps) {
 const [track, setTrack] = useState<'letter' | 'essay' | 'assignment' | 'research-padi' | null>(null);

  const tracks = [
    {
      id: 'letter' as const,
      num: '01',
      title: 'Letters & Submissions',
      description: 'Draft crisp correspondence to faculty or administrators. Writes natively in the first person ("I") with completely seamless, bracket-free layout transitions.',
      nav : "/dashboard/Files/quick_assessment/letter"
    },
    // {
    //   id: 'essay' as const,
    //   num: '02',
    //   title: 'Structured Essays',
    //   description: 'Build high-level academic prose. Enforces rigorous paragraph flow, robust thesis defenses, and formal transitions. Lists and bullets are strictly banned.',
    //   nav : "/dashboard/Files/quick_assessment/essay"
    // },
    {
      id: 'assignment' as const,
      num: '03',
      title: 'Assignment Answers',
      description: 'Solve direct technical questions and problem sets. Designed for absolute scannability, incorporating itemized lists, clear steps, and concise formatting.',
        nav : "/dashboard/Files/quick_assessment/assignment"
    },
    // {
    //   id: 'research-padi' as const,
    //   num: '04',
    //   title: 'Research Padi',
    //   description: 'Consult an interactive research mentor. Brainstorm arguments, audit thesis ideas, and receive critical guidance from an expert senior lecturer perspective.',
    //     nav : "/dashboard/Files/quick_assessment/research_padi"
    // }
  ];

 

   return (
      <div className="min-h-screen bg-[#F2F0E9] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <span 
              className="text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 border rounded-full"
              style={{ borderColor: '#D4AF37', color: '#483C32' }}
            >
              wdc_formatt engine
            </span>
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl style-headline" style={{ color: '#483C32' }}>
              Quick Assessment <span className="text-red-700">Studio</span>
            </h2>
            <p className="text-[#483C32]/70 text-sm max-w-lg mx-auto leading-relaxed">
              Select your direct execution engine. Track 1, 2, and 3 output ready-to-use documents in your exact voice. Track 4 serves as your advisor.
            </p>
          </div>

          {/* 4-Track Grid Selection */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((t) => (
              <Link href ={t.nav}
                key={t.id}
                onClick={() => setTrack(t.id)}
                className="group relative flex flex-col justify-between h-80 p-6 text-left bg-white rounded-xl shadow-sm transition-all duration-300 border border-[#483C32]/20 hover:border-[#D4AF37]"
                style={{ '--hover-gold': '#D4AF37' } as React.CSSProperties}
              >
                <div className="space-y-4 relative z-10 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#483C32]/50 group-hover:text-red-700 transition-colors">
                      Track {t.num}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-[#483C32]/20 group-hover:bg-[#D4AF37] transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-bold tracking-tight uppercase transition-colors" style={{ color: '#483C32' }}>
                    {t.title}
                  </h3>
                  
                  <p className="text-xs leading-relaxed text-[#483C32]/80 transition-colors">
                    {t.description}
                  </p>
                </div>

                {/* Card Footer Divider & Action */}
                <div className="pt-4 border-t border-[#483C32]/10 w-full flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#483C32]/60 group-hover:text-[#483C32] transition-colors">
                    Launch Track
                  </span>
                  <span 
                    className="group-hover:translate-x-1 transform transition-all duration-300 text-sm font-bold"
                    style={{ color: '#483C32' }}
                  >
                    &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    );
}