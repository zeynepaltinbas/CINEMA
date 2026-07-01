"use client"

import React from "react";
import { useState } from "react";

interface TrailerProps {
    trailerKey?: string;
    title: string;
}

export default function Trailer({ trailerKey, title }: TrailerProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (!trailerKey) return null

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d11c7f]/50 bg-[#d11c7f]/15 px-4 text-sm font-bold text-[#f7c6df] transition-colors hover:bg-[#d11c7f]/25 cursor-pointer"
            >
                ▷ Watch trailer
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-70 grid place-items-center bg-[#020617]/80 px-4 py-6 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="trailer-modal-title"
                        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#f2a4cf]/20 bg-[#111827] shadow-2xl shadow-black/50 animate-[profileModalIn_220ms_ease-out]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-4 border-b border-[#2d3f55] bg-[#151223] px-4 py-3 sm:px-5">
                            <div>
                                <h2 id="trailer-modal-title" className="text-base font-bold text-slate-100">Trailer</h2>
                                <p className="mt-0.5 text-xs text-slate-400">{title}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-[#232c3f] hover:text-slate-100 cursor-pointer"
                                aria-label="Close trailer"
                            >
                                x
                            </button>
                        </div>

                        <div className="aspect-video bg-black">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                                title={`${title} trailer`}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}