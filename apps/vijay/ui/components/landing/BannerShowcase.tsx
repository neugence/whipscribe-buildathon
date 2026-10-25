"use client";

import React, { useEffect, useRef } from "react";
import { getGsap } from "@/lib/gsap";

export function BannerShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { gsap } = getGsap();
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full relative overflow-hidden py-10 sm:py-14 bg-background border-b border-border/40"
    >
      {/* Background ambient glow matching banner colors */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Independent section full screen width - no padding x */}
      <div ref={bannerRef} className="w-full max-w-full px-0 shadow-2xl relative z-10">
        <img
          src="/banner.png"
          alt="CallBrief — Turn Client Calls Into Project Briefs"
          className="w-full h-auto object-cover block"
        />
      </div>
    </section>
  );
}
