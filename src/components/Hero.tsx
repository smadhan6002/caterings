import React from 'react';
import { siteConfig } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import heroImg from '../assets/Home section.jpg';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImg})`,
        }}
      />
      {/* Gradient Overlay for blending background smoothly at the bottom */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/10 via-white/40 to-slate-50" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-3xl mx-auto flex flex-col items-center mt-12 md:mt-24">
        <div className="flex items-center gap-2 text-primary font-medium text-sm tracking-wider uppercase mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
          {t.welcome}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 mb-4 tracking-tight px-4 w-full">
          {siteConfig.name}
        </h1>
        <p className="text-slate-600 text-lg md:text-xl">
          {t.heroDescription}
        </p>
      </div>
    </div>
  );
};

