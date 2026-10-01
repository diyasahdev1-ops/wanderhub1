import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Navbar, MainTabType } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DestinationCard } from './components/DestinationCard';
import { DestinationModal } from './components/DestinationModal';
import { MapExplorer } from './components/MapExplorer';
import { GeminiPlanner } from './components/GeminiPlanner';
import { BookingsManager } from './components/BookingsManager';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { Destination, Trip } from './types';
import { api } from './services/api';
import { Compass, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function WanderHubApp() {
  const [activeTab, setActiveTab] = useState<MainTabType>('explore');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Sub-states
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [plannerPrefill, setPlannerPrefill] = useState<string>('Kyoto');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStyle, setSearchStyle] = useState('All');
  const [searchRegion, setSearchRegion] = useState('All');

  // Load initial data from persistent backend
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [dests, userTrips] = await Promise.all([
          api.getDestinations(),
          api.getTrips(),
        ]);
        setDestinations(dests);
        setTrips(userTrips);
      } catch (err) {
        console.error('Error fetching WanderHub data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleSearch = (query: string, style: string, region: string) => {
    setSearchQuery(query);
    setSearchStyle(style);
    setSearchRegion(region);
    setActiveTab('explore');
  };

  const handlePlanTripForDestination = (dest: Destination) => {
    setPlannerPrefill(dest.name);
    setActiveTab('planner');
  };

  const handleShowOnMap = (dest: Destination) => {
    setActiveTab('map');
  };

  const handleTripSaved = (savedTrip: Trip) => {
    setTrips(prev => [savedTrip, ...prev.filter(t => t.id !== savedTrip.id)]);
    setActiveTab('tickets');
  };

  const handleTripUpdated = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  const handleTripDeleted = (tripId: string) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
  };

  // Filtered Destinations
  const filteredDestinations = destinations.filter(dest => {
    const matchesQuery = searchQuery === '' ||
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = searchRegion === 'All' || dest.region === searchRegion;

    const matchesStyle = searchStyle === 'All' || dest.styles.includes(searchStyle);

    return matchesQuery && matchesRegion && matchesStyle;
  });

  return (
    <div className="min-h-screen bg-[#faf9ff] text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBookTicketClick={() => {
          setActiveTab('tickets');
        }}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* TAB 1: EXPLORE DESTINATIONS */}
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <HeroSection
                onSearch={handleSearch}
                onOpenGeminiPlanner={(dest) => {
                  if (dest) setPlannerPrefill(dest);
                  setActiveTab('planner');
                }}
                onOpenMap={() => setActiveTab('map')}
              />

              {/* Curated Grid Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs font-bold text-[#8b75d7] uppercase tracking-wider block">
                      Curated Destinations
                    </span>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                      Hand-Selected Hubs for Intentional Travelers
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Each hub is mapped with local POIs, verified daily cost estimates, and cultural notes.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveTab('map')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-purple-200 hover:border-[#8b75d7] transition-all shadow-sm"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#8b75d7]" />
                      <span>View Map Pins</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setPlannerPrefill('Kyoto');
                        setActiveTab('planner');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>AI Itinerary</span>
                    </motion.button>
                  </div>
                </div>

                {/* Destination Cards Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div key={idx} className="h-72 rounded-3xl bg-purple-100/50 animate-pulse" />
                    ))}
                  </div>
                ) : filteredDestinations.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 max-w-md mx-auto shadow-sm">
                    <Compass className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-slate-800">No destinations found</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Try adjusting your search criteria or resetting filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchStyle('All');
                        setSearchRegion('All');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredDestinations.map(dest => (
                      <DestinationCard
                        key={dest.id}
                        destination={dest}
                        onSelect={d => setSelectedDestination(d)}
                        onPlanTrip={handlePlanTripForDestination}
                        onShowOnMap={handleShowOnMap}
                      />
                    ))}
                  </div>
                )}

                {/* Dream Planner Banner Callout */}
                <div className="mt-16 bg-gradient-to-r from-[#8b75d7] via-[#816bd4] to-[#735dc9] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-purple-500/10">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Personalized Travel Architecture</span>
                    </div>
                    <h3 className="font-serif-title text-2xl sm:text-3xl font-bold">
                      Let Gemini design your dream multi-day getaway in seconds.
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
                      Tailored to your budget tier, travel style, and companions with morning, afternoon, and evening breakdowns and real insider dining spots.
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setPlannerPrefill('Amalfi Coast');
                        setActiveTab('planner');
                      }}
                      className="px-6 py-3 bg-white text-purple-900 hover:bg-purple-50 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md text-center"
                    >
                      Launch AI Architect
                    </motion.button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 2: GOOGLE MAPS EXPLORER */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <MapExplorer
                destinations={destinations}
                onSelectDestination={d => setSelectedDestination(d)}
                onPlanTripForDestination={handlePlanTripForDestination}
              />
            </motion.div>
          )}

          {/* TAB 3: GEMINI AI PLANNER */}
          {activeTab === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <GeminiPlanner
                initialDestination={plannerPrefill}
                destinations={destinations}
                onTripSaved={handleTripSaved}
              />
            </motion.div>
          )}

          {/* TAB 4: BOOK TICKETS (REPLACING DREAM LOGGER & TRIPS) */}
          {activeTab === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <BookingsManager />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Destination Full Details Modal */}
      <DestinationModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onPlanTrip={handlePlanTripForDestination}
        onShowOnMap={handleShowOnMap}
      />

      {/* Auth Modal (Login & Sign Up) */}
      <AuthModal />

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <WanderHubApp />
      </CurrencyProvider>
    </AuthProvider>
  );
}
