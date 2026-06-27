"use client";

import React, { useState } from "react";
import { Monitor, ShieldAlert, Check } from "lucide-react";
import { DocumentSegment } from "@/app/dashboard/Files/quick_assessment/assignment/page";
import { LetterDataConfigType } from "@/lib/pdfEngine"; // Adjust path as needed

interface LetterPreviewModalProps {
    generatePDF : ()=> void,
    regenerateContent : ()=> void,
  isOpen: boolean;
  onClose: () => void;
  letterData: LetterDataConfigType;
  setLetterData: React.Dispatch<React.SetStateAction<LetterDataConfigType>>;
}

export default function LetterPreviewModal({
    generatePDF,
    regenerateContent,
  isOpen,
  onClose,
  letterData,
  setLetterData,
}: LetterPreviewModalProps) {
  const [livePreviewDefault, setLivePreviewDefault] = useState<"edit" | "review">("review");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMetaField, setEditingMetaField] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handler for content segment array updates
  const handleSegmentTextChange = (id: string, updatedText: string) => {
    setLetterData((prev) => ({
      ...prev,
      content: prev.content.map((seg) =>
        seg.id === id ? { ...seg, content: updatedText } : seg
      ),
    }));
  };

  // Handler for metadata fields (Sender/Recipient parameters)
  const handleMetaFieldChange = (field: keyof LetterDataConfigType, value: string) => {
    setLetterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Sort content on the fly by index to guarantee letter narrative structure
  const sortedContent = [...(letterData?.content || [])].sort((a, b) => a.index - b.index);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 md:p-10 animate-fade-in">
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* --- MODAL CONTROL HEADER --- */}
        <div className="p-4 bg-zinc-900 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono tracking-widest uppercase text-zinc-300">
              Architectural Canvas Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-zinc-800 p-0.5 rounded-lg flex border border-zinc-700">
              <button
                onClick={() => { setLivePreviewDefault("review"); setEditingId(null); setEditingMetaField(null); }}
                className={`text-xs px-3 py-1.5 font-medium rounded-md transition ${
                  livePreviewDefault === "review" ? "bg-zinc-100 text-zinc-900 shadow-xs" : "text-zinc-400 hover:text-white"
                }`}
              >
                Review Layout
              </button>
              <button
                onClick={() => setLivePreviewDefault("edit")}
                className={`text-xs px-3 py-1.5 font-medium rounded-md transition ${
                  livePreviewDefault === "edit" ? "bg-zinc-100 text-zinc-900 shadow-xs" : "text-zinc-400 hover:text-white"
                }`}
              >
                Interactive Edit
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-xs bg-zinc-800 border border-zinc-700 hover:border-zinc-500 px-3 py-2 rounded-lg text-white font-medium transition"
            >
              Close Engine
            </button>
          </div>
        </div>

        {/* --- DYNAMIC LETTER LAYOUT STREAM --- */}
        <div className="flex-1 p-8 md:p-16 overflow-y-auto bg-zinc-50/50 custom-scrollbar">
          {sortedContent.length > 0 ? (
            <div className="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-xl shadow-xs p-8 md:p-12 font-sans relative min-h-[700px] text-zinc-900">
              
              {/* SECTION 1: Sender Data Block (Right-Aligned) */}
              <div className="flex flex-col items-end text-right mb-10 group relative">
                {livePreviewDefault === "edit" && (
                  <span className="absolute -top-5 right-0 text-[8px] font-mono uppercase bg-zinc-100 text-zinc-500 px-1 rounded">
                    Sender Block (Click to Edit)
                  </span>
                )}
                
                {editingMetaField === "sender_block" && livePreviewDefault === "edit" ? (
                  <div className="w-full max-w-sm space-y-2" onBlur={() => setEditingMetaField(null)}>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 text-right text-xs border border-zinc-200 rounded-sm px-2 py-1 outline-none font-bold"
                      value={letterData.sender_name}
                      onChange={(e) => handleMetaFieldChange("sender_name", e.target.value)}
                      placeholder="Sender Name"
                      autoFocus
                    />
                    <textarea
                      className="w-full bg-zinc-50 text-right text-xs border border-zinc-200 rounded-sm px-2 py-1 outline-none resize-none"
                      value={letterData.address}
                      onChange={(e) => handleMetaFieldChange("address", e.target.value)}
                      placeholder="Address"
                      rows={2}
                    />
                    <input
                      type="text"
                      className="w-full bg-zinc-50 text-right text-xs border border-zinc-200 rounded-sm px-2 py-1 outline-none"
                      value={letterData.phone}
                      onChange={(e) => handleMetaFieldChange("phone", e.target.value)}
                      placeholder="Phone"
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => livePreviewDefault === "edit" && setEditingMetaField("sender_block")}
                    className={`space-y-0.5 cursor-pointer rounded-sm p-1 transition ${livePreviewDefault === "edit" ? "hover:bg-zinc-50 border border-transparent hover:border-zinc-200" : ""}`}
                  >
                    <p className="text-sm font-bold uppercase tracking-tight">{letterData.sender_name || "Sender Name"}</p>
                    <p className="text-xs text-zinc-600 whitespace-pre-wrap">{letterData.address || "Physical Address"}</p>
                    <p className="text-xs text-zinc-500">Phone: {letterData.phone || "Phone Reference"}</p>
                    <p className="text-xs text-zinc-500">Email: {letterData.email || "Email Route"}</p>
                  </div>
                )}
              </div>

              {/* SECTION 2: Datestamp & Recipient Meta (Left-Aligned) */}
              <div className="mb-8 space-y-4 group relative">
                <p className="text-xs font-mono text-zinc-400">
                  {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                
                {editingMetaField === "recipient_name" && livePreviewDefault === "edit" ? (
                  <input
                    type="text"
                    className="w-full max-w-md bg-zinc-50 text-xs border border-zinc-200 rounded-sm px-2 py-1 outline-none font-bold"
                    value={letterData.recipient_name}
                    onChange={(e) => handleMetaFieldChange("recipient_name", e.target.value)}
                    onBlur={() => setEditingMetaField(null)}
                    autoFocus
                  />
                ) : (
                  <h2 
                    onClick={() => livePreviewDefault === "edit" && setEditingMetaField("recipient_name")}
                    className={`text-sm font-bold uppercase tracking-wide cursor-pointer p-1 rounded-sm transition ${livePreviewDefault === "edit" ? "hover:bg-zinc-50 border border-transparent hover:border-zinc-200" : ""}`}
                  >
                    {letterData.recipient_name || "RECIPIENT DESIGNATION / TITLE"}
                  </h2>
                )}

                {/* Salutation Block Row */}
                {editingMetaField === "salutation" && livePreviewDefault === "edit" ? (
                  <input
                    type="text"
                    className="w-full max-w-xs bg-zinc-50 text-xs border border-zinc-200 rounded-sm px-2 py-1 outline-none"
                    value={letterData.salutation}
                    onChange={(e) => handleMetaFieldChange("salutation", e.target.value)}
                    onBlur={() => setEditingMetaField(null)}
                    autoFocus
                  />
                ) : (
                  <p 
                    onClick={() => livePreviewDefault === "edit" && setEditingMetaField("salutation")}
                    className={`text-sm text-zinc-800 cursor-pointer p-1 rounded-sm transition ${livePreviewDefault === "edit" ? "hover:bg-zinc-50 border border-transparent hover:border-zinc-200" : ""}`}
                  >
                    {letterData.salutation || "Dear Sir/Ma,"}
                  </p>
                )}
              </div>

              {/* SECTION 3: Sequential Block Document Content Stream */}
              <div className="space-y-6">
                {sortedContent.map((seg) => (
                  <div
                    key={seg.id}
                    onClick={() => {
                      if (livePreviewDefault === "edit") {
                        setEditingId(seg.id);
                        setEditingMetaField(null);
                      }
                    }}
                    className={`relative group/seg p-1 transition-all rounded-sm border ${
                      editingId === seg.id && livePreviewDefault === "edit"
                        ? "border-zinc-900 bg-zinc-50/50"
                        : "border-transparent hover:border-zinc-200 cursor-pointer"
                    }`}
                  >
                    {/* Tiny Role Descriptor Label Flags inside interactive mode */}
                    {livePreviewDefault === "edit" && (
                      <span className={`absolute -left-3 -top-3.5 text-[8px] font-mono px-1.5 py-0.5 rounded-xs tracking-wider transition ${
                        editingId === seg.id ? "bg-zinc-900 text-white font-bold" : "bg-zinc-100 text-zinc-400"
                      }`}>
                        {seg.role.toUpperCase()}
                      </span>
                    )}

                    {editingId === seg.id && livePreviewDefault === "edit" ? (
                      <textarea
                        autoFocus
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-sans text-zinc-800 resize-none outline-none leading-relaxed"
                        value={seg.content}
                        onChange={(e) => handleSegmentTextChange(seg.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        rows={Math.max(3, Math.ceil(seg.content.length / 65))}
                      />
                    ) : (
                      <div className="leading-relaxed">
                        {seg.role === "header" && (
                          <div className="mb-4">
                            <h3 className="text-sm font-bold text-zinc-900 tracking-tight uppercase">
                              RE: {seg.content}
                            </h3>
                            <div className="h-[1px] bg-zinc-800 w-1/3 mt-1" />
                          </div>
                        )}
                        {(seg.role === "paragraph" || seg.role === "introduction" || seg.role === "conclusion") && (
                          <p className="text-sm text-zinc-800 font-sans leading-relaxed text-justify">
                            {seg.content}
                          </p>
                        )}
                        {seg.role === "sign-off" && (
                          <div className="mt-8 pt-4 border-t border-zinc-100 font-sans text-sm text-zinc-800 whitespace-pre-wrap">
                            {seg.content}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-32 text-zinc-400 font-sans">
              <ShieldAlert className="w-10 h-10 mb-3 text-zinc-300" />
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Stream Cache Vacant</p>
              <p className="text-xs text-zinc-400 mt-1">Please populate the dashboard input fields first.</p>
            </div>
          )}
        </div>

      <div className="w-full justify-center items-center flex gap-4">
      {letterData?.content?.length > 0 && (
        <button onClick={() => {

        generatePDF();
        }}
                className='bg-black py-4 text-white px-4 rounded-lg text-[12px] 
                uppercase font-bold tracking-widest shadow-md hover:bg-black/80 transition-all'>
          Done
        </button>
        
      )}
       <button onClick={() => {
         regenerateContent();
        }}
                className='bg-white py-4 text-black px-4 rounded-lg text-[12px] border-black
                uppercase font-bold tracking-widest shadow-md hover:bg-black/80 transition-all'>
          Retry
        </button>
      </div>
      </div>
    </div>
  );
}