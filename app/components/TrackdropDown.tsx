"use client";
import React, { useState } from 'react';

export type TrackType = 'letter' | 'essay' | 'assignment' | 'research-padi';

interface DropdownProps {
  currentTrack: TrackType;
  onTrackChange: (track: TrackType) => void;
}

export default function TrackDropdown({ currentTrack, onTrackChange }: DropdownProps) {
  return (
    <div className="relative inline-block w-full sm:w-72">
      {/* Label for accessibility */}
      <label htmlFor="track-dropdown" className="sr-only">
        Select Quick Assessment Track
      </label>
      
      <select
        id="track-dropdown"
        value={currentTrack}
        onChange={(e) => onTrackChange(e.target.value as TrackType)}
        className="block w-full appearance-none bg-white text-xs font-mono font-bold uppercase tracking-widest px-5 py-3.5 pr-12 rounded-xl border border-[#483C32]/20 focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all duration-200 cursor-pointer shadow-sm hover:border-[#483C32]/40"
        style={{ color: '#483C32' }}
      >
        <option value="letter" className="font-mono text-xs uppercase bg-white py-2">
          Track 01 // Letter
        </option>
        <option value="essay" className="font-mono text-xs uppercase bg-white py-2">
          Track 02 // Structured Essay
        </option>
        <option value="assignment" className="font-mono text-xs uppercase bg-white py-2">
          Track 03 // Assignment Set
        </option>
        <option value="research-padi" className="font-mono text-xs uppercase bg-white py-2 text-red-700">
          Track 04 // Research Padi
        </option>
      </select>

      {/* Custom Geometric Arrow Accent using Gold (#D4AF37) */}
      <div 
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-[#483C32]/10 my-2"
        style={{ color: '#D4AF37' }}
      >
        <svg 
          className="w-3 h-3 transition-transform duration-200 group-focus:rotate-180" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="3" 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
    </div>
  );
}