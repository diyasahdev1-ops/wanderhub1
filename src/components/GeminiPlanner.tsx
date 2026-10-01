import React, { useState } from 'react';
import { Sparkles, Calendar, Compass, BookmarkPlus, MessageSquare, Send, Bot, User as UserIcon, ListChecks, Printer, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratedItinerary, Destination, Trip } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

interface GeminiPlannerProps {
  initialDestination?: string;
  destinations: Destination[];
  onTripSaved: (trip: Trip) => void;
}

export const GeminiPlanner: React.FC<GeminiPlannerProps> = ({
  initialDestination = '',
  destinations,
  onTripSaved,
}) => {
  const { user, openAuthModal } = useAuth();
  const { formatPrice, currentCurrencyInfo } = useCurrency();

  // Mode: 'architect' | 'scout' | 'packing'
  const [plannerTab, setPlannerTab] = useState<'architect' | 'scout' | 'packing'>('architect');

  // Architect Form State
  const [destination, setDestination] = useState(initialDestination || 'Jaipur, India');
  const [durationDays, setDurationDays] = useState(4);
  const [travelStyle, setTravelStyle] = useState('Culture');
  const [budgetTier, setBudgetTier] = useState('Moderate');
  const [companions, setCompanions] = useState('Solo');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Historic Temples', 'Authentic Local Food']);

  // Generation status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Scout Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your WanderHub AI Scout powered by Google Gemini. Ask me anything about secret viewpoints, local dining etiquette, transport passes, or dream itineraries!`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Packing Generator State
  const [packingDest, setPackingDest] = useState('Kyoto');
  const [packingDays, setPackingDays] = useState(5);
  const [packingItems, setPackingItems] = useState<{ id: string; item: string; packed: boolean; category: string }[]>([]);
  const [packingLoading, setPackingLoading] = useState(false);

  const interestOptions = [
    'Historic Temples',
    'Authentic Local Food',
    'Scenic Hikes',
    'Art & Architecture',
    'Nightlife & Speakeasies',
    'Coffee Roasters',
    'Relaxation & Spas',
    'Local Markets',
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerateItinerary = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setError('Please provide a destination');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveStatus(null);

    try {
      const match = destinations.find(d => d.name.toLowerCase() === destination.toLowerCase());
      const res = await api.generateItinerary({
        destination,
        country: match ? match.country : '',
        durationDays,
        style: travelStyle,
        budgetTier,
        companions,
        interests: selectedInterests,
      });
      setItinerary(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToMyTrips = async () => {
    if (!itinerary) return;
    if (!user) {
      openAuthModal('login');
      return;
    }

    setSaveStatus('Saving to your WanderHub database...');
    try {
      const matchedDest = destinations.find(d => d.name.toLowerCase().includes(itinerary.destination.toLowerCase()));
      const newTripData: Partial<Trip> = {
        title: itinerary.title,
        destination: itinerary.destination,
        country: itinerary.country || (matchedDest ? matchedDest.country : 'Worldwide'),
        coordinates: matchedDest ? matchedDest.coordinates : { lat: 35.0116, lng: 135.7681 },
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * itinerary.durationDays).toISOString().split('T')[0],
        coverImage: matchedDest ? matchedDest.heroImage : 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
        notes: `Created via WanderHub Google Gemini AI. Style: ${itinerary.style}, Budget: ${itinerary.budgetTier}.`,
        budgetTotal: itinerary.estimatedTotalBudget || 1200,
        currency: itinerary.currency || 'USD',
        expenses: [],
        packingList: itinerary.packingEssentials.map((p, idx) => ({
          id: `pack-${idx}`,
          item: p.item,
          packed: false,
          category: p.category,
        })),
        days: itinerary.days,
        isPublic: true,
      };

      const saved = await api.createTrip(newTripData);
      setSaveStatus('Trip saved successfully to your WanderHub database!');
      onTripSaved(saved);
    } catch (err: unknown) {
      setSaveStatus(err instanceof Error ? err.message : 'Failed to save trip');
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user' as const, content: chatInput.trim() };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const reply = await api.chatWithScout(newHistory, destination);
      setChatMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setChatMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'Unable to connect to Gemini at this moment. Please check your network or API keys in AI Studio Secrets.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGeneratePacking = async () => {
    setPackingLoading(true);
    try {
      const items = await api.generatePacking(packingDest, packingDays, travelStyle);
      setPackingItems(items);
    } catch (e) {
      console.error(e);
    } finally {
      setPackingLoading(false);
    }
  };

  const togglePackingItem = (id: string) => {
    setPackingItems(prev =>
      prev.map(item => (item.id === id ? { ...item, packed: !item.packed } : item))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8b75d7] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#8b75d7]" />
          <span>Google Gemini 3.8 Flash Travel Suite</span>
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
          Smart Travel Architect & Concierge
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Harness multimodal intelligence to formulate bespoke multi-day itineraries, chat with our local insider concierge, or build smart packing checklists.
        </p>

        {/* Tab selection with smooth floating pill */}
        <div className="mt-6 flex items-center gap-2 p-1.5 bg-[#f4f2fb] rounded-2xl w-fit border border-purple-100">
          {(
            [
              { id: 'architect', label: 'Itinerary Architect', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'scout', label: 'AI Scout (Live Concierge)', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'packing', label: 'Smart Packing List', icon: <ListChecks className="w-3.5 h-3.5" /> },
            ] as const
          ).map(tab => {
            const isActive = plannerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPlannerTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors z-10 ${
                  isActive ? 'text-purple-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-[#8b75d7]' : 'text-slate-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="plannerSubTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-purple-100 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ITINERARY ARCHITECT */}
      {plannerTab === 'architect' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Parameters */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-purple-100 p-6 shadow-sm shadow-purple-500/5">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8b75d7]" />
              <span>Trip Parameters</span>
            </h2>

            <form onSubmit={handleGenerateItinerary} className="space-y-4">
              {/* Destination Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination or City
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Kyoto, Amalfi, Reykjavik..."
                  className="w-full px-3.5 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40"
                  required
                />
                {/* Quick suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['Jaipur, India', 'New Delhi, India', 'Goa, India', 'Tokyo, Japan', 'Paris, France', 'New York, USA', 'Berlin, Germany', 'London, UK'].map(place => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={place}
                      type="button"
                      onClick={() => setDestination(place)}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors font-medium border border-purple-100/60"
                    >
                      {place}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Trip Duration</span>
                  <span className="text-purple-700 font-bold">{durationDays} Days</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={durationDays}
                  onChange={e => setDurationDays(Number(e.target.value))}
                  className="w-full accent-[#8b75d7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 day</span>
                  <span>5 days</span>
                  <span>10 days</span>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Travel Vibe
                </label>
                <select
                  value={travelStyle}
                  onChange={e => setTravelStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40"
                >
                  <option value="Culture">Culture & Heritage</option>
                  <option value="Foodie">Gastronomy & Street Food</option>
                  <option value="Adventure">Adventure & Hiking</option>
                  <option value="Romantic">Romantic & Scenic</option>
                  <option value="Relaxation">Wellness & Relaxation</option>
                  <option value="Luxury">Luxury & Comfort</option>
                  <option value="Budget">Smart Backpacker</option>
                </select>
              </div>

              {/* Budget Tier with smooth floating active indicator */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Budget Level
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-purple-50/60 rounded-2xl border border-purple-100">
                  {['Backpacker', 'Moderate', 'Luxury'].map(tier => {
                    const isSelected = budgetTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setBudgetTier(tier)}
                        className={`relative py-2 px-2 rounded-xl text-xs font-semibold text-center transition-colors z-10 ${
                          isSelected ? 'text-white' : 'text-slate-600 hover:text-purple-900'
                        }`}
                      >
                        <span>{tier}</span>
                        {isSelected && (
                          <motion.div
                            layoutId="activeBudgetPill"
                            className="absolute inset-0 bg-[#8b75d7] rounded-xl shadow-sm -z-10"
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Companions with smooth floating active indicator */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Traveling With
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-purple-50/60 rounded-2xl border border-purple-100">
                  {['Solo', 'Couple', 'Friends', 'Family'].map(c => {
                    const isSelected = companions === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCompanions(c)}
                        className={`relative py-1.5 text-xs rounded-xl text-center font-medium transition-colors z-10 ${
                          isSelected ? 'text-white font-bold' : 'text-slate-600 hover:text-purple-900'
                        }`}
                      >
                        <span>{c}</span>
                        {isSelected && (
                          <motion.div
                            layoutId="activeCompanionPill"
                            className="absolute inset-0 bg-[#8b75d7] rounded-xl shadow-sm -z-10"
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interests Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Special Interests (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {interestOptions.map(interest => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs px-2.5 py-1 rounded-xl transition-all ${
                          active
                            ? 'bg-[#8b75d7] text-white font-semibold shadow-sm'
                            : 'bg-purple-50/70 text-slate-600 hover:bg-purple-100'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-purple-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini is Crafting Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Itinerary</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Right Area: Generated Itinerary Display */}
          <div className="lg:col-span-8">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Generation Notice</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {itinerary ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm shadow-purple-500/5 space-y-6"
              >
                {/* Header info */}
                <div className="border-b border-purple-100 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-purple-600 font-bold">
                        {itinerary.durationDays}-Day {itinerary.style} Journey
                      </span>
                      <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                        {itinerary.title}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">{itinerary.tagline}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleSaveToMyTrips}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        <span>Save Itinerary</span>
                      </motion.button>

                      <button
                        onClick={() => window.print()}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                        title="Print / Save PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {saveStatus && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{saveStatus}</span>
                    </div>
                  )}

                  {/* Summary Bar */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-3 border-t border-purple-50">
                    <div>
                      <span className="text-slate-400">Destination:</span>{' '}
                      <span className="font-semibold text-slate-800">{itinerary.destination}</span>
                    </div>
                    <span>·</span>
                    <div>
                      <span className="text-slate-400">Budget Tier:</span>{' '}
                      <span className="font-semibold text-slate-800">{itinerary.budgetTier}</span>
                    </div>
                    <span>·</span>
                    <div>
                      <span className="text-slate-400">Est. Total:</span>{' '}
                      <span className="font-bold text-purple-700">
                        {formatPrice(itinerary.estimatedTotalBudget)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Highlights & Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8b75d7]" />
                      <span>Key Highlights</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {itinerary.highlights?.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#8b75d7] font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100">
                    <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Local Insider Tips</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {itinerary.localInsiderTips?.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Day-by-Day Activities */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#8b75d7]" />
                    <span>Daily Schedule</span>
                  </h3>

                  <div className="space-y-4">
                    {itinerary.days?.map(day => (
                      <motion.div
                        whileHover={{ y: -2 }}
                        key={day.dayNumber}
                        className="border border-purple-100 rounded-2xl p-5 bg-[#faf9ff] hover:bg-purple-50/40 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center justify-between border-b border-purple-100/80 pb-2.5 mb-3">
                          <div>
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                              Day {day.dayNumber}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{day.title}</h4>
                          </div>
                          <span className="text-xs text-slate-500 italic">{day.theme}</span>
                        </div>

                        {/* Activities timeline */}
                        <div className="space-y-3">
                          {day.activities?.map((act, aIdx) => (
                            <div key={aIdx} className="flex items-start gap-3 text-xs">
                              <span className="px-2.5 py-0.5 rounded-lg bg-white border border-purple-100 text-purple-800 font-mono text-[11px] shrink-0 mt-0.5 shadow-2xs">
                                {act.time}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{act.title}</span>
                                  {act.cost > 0 && (
                                    <span className="text-purple-700 font-semibold">{formatPrice(act.cost)}</span>
                                  )}
                                </div>
                                <p className="text-slate-600 mt-0.5 leading-relaxed">
                                  {act.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <MapPin className="w-3 h-3 text-[#8b75d7]" />
                                    <span>{act.location}</span>
                                  </span>
                                  <span>·</span>
                                  <span className="capitalize">{act.category}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Packing preview */}
                {itinerary.packingEssentials && (
                  <div className="pt-2 border-t border-purple-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-[#8b75d7]" />
                      <span>Recommended Packing Checklist</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {itinerary.packingEssentials.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-slate-700 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b75d7]" />
                          <span>{item.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Empty state before generation */
              <div className="h-full min-h-[420px] bg-white rounded-3xl border border-purple-100 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-purple-100/70 border border-purple-200 flex items-center justify-center text-[#8b75d7] mb-4 shadow-sm">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to architect your dream journey
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
                  Select your destination, length, and travel style on the left. Gemini will synthesize a realistic, day-by-day travel plan complete with costs, spots, and cultural advice.
                </p>
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleGenerateItinerary()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Itinerary for {destination}</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI TRAVEL SCOUT (LIVE CONCIERGE CHAT) */}
      {plannerTab === 'scout' && (
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-purple-100 bg-[#fbfaff] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-[#8b75d7]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Gemini Travel Concierge</h2>
                <p className="text-xs text-slate-500">Ask anything about {destination || 'any city'} · Live reasoning</p>
              </div>
            </div>

            {/* Quick prompt suggestions */}
            <div className="hidden sm:flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setChatInput(`What are the top 3 authentic local street dishes in ${destination || 'Kyoto'}?`)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors"
              >
                Top 3 street dishes?
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setChatInput(`How do I navigate public transit and trains easily in ${destination || 'Kyoto'}?`)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors"
              >
                Public transit hacks?
              </motion.button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex gap-3 max-w-2xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-[#8b75d7] text-white'
                      : 'bg-purple-100 text-[#8b75d7]'
                  }`}
                >
                  {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white rounded-tr-none shadow-sm'
                      : 'bg-[#faf9ff] text-slate-800 rounded-tl-none border border-purple-100'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#8b75d7] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#faf9ff] text-slate-600 rounded-tl-none border border-purple-100 text-xs flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#8b75d7] border-t-transparent rounded-full animate-spin" />
                  <span>Gemini is composing recommendations...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-purple-100 bg-white flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder={`Ask Gemini anything about ${destination || 'your destination'} (e.g. secret spots, budget, customs)...`}
              className="flex-1 px-4 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </motion.button>
          </form>
        </div>
      )}

      {/* TAB 3: SMART PACKING CHECKLIST */}
      {plannerTab === 'packing' && (
        <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              AI Smart Packing Generator
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Get an intelligent checklist based on your destination's climate, duration, and planned activities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                value={packingDest}
                onChange={e => setPackingDest(e.target.value)}
                placeholder="Destination"
                className="px-3.5 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
              />
              <input
                type="number"
                min={1}
                max={30}
                value={packingDays}
                onChange={e => setPackingDays(Number(e.target.value))}
                placeholder="Days"
                className="px-3.5 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
              />
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleGeneratePacking}
                disabled={packingLoading}
                className="py-2.5 px-4 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                {packingLoading ? 'Generating...' : 'Build Checklist'}
              </motion.button>
            </div>
          </div>

          {packingItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-800">
                  {packingItems.filter(i => i.packed).length} of {packingItems.length} packed
                </span>
                <button
                  onClick={() => setPackingItems(packingItems.map(i => ({ ...i, packed: true })))}
                  className="text-xs text-[#8b75d7] hover:underline font-bold"
                >
                  Mark All Packed
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {packingItems.map(item => (
                  <motion.div
                    whileHover={{ y: -2 }}
                    key={item.id}
                    onClick={() => togglePackingItem(item.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer flex items-center gap-2.5 transition-all ${
                      item.packed
                        ? 'bg-purple-50/50 border-purple-200 text-slate-400 line-through'
                        : 'bg-[#faf9ff] border-purple-100 text-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => {}}
                      className="accent-[#8b75d7] rounded"
                    />
                    <span className="flex-1 truncate">{item.item}</span>
                    <span className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">{item.category}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
