import React, { useState, useEffect } from 'react';
import { Destination } from '../types';
import { Star, Bookmark, Sparkles, MapPin, Sun, Cloud, CloudRain, Snowflake, CloudLightning } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { fetchLiveWeather, WeatherData } from '../services/weather';
import { motion } from 'motion/react';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (destination: Destination) => void;
  onPlanTrip: (destination: Destination) => void;
  onShowOnMap: (destination: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSelect,
  onPlanTrip,
  onShowOnMap,
}) => {
  const { user, toggleBucketList } = useAuth();
  const { formatPrice } = useCurrency();
  const isBookmarked = user?.bucketList?.includes(destination.id) || false;

  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather(destination.coordinates.lat, destination.coordinates.lng)
      .then(w => {
        if (isMounted) setWeather(w);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [destination.coordinates.lat, destination.coordinates.lng]);

  const renderWeatherIcon = (icon?: WeatherData['icon']) => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />;
      case 'cloud':
        return <Cloud className="w-3.5 h-3.5 text-slate-400" />;
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5 text-sky-500" />;
      case 'snow':
        return <Snowflake className="w-3.5 h-3.5 text-indigo-400" />;
      case 'storm':
        return <CloudLightning className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300 flex flex-col"
    >
      {/* Cover Image & Quick Action Overlay */}
      <div
        className="relative aspect-[16/10] overflow-hidden bg-purple-50 cursor-pointer"
        onClick={() => onSelect(destination)}
      >
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-70" />

        {/* Top Badges: Rating + Live Weather Widget + Bookmark */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            {/* Rating badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold shadow-sm border border-white/60">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{destination.rating}</span>
            </div>

            {/* Live Weather Widget */}
            {weather && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-sm border border-white/60"
                title={`Live weather in ${destination.name}: ${weather.condition}`}
              >
                {renderWeatherIcon(weather.icon)}
                <span className="font-bold text-slate-900">{weather.temp}°C</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">{weather.condition}</span>
              </motion.div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBucketList(destination.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isBookmarked
                ? 'bg-[#8b75d7] text-white shadow-md'
                : 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white hover:text-purple-600'
            }`}
            title={isBookmarked ? 'Remove from bucket list' : 'Add to dream bucket list'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-serif-title text-xl font-bold tracking-tight drop-shadow-sm flex items-center justify-between">
            <span>{destination.name}</span>
            <span className="text-xs font-sans font-medium text-purple-200">
              {destination.country}
            </span>
          </h3>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed clean metadata with formatted live currency */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{destination.region}</span>
            <span aria-hidden="true" className="text-purple-300">·</span>
            <span className="font-bold text-[#8b75d7]">{formatPrice(destination.avgDailyCost)}/day</span>
            <span aria-hidden="true" className="text-purple-300">·</span>
            <span>{destination.styles.slice(0, 2).join(' / ')}</span>
          </div>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {destination.tagline}
          </p>

          {/* Highlights preview */}
          <div className="mt-3 pt-3 border-t border-purple-50 flex flex-wrap gap-1 text-[11px] text-slate-500">
            {destination.highlights.slice(0, 2).map((h, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <span className="text-[#8b75d7] font-bold">•</span>
                <span>{h}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between gap-2">
          <button
            onClick={() => onShowOnMap(destination)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors py-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-[#8b75d7]" />
            <span>Map Pin</span>
          </button>

          <button
            onClick={() => onPlanTrip(destination)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors border border-purple-200/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Itinerary</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
