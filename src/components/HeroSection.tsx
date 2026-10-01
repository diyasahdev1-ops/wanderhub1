import React, { useState } from 'react';
import { Search, Sparkles, MapPin, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onSearch: (query: string, style: string, region: string) => void;
  onOpenGeminiPlanner: (prefilledDest?: string) => void;
  onOpenMap: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOpenGeminiPlanner,
  onOpenMap,
}) => {
  const [query, setQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedStyle, selectedRegion);
  };

  const travelStyles = ['All', 'Culture', 'Foodie', 'Adventure', 'Romantic', 'Luxury', 'Budget'];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f6f4fe] via-[#fbfaff] to-white text-slate-800 py-16 md:py-24 border-b border-purple-100/60">
      {/* Background ambient dots & soft purple glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(#c4b5fd_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Top Badge matching image */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-purple-200/80 shadow-sm text-xs font-semibold text-slate-700 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#9582d9]" />
          <span>AI-Powered Travel Planning</span>
        </motion.div>

        {/* Hero Title matching image */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-serif-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.15] max-w-4xl"
        >
          Discover your next{' '}
          <span className="text-[#9582d9] font-serif-title italic block sm:inline">
            unforgettable journey
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl text-center"
        >
          WanderHub crafts personalized itineraries with real-time weather, interactive Google Maps, and Gemini AI-curated experiences tailored to your travel style.
        </motion.p>

        {/* Action Buttons with smooth floating hover */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpenGeminiPlanner()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold text-sm shadow-md shadow-purple-300/40 transition-all"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Plan with Gemini AI</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenMap}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-purple-50/70 text-slate-800 font-semibold text-sm border border-purple-200 shadow-sm transition-all"
          >
            <MapPin className="w-4 h-4 text-[#9582d9]" />
            <span>Interactive Google Map</span>
          </motion.button>
        </div>

        {/* Floating Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-3xl border border-purple-100 p-3 sm:p-4 shadow-xl shadow-purple-500/5 text-left"
        >
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Where to? (e.g., Jaipur, Delhi, Mumbai, Kyoto, Paris...)"
                className="w-full pl-11 pr-4 py-3 bg-[#faf9ff] rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#9582d9]/40 border border-purple-100 transition-all"
              />
            </div>

            {/* Region dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-3 bg-[#faf9ff] rounded-2xl text-slate-700 text-sm border border-purple-100 focus:outline-none focus:ring-2 focus:ring-[#9582d9]/40"
              >
                <option value="All">All Continents</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Americas">Americas</option>
                <option value="Africa">Africa</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-2xl text-sm transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search Hubs</span>
              </motion.button>
            </div>
          </form>

          {/* Smooth floating options / travel style selector */}
          <div className="mt-3 pt-3 border-t border-purple-100/70 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Vibe:</span>
            </span>

            <div className="flex items-center gap-1.5 p-1 bg-purple-50/50 rounded-2xl border border-purple-100/50">
              {travelStyles.map(style => {
                const isSelected = selectedStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      setSelectedStyle(style);
                      onSearch(query, style, selectedRegion);
                    }}
                    className={`relative px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 z-10 ${
                      isSelected ? 'text-white' : 'text-slate-600 hover:text-purple-900'
                    }`}
                  >
                    <span>{style}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="activeFilterPill"
                        className="absolute inset-0 bg-[#8b75d7] rounded-xl shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quiet unboxed metadata stats */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9582d9] animate-pulse" />
            <span className="text-slate-700 font-semibold">Gemini 3.8 Flash AI</span>
          </div>
          <span aria-hidden="true" className="text-purple-200">·</span>
          <span>Google Maps Geospatial Grounding</span>
          <span aria-hidden="true" className="text-purple-200">·</span>
          <span>Instant Ticket Booking & Multi-Currency</span>
          <span aria-hidden="true" className="text-purple-200">·</span>
          <span>100% Persistent Database</span>
        </div>
      </div>
    </div>
  );
};
