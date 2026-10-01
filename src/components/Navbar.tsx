import React, { useState } from 'react';
import { Compass, MapPin, Sparkles, Ticket, ChevronDown, LogOut, Bookmark, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';

export type MainTabType = 'explore' | 'map' | 'planner' | 'tickets';

interface NavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onBookTicketClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onBookTicketClick,
}) => {
  const { user, logout, openAuthModal } = useAuth();
  const { currency, setCurrency, currentCurrencyInfo } = useCurrency();

  const [profileOpen, setProfileOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  const navItems: { id: MainTabType; label: string; icon?: React.ReactNode }[] = [
    { id: 'explore', label: 'Destinations' },
    { id: 'map', label: 'Google Maps', icon: <MapPin className="w-4 h-4 text-[#8b75d7]" /> },
    { id: 'planner', label: 'Gemini AI Planner', icon: <Sparkles className="w-4 h-4 text-[#8b75d7]" /> },
    { id: 'tickets', label: 'Book Tickets', icon: <Ticket className="w-4 h-4 text-[#8b75d7]" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-purple-100/80 text-slate-800 transition-all shadow-[0_1px_10px_rgba(139,117,215,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <motion.div
                whileHover={{ rotate: 18, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-9 h-9 rounded-xl bg-purple-100/70 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-sm"
              >
                <Compass className="w-5 h-5 text-[#8b75d7]" />
              </motion.div>
              <div>
                <span className="font-serif-title text-xl font-bold tracking-tight text-slate-900 block leading-none">
                  Wander<span className="text-[#8b75d7] font-sans font-extrabold">Hub</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">
                  Smart Travel & Maps
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links with Smooth Floating Pill */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-purple-50/50 rounded-2xl border border-purple-100/60">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors duration-200 z-10 ${
                      isActive ? 'text-purple-900' : 'text-slate-600 hover:text-purple-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-purple-100/90 -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action buttons: Currency Switcher + Book Tickets + Auth */}
          <div className="flex items-center gap-2.5">
            {/* Currency Switcher Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-xs font-bold text-slate-800 transition-all"
                title="Change display currency"
              >
                <span>{currentCurrencyInfo.flag}</span>
                <span>{currentCurrencyInfo.code}</span>
                <span className="text-purple-600 font-extrabold">({currentCurrencyInfo.symbol})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </motion.button>

              <AnimatePresence>
                {currencyMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-purple-100 shadow-xl py-2 z-50"
                    onMouseLeave={() => setCurrencyMenuOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 border-b border-purple-50">
                      Select Currency
                    </div>
                    {Object.values(CURRENCIES).map(curr => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr.code);
                          setCurrencyMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                          currency === curr.code
                            ? 'bg-purple-50 font-bold text-purple-900'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{curr.flag}</span>
                          <span>{curr.code}</span>
                        </span>
                        <span className="text-slate-400 font-semibold">{curr.symbol}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Book Ticket Button */}
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBookTicketClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] rounded-xl shadow-sm shadow-purple-200 transition-all"
            >
              <Ticket className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Book Tickets</span>
            </motion.button>

            {/* Auth / Profile Area */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-purple-50 border border-purple-200 transition-all focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-purple-300"
                  />
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-purple-100 shadow-xl py-2 z-50"
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-purple-600 font-medium">
                          <span>{user.travelStyle}</span>
                          <span>·</span>
                          <span>{user.homeCountry}</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveTab('tickets');
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-800 text-left font-medium"
                        >
                          <Ticket className="w-4 h-4 text-purple-500" />
                          My Booked E-Tickets
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('explore');
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-800 text-left font-medium"
                        >
                          <Bookmark className="w-4 h-4 text-purple-500" />
                          Saved Bucket List ({user.bucketList?.length || 0})
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#8b75d7] hover:bg-[#7c66d1] rounded-xl transition-colors shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar with floating indicator */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-purple-100 text-xs">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1 px-2.5 font-semibold transition-colors ${
                  isActive ? 'text-purple-700' : 'text-slate-500'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeMobilePill"
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#8b75d7] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
