import React from 'react';
import { Compass, Sparkles, MapPin, Heart } from 'lucide-react';
import { MainTabType } from './Navbar';

interface FooterProps {
  setActiveTab: (tab: MainTabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-white text-slate-600 border-t border-purple-100 pt-12 pb-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-purple-100">
          {/* Col 1: Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100/70 border border-purple-200/80 flex items-center justify-center text-purple-600">
                <Compass className="w-5 h-5 text-[#8b75d7]" />
              </div>
              <span className="font-serif-title text-xl font-bold tracking-tight text-slate-900">
                Wander<span className="text-[#8b75d7] font-sans font-extrabold">Hub</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500 max-w-sm leading-relaxed">
              An intelligent travel planning platform bridging Google Maps Platform geospatial exploration with personalized multi-day itineraries crafted by Google Gemini 3.8 Flash.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Explore WanderHub
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => setActiveTab('explore')} className="hover:text-[#8b75d7] transition-colors font-medium">
                  Curated Destinations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('map')} className="hover:text-[#8b75d7] transition-colors font-medium">
                  Interactive Google Maps
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('planner')} className="hover:text-[#8b75d7] transition-colors font-medium">
                  Gemini AI Itinerary Architect
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tickets')} className="hover:text-[#8b75d7] transition-colors font-medium">
                  Book Tickets & Passes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech Engine */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Technology
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8b75d7]" />
                <span className="text-slate-800 font-medium">Google Gemini 3.8 Flash</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8b75d7]" />
                <span className="text-slate-800 font-medium">Google Maps Platform</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                React 19 · Express Backend · Vite 8 · Tailwind CSS v4
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} WanderHub. Crafted for intentional travel.
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Designed with</span>
            <Heart className="w-3 h-3 text-[#8b75d7] fill-[#8b75d7]" />
            <span>for wanderers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
