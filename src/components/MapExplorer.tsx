import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Destination, CountryMapResponse, CountryMapPlace } from '../types';
import {
  MapPin,
  Sparkles,
  Star,
  Compass,
  Utensils,
  Bed,
  Landmark,
  Trees,
  Search,
  Building2,
  Globe2,
  Loader2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

interface MapExplorerProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onPlanTripForDestination: (dest: Destination) => void;
}

interface CountryQuickPick {
  id: string;
  name: string;
  flag: string;
  badge: string;
  center: { lat: number; lng: number };
  zoom: number;
}

const TOP_GDP_AND_FEATURED_COUNTRIES: CountryQuickPick[] = [
  { id: 'all', name: 'All World Hubs', flag: '🌍', badge: 'Global', center: { lat: 25.0, lng: 20.0 }, zoom: 2.6 },
  { id: 'india', name: 'India', flag: '🇮🇳', badge: '#5 GDP', center: { lat: 22.0, lng: 79.0 }, zoom: 5 },
  { id: 'usa', name: 'United States', flag: '🇺🇸', badge: '#1 GDP', center: { lat: 39.8, lng: -98.5 }, zoom: 4 },
  { id: 'japan', name: 'Japan', flag: '🇯🇵', badge: '#4 GDP', center: { lat: 36.2, lng: 138.2 }, zoom: 5.5 },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', badge: '#3 GDP', center: { lat: 51.1, lng: 10.4 }, zoom: 5.5 },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', badge: '#6 GDP', center: { lat: 54.5, lng: -2.1 }, zoom: 5.5 },
  { id: 'france', name: 'France', flag: '🇫🇷', badge: '#7 GDP', center: { lat: 46.6, lng: 2.2 }, zoom: 5.5 },
  { id: 'italy', name: 'Italy', flag: '🇮🇹', badge: '#8 GDP', center: { lat: 41.8, lng: 12.5 }, zoom: 5.5 },
  { id: 'uae', name: 'United Arab Emirates', flag: '🇦🇪', badge: 'Global Hub', center: { lat: 24.4, lng: 54.3 }, zoom: 7 },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', badge: '#9 GDP', center: { lat: 56.1, lng: -106.3 }, zoom: 4 },
  { id: 'china', name: 'China', flag: '🇨🇳', badge: '#2 GDP', center: { lat: 35.8, lng: 104.1 }, zoom: 4.5 },
];

