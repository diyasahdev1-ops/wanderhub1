import React from 'react';
import { Destination } from '../types';
import { X, Star, MapPin, Sparkles, Bookmark, Utensils, Bed, Landmark, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  onPlanTrip: (destination: Destination) => void;
  onShowOnMap: (destination: Destination) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onPlanTrip,
  onShowOnMap,
}) => {
  const { user, toggleBucketList } = useAuth();
  const { formatPrice } = useCurrency();

  if (!destination) return null;

  const isBookmarked = user?.bucketList?.includes(destination.id) || false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 max-h-[92vh] flex flex-col"
        >
          {/* Sticky Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-slate-700 flex items-center justify-center hover:bg-white transition-colors shadow-md border border-purple-100"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Hero Banner Header */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 shrink-0">
            <img
              src={destination.heroImage}
              alt={destination.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Bottom Title Bar */}
            <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
                  <span>{destination.region}</span>
                  <span aria-hidden="true">·</span>
                  <span>{destination.country}</span>
                </div>
                <h2 className="font-serif-title text-3xl sm:text-4xl font-bold tracking-tight">
                  {destination.name}
                </h2>
                <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
                  {destination.tagline}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleBucketList(destination.id)}
                  className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${
                    isBookmarked
                      ? 'bg-[#8b75d7] text-white shadow-md'
                      : 'bg-white/80 text-slate-800 hover:bg-white'
                  }`}
                  title="Save to dream bucket list"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-white' : ''}`} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    onClose();
                    onPlanTrip(destination);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Create AI Itinerary</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Key Facts Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#faf9ff] border border-purple-100">
              <div>
                <span className="text-[11px] text-purple-600 block uppercase font-bold tracking-wider">Rating</span>
                <div className="flex items-center gap-1 text-sm font-bold text-slate-900 mt-0.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{destination.rating}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-purple-600 block uppercase font-bold tracking-wider">Daily Budget</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  ~{formatPrice(destination.avgDailyCost)} / day
                </span>
              </div>

              <div>
                <span className="text-[11px] text-purple-600 block uppercase font-bold tracking-wider">Best Season</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5 truncate" title={destination.bestMonths}>
                  {destination.bestMonths}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-purple-600 block uppercase font-bold tracking-wider">Travel Styles</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5 truncate">
                  {destination.styles.join(', ')}
                </span>
              </div>
            </div>

            {/* Destination Description */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-serif-title">
                About {destination.name}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* Highlights & Top Experiences */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 font-serif-title">
                Curated Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.highlights.map((h, i) => (
                  <motion.div
                    whileHover={{ y: -2 }}
                    key={i}
                    className="p-3.5 bg-[#faf9ff] rounded-2xl border border-purple-100 text-xs text-slate-800 flex items-start gap-2.5 transition-all shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {i + 1}
                    </span>
                    <span className="mt-0.5 font-medium">{h}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Popular Points of Interest (Mapped) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 font-serif-title">
                  Notable Locations & POIs
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    onShowOnMap(destination);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#8b75d7] hover:text-purple-800 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open in Google Maps Explorer →</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.popularSpots.map((spot, idx) => (
                  <motion.div
                    whileHover={{ y: -2 }}
                    key={idx}
                    className="p-3.5 rounded-2xl border border-purple-100 bg-white hover:border-[#8b75d7] transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {spot.type === 'landmark' && <Landmark className="w-3.5 h-3.5 text-purple-600" />}
                        {spot.type === 'nature' && <Trees className="w-3.5 h-3.5 text-emerald-600" />}
                        {spot.type === 'dining' && <Utensils className="w-3.5 h-3.5 text-[#8b75d7]" />}
                        {spot.type === 'stay' && <Bed className="w-3.5 h-3.5 text-indigo-600" />}
                        <span>{spot.name}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                        {spot.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {spot.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