function MapCameraController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export const MapExplorer: React.FC<MapExplorerProps> = ({
  destinations,
  onSelectDestination,
  onPlanTripForDestination,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBxdJEu3GgQ_MjAcdsbOt_5LwAmq_UVW84';
  const { formatPrice } = useCurrency();

  // Selected country tab
  const [selectedCountryTab, setSelectedCountryTab] = useState<string>('india'); // Default spotlight on India & its cities!
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 22.0, lng: 79.0 });
  const [mapZoom, setMapZoom] = useState<number>(5);

  // AI-fetched real-time country map data
  const [countryMapData, setCountryMapData] = useState<CountryMapResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSearchQuery, setAiSearchQuery] = useState<string>('');

  // Selected Pin for InfoWindow or details
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<CountryMapPlace | null>(null);

  // Filter for spots
  const [filterType, setFilterType] = useState<'all' | 'cities' | 'landmarks' | 'nature' | 'dining' | 'stays'>('all');

  // Load India places by default on initial mount so all Indian cities & places appear immediately!
  useEffect(() => {
    loadCountryPlaces('India', { lat: 22.0, lng: 79.0 }, 5);
  }, []);

  const loadCountryPlaces = async (countryName: string, fallbackCenter?: { lat: number; lng: number }, fallbackZoom?: number) => {
    setAiLoading(true);
    try {
      const data = await api.getCountryMapPlaces(countryName);
      setCountryMapData(data);
      if (data.center) {
        setMapCenter(data.center);
        setMapZoom(data.zoom || 5);
      } else if (fallbackCenter) {
        setMapCenter(fallbackCenter);
        setMapZoom(fallbackZoom || 5);
      }
      setSelectedPlace(data.places[0] || null);
    } catch (err) {
      console.warn('Could not fetch country map data:', err);
      if (fallbackCenter) {
        setMapCenter(fallbackCenter);
        setMapZoom(fallbackZoom || 5);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleCountryTabClick = (pick: CountryQuickPick) => {
    setSelectedCountryTab(pick.id);
    setSelectedDest(null);
    setSelectedPlace(null);

    if (pick.id === 'all') {
      setCountryMapData(null);
      setMapCenter(pick.center);
      setMapZoom(pick.zoom);
    } else {
      loadCountryPlaces(pick.name, pick.center, pick.zoom);
    }
  };

  const handleAiCountrySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) return;

    setSelectedCountryTab('custom');
    setSelectedDest(null);
    setSelectedPlace(null);
    await loadCountryPlaces(aiSearchQuery.trim());
  };

  // Filter curated destinations by active selection
  const filteredCuratedDestinations = destinations.filter(dest => {
    if (selectedCountryTab === 'all') return true;
    if (selectedCountryTab === 'india') return dest.country === 'India';
    if (selectedCountryTab === 'usa') return dest.country === 'United States';
    if (selectedCountryTab === 'japan') return dest.country === 'Japan';
    if (selectedCountryTab === 'germany') return dest.country === 'Germany';
    if (selectedCountryTab === 'uk') return dest.country === 'United Kingdom';
    if (selectedCountryTab === 'france') return dest.country === 'France';
    if (selectedCountryTab === 'italy') return dest.country === 'Italy';
    if (selectedCountryTab === 'uae') return dest.country === 'United Arab Emirates';
    if (selectedCountryTab === 'canada') return dest.country === 'Canada';
    if (countryMapData && countryMapData.country) {
      return dest.country.toLowerCase().includes(countryMapData.country.toLowerCase()) ||
        countryMapData.country.toLowerCase().includes(dest.country.toLowerCase());
    }
    return true;
  });

  // Filter country real-time places
  const displayedPlaces = (countryMapData?.places || []).filter(place => {
    if (filterType === 'all') return true;
    if (filterType === 'cities') return place.type === 'city';
    if (filterType === 'landmarks') return place.type === 'landmark';
    if (filterType === 'nature') return place.type === 'nature';
    if (filterType === 'dining') return place.type === 'dining';
    if (filterType === 'stays') return place.type === 'stay';
    return true;
  });

  const handlePlacePinClick = (place: CountryMapPlace) => {
    setSelectedPlace(place);
    setSelectedDest(null);
    setMapCenter({ lat: place.lat, lng: place.lng });
    setMapZoom(8);
  };

  const handleCuratedPinClick = (dest: Destination) => {
    setSelectedDest(dest);
    setSelectedPlace(null);
    setMapCenter(dest.coordinates);
    setMapZoom(7);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#faf9ff] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar: Hubs, Real-Time Country Explorer & AI Search */}
      <div className="w-full lg:w-[410px] bg-white border-r border-purple-100 flex flex-col h-1/2 lg:h-full z-10 shrink-0 shadow-sm">
        {/* Top Header & Search Area */}
        <div className="p-4 border-b border-purple-100 bg-[#fbfaff]">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8b75d7]" />
              <span>Real-Time Geospatial Explorer</span>
            </h2>
            {countryMapData && (
              <span className="text-xs text-purple-700 font-bold px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200">
                {countryMapData.flag} {countryMapData.country}
              </span>
            )}
          </div>

          {/* AI Country & City Search Form */}
          <form onSubmit={handleAiCountrySearch} className="relative mb-3">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={aiSearchQuery}
              onChange={e => setAiSearchQuery(e.target.value)}
              placeholder="Ask AI for ANY country or city (e.g. India, Switzerland, Sydney)..."
              className="w-full pl-9 pr-20 py-2 bg-[#faf9ff] border border-purple-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40 shadow-inner"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white rounded-lg text-[11px] font-bold shadow-sm hover:from-[#7c66d1] hover:to-[#6a54bd] transition-all flex items-center gap-1"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>Map It</span>
            </button>
          </form>

          {/* Country Quick Selector (Spotlight on India + Top GDP Nations) */}
          <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Featured & Top GDP Economies:</span>
            {aiLoading && <span className="text-[#8b75d7] animate-pulse">Loading geospatial pins...</span>}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {TOP_GDP_AND_FEATURED_COUNTRIES.map(c => {
              const isSelected = selectedCountryTab === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCountryTabClick(c)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white shadow-md shadow-purple-500/20'
                      : 'bg-purple-50 text-slate-700 hover:bg-purple-100/80 border border-purple-100'
                  }`}
                >
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.name}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-200/60 text-purple-800'}`}>
                    {c.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* POI Category Filters */}
          <div className="mt-2.5 pt-2 border-t border-purple-100/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0">Filter Pins:</span>
            {(
              [
                { id: 'all', label: 'All Pins', icon: <Globe2 className="w-3 h-3 text-[#8b75d7]" /> },
                { id: 'cities', label: 'Cities', icon: <Building2 className="w-3 h-3 text-[#8b75d7]" /> },
                { id: 'landmarks', label: 'Landmarks', icon: <Landmark className="w-3 h-3 text-purple-600" /> },
                { id: 'nature', label: 'Nature', icon: <Trees className="w-3 h-3 text-emerald-600" /> },
                { id: 'dining', label: 'Dining', icon: <Utensils className="w-3 h-3 text-amber-500" /> },
              ] as const
            ).map(f => {
              const active = filterType === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                    active ? 'bg-purple-200 text-purple-900 font-bold' : 'text-slate-600 hover:bg-purple-50'
                  }`}
                >
                  {f.icon}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Country Overview Banner if Country Selected */}
        {countryMapData && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-purple-50/90 to-indigo-50/90 border-b border-purple-100 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{countryMapData.flag}</span>
                <span>{countryMapData.country}</span>
                {countryMapData.gdpRank && (
                  <span className="text-[10px] text-[#8b75d7] font-semibold bg-white px-1.5 py-0.5 rounded border border-purple-200">
                    {countryMapData.gdpRank}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                {countryMapData.overview}
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-700 shrink-0 bg-white px-2 py-1 rounded-lg border border-purple-200">
              {displayedPlaces.length} Live Pins
            </span>
          </div>
        )}

        {/* Scrollable Places & Destinations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {/* Display Country Map Places if Available */}
          {countryMapData && displayedPlaces.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block px-1">
                Verified Places & Cities in {countryMapData.country}
              </span>
              {displayedPlaces.map(place => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <motion.div
                    whileHover={{ y: -1 }}
                    key={place.id}
                    onClick={() => handlePlacePinClick(place)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50 border-[#8b75d7] shadow-sm ring-1 ring-[#8b75d7]/30'
                        : 'bg-white border-purple-100 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <img
                        src={place.heroImage}
                        alt={place.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm"
                        onError={(e) => {
                          // Fallback image if unsplash url fails
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format&fit=crop';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{place.name}</h4>
                          <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{place.rating}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {place.city} · {place.type.toUpperCase()}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          {place.avgDailyCost ? (
                            <span className="font-semibold text-purple-700">
                              {formatPrice(place.avgDailyCost)}/day
                            </span>
                          ) : (
                            <span className="text-purple-600 font-semibold">{place.tag || 'Must Visit'}</span>
                          )}
                          <span className="text-[#8b75d7] font-semibold hover:underline">
                            Pin map →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Curated Hubs */}
          {filteredCuratedDestinations.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block px-1">
                Curated Hubs ({filteredCuratedDestinations.length})
              </span>
              {filteredCuratedDestinations.map(dest => {
                const isSelected = selectedDest?.id === dest.id;
                return (
                  <motion.div
                    whileHover={{ y: -1 }}
                    key={dest.id}
                    onClick={() => handleCuratedPinClick(dest)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/80 border-[#8b75d7] shadow-sm ring-1 ring-[#8b75d7]/30'
                        : 'bg-white border-purple-100 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <img
                        src={dest.heroImage}
                        alt={dest.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {dest.country === 'India' ? '🇮🇳 ' : ''}{dest.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{dest.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{dest.country} · {dest.region}</p>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-purple-700">{formatPrice(dest.avgDailyCost)}/day</span>
                          <span className="text-[#8b75d7] font-semibold hover:underline">Zoom pin →</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Google Maps Canvas View */}
      <div className="flex-1 relative h-1/2 lg:h-full bg-slate-100">
        <APIProvider apiKey={apiKey}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            center={mapCenter}
            zoom={mapZoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            <MapCameraController center={mapCenter} zoom={mapZoom} />

            {/* Real-time Country Map Pins (Generated or loaded for India, Japan, USA, Germany, etc. or asked from AI) */}
            {displayedPlaces.map(place => (
              <AdvancedMarker
                key={`place-marker-${place.id}`}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => handlePlacePinClick(place)}
                title={place.name}
              >
                <div className="group cursor-pointer transform hover:scale-115 transition-transform flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#8b75d7] shadow-xl flex items-center justify-center text-purple-600 overflow-hidden ring-2 ring-white">
                      <img
                        src={place.heroImage}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-1 w-2.5 h-2.5 bg-[#8b75d7] rotate-45" />
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-slate-900 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-md text-center whitespace-nowrap border border-purple-200 flex items-center gap-1">
                    {place.type === 'city' && <Building2 className="w-3 h-3 text-[#8b75d7]" />}
                    {place.type === 'landmark' && <Landmark className="w-3 h-3 text-purple-600" />}
                    {place.type === 'nature' && <Trees className="w-3 h-3 text-emerald-600" />}
                    {place.type === 'dining' && <Utensils className="w-3 h-3 text-amber-500" />}
                    <span>{place.name.split('&')[0].trim()}</span>
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Curated Destination Markers (Global / Country) */}
            {filteredCuratedDestinations.map(dest => (
              <AdvancedMarker
                key={`dest-pin-${dest.id}`}
                position={dest.coordinates}
                onClick={() => handleCuratedPinClick(dest)}
                title={dest.name}
              >
                <div className="group cursor-pointer transform hover:scale-115 transition-transform flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white border-2 border-indigo-600 shadow-xl flex items-center justify-center overflow-hidden ring-2 ring-white">
                      <img
                        src={dest.heroImage}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                      />
                    </div>
                    <div className="absolute -bottom-1 w-2.5 h-2.5 bg-indigo-600 rotate-45" />
                  </div>
                  <div className="mt-1 text-[11px] font-extrabold text-slate-900 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-md text-center whitespace-nowrap border border-indigo-200">
                    {dest.country === 'India' ? '🇮🇳 ' : ''}{dest.name}
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* InfoWindow for Selected Place */}
            {selectedPlace && (
              <InfoWindow
                position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div className="p-1 max-w-[280px] text-slate-900 font-sans">
                  <img
                    src={selectedPlace.heroImage}
                    alt={selectedPlace.name}
                    className="w-full h-28 object-cover rounded-xl mb-2 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format&fit=crop';
                    }}
                  />
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {selectedPlace.name}
                    </h4>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {selectedPlace.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700 font-semibold mb-1">
                    {selectedPlace.city}, {selectedPlace.country} · {selectedPlace.tag || selectedPlace.type}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {selectedPlace.description}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
                    {selectedPlace.avgDailyCost && (
                      <span className="font-bold text-[#8b75d7]">
                        {formatPrice(selectedPlace.avgDailyCost)}/day
                      </span>
                    )}
                    <button
                      onClick={() => onPlanTripForDestination({
                        id: selectedPlace.id,
                        name: selectedPlace.city || selectedPlace.name,
                        country: selectedPlace.country,
                        region: 'Asia',
                        coordinates: { lat: selectedPlace.lat, lng: selectedPlace.lng },
                        heroImage: selectedPlace.heroImage,
                        gallery: [selectedPlace.heroImage],
                        tagline: selectedPlace.description,
                        description: selectedPlace.description,
                        bestMonths: 'October - March',
                        avgDailyCost: selectedPlace.avgDailyCost || 50,
                        currency: 'USD',
                        styles: ['Culture', 'City'],
                        highlights: [selectedPlace.name],
                        popularSpots: [],
                        rating: selectedPlace.rating,
                        reviewCount: 150
                      })}
                      className="ml-auto px-2.5 py-1 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white rounded-lg text-[11px] font-bold shadow-sm"
                    >
                      Plan Trip with AI →
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Selected Curated Destination */}
            {selectedDest && (
              <InfoWindow
                position={selectedDest.coordinates}
                onCloseClick={() => setSelectedDest(null)}
              >
                <div className="p-1 max-w-[280px] text-slate-900 font-sans">
                  <img
                    src={selectedDest.heroImage}
                    alt={selectedDest.name}
                    className="w-full h-28 object-cover rounded-xl mb-2 shadow-sm"
                  />
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-sm text-slate-900">
                      {selectedDest.country === 'India' ? '🇮🇳 ' : ''}{selectedDest.name}, {selectedDest.country}
                    </h4>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {selectedDest.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {selectedDest.tagline}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span className="font-semibold text-purple-700">{formatPrice(selectedDest.avgDailyCost)}/day</span>
                    <button
                      onClick={() => onSelectDestination(selectedDest)}
                      className="text-[#8b75d7] font-bold hover:underline"
                    >
                      Full Details →
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Selected Hub Floating Drawer on Desktop */}
        {selectedDest && (
          <div className="hidden lg:block absolute bottom-6 left-6 right-6 max-w-xl bg-white/95 backdrop-blur-md rounded-3xl border border-purple-100 p-4 shadow-xl shadow-purple-500/10 z-20 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start gap-4">
              <img
                src={selectedDest.heroImage}
                alt={selectedDest.name}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-slate-900">
                      {selectedDest.country === 'India' ? '🇮🇳 ' : ''}{selectedDest.name}, {selectedDest.country}
                    </h3>
                    <p className="text-xs text-[#8b75d7] font-semibold">
                      {selectedDest.tagline}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-xl text-purple-800 font-bold text-xs border border-purple-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{selectedDest.rating}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onPlanTripForDestination(selectedDest)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Plan Itinerary with Gemini</span>
                  </button>

                  <button
                    onClick={() => onSelectDestination(selectedDest)}
                    className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-xs rounded-xl border border-purple-200 transition-colors"
                  >
                    Explore Hub Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
