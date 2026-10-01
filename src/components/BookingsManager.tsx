import React, { useState, useEffect } from 'react';
import { TicketBooking, BookableOffer } from '../types';
import { api } from '../services/api';
import { Ticket, Train, Plane, Landmark, Compass, Calendar, Clock, CheckCircle2, QrCode, Printer, X, Plus, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'motion/react';

export const BookingsManager: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { formatPrice, convertPrice, currentCurrencyInfo } = useCurrency();

  const [activeTab, setActiveTab] = useState<'browse' | 'my-tickets'>('browse');
  const [offers, setOffers] = useState<BookableOffer[]>([]);
  const [bookings, setBookings] = useState<TicketBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for offers
  const [filterType, setFilterType] = useState<'all' | 'train' | 'flight' | 'attraction' | 'tour'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('All');

  // Booking Modal State
  const [bookingOffer, setBookingOffer] = useState<BookableOffer | null>(null);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [passengerName, setPassengerName] = useState(user?.name || 'Alex Vance');
  const [passengerEmail, setPassengerEmail] = useState(user?.email || 'alex@wanderhub.com');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [offersData, bookingsData] = await Promise.all([
          api.getBookableOffers(),
          api.getBookings()
        ]);
        setOffers(offersData);
        setBookings(bookingsData);
      } catch (e) {
        console.error('Error loading booking data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenBookingModal = (offer: BookableOffer) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setBookingOffer(offer);
    setSelectedClassIndex(0);
    setBookingSuccessMsg(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingOffer) return;

    setBookingSubmitting(true);
    try {
      const selectedClass = bookingOffer.classes[selectedClassIndex] || bookingOffer.classes[0];
      const finalPriceUSD = Math.round(bookingOffer.basePriceUSD * selectedClass.priceMultiplier);

      const seatNum = bookingOffer.type === 'train'
        ? `Coach C${Math.floor(Math.random() * 8) + 1} · Seat ${Math.floor(Math.random() * 45) + 1}`
        : bookingOffer.type === 'flight'
        ? `Seat ${Math.floor(Math.random() * 25) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`
        : '1 Adult VIP Pass';

      const gate = bookingOffer.type === 'train'
        ? `Platform ${Math.floor(Math.random() * 12) + 1}`
        : bookingOffer.type === 'flight'
        ? `Gate B${Math.floor(Math.random() * 20) + 1}`
        : 'Priority East Gate';

      const newBooking = await api.createBooking({
        type: bookingOffer.type,
        title: bookingOffer.title,
        destination: bookingOffer.destination,
        country: bookingOffer.country,
        origin: bookingOffer.origin || '',
        date: travelDate,
        time: bookingOffer.departureTime || '10:00 AM',
        passengerName,
        passengerEmail,
        ticketClass: selectedClass.name,
        seatOrQuantity: seatNum,
        priceUSD: finalPriceUSD,
        gateOrPlatform: gate,
        notes: `Confirmed via WanderHub Instant Ticketing with ${bookingOffer.provider}.`
      });

      setBookings([newBooking, ...bookings]);
      setBookingSuccessMsg(`Ticket Confirmed! PNR: ${newBooking.bookingRef}`);
      setTimeout(() => {
        setBookingOffer(null);
        setActiveTab('my-tickets');
      }, 1400);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    try {
      await api.cancelBooking(id);
      setBookings(bookings.map(b => (b.id === id ? { ...b, status: 'cancelled' } : b)));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOffers = offers.filter(o => {
    const matchesType = filterType === 'all' || o.type === filterType;
    const matchesCountry = filterCountry === 'All' || o.country === filterCountry;
    return matchesType && matchesCountry;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8b75d7] uppercase tracking-wider">
            <Ticket className="w-4 h-4 text-[#8b75d7]" />
            <span>Instant E-Tickets & Transit Passes</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            Book Tickets & Passes
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            High-speed trains (Vande Bharat, Shinkansen), monument priority entries (Taj Mahal, Louvre), flights, and guided passes.
          </p>
        </div>

        {/* Currency Notice Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-semibold">
          <span>Active Currency:</span>
          <span className="font-bold text-[#8b75d7]">{currentCurrencyInfo.flag} {currentCurrencyInfo.code} ({currentCurrencyInfo.symbol})</span>
        </div>
      </div>

      {/* Main Tabs: Browse Offers vs My Tickets with smooth floating pill */}
      <div className="flex items-center gap-1.5 p-1.5 bg-purple-50/70 rounded-2xl w-fit border border-purple-100 mb-8">
        <button
          onClick={() => setActiveTab('browse')}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors z-10 ${
            activeTab === 'browse' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Browse Tickets & Passes ({offers.length})</span>
          {activeTab === 'browse' && (
            <motion.div
              layoutId="bookingMainTab"
              className="absolute inset-0 bg-[#8b75d7] rounded-xl shadow-sm -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('my-tickets')}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors z-10 ${
            activeTab === 'my-tickets' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>My E-Tickets & Passes ({bookings.length})</span>
          {activeTab === 'my-tickets' && (
            <motion.div
              layoutId="bookingMainTab"
              className="absolute inset-0 bg-[#8b75d7] rounded-xl shadow-sm -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
        </button>
      </div>

      {/* TAB 1: BROWSE OFFERS */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-purple-100 shadow-2xs">
            {/* Offer Type selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {(
                [
                  { id: 'all', label: 'All Offers', icon: <Compass className="w-3.5 h-3.5" /> },
                  { id: 'train', label: 'High-Speed Trains', icon: <Train className="w-3.5 h-3.5" /> },
                  { id: 'attraction', label: 'Monuments & Passes', icon: <Landmark className="w-3.5 h-3.5" /> },
                  { id: 'flight', label: 'Flights', icon: <Plane className="w-3.5 h-3.5" /> },
                  { id: 'tour', label: 'Cruises & Tours', icon: <Compass className="w-3.5 h-3.5" /> },
                ] as const
              ).map(t => {
                const active = filterType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      active ? 'bg-[#8b75d7] text-white shadow-sm' : 'text-slate-600 hover:bg-purple-50'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto no-scrollbar py-0.5">
              <span className="text-slate-400 font-semibold mr-1 shrink-0">Country:</span>
              {['All', 'India', 'Japan', 'United States', 'France', 'Germany', 'United Arab Emirates'].map(c => (
                <button
                  key={c}
                  onClick={() => setFilterCountry(c)}
                  className={`px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    filterCountry === c
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'text-slate-500 hover:bg-purple-50'
                  }`}
                >
                  {c === 'India' && '🇮🇳 '}
                  {c === 'Japan' && '🇯🇵 '}
                  {c === 'United States' && '🇺🇸 '}
                  {c === 'France' && '🇫🇷 '}
                  {c === 'Germany' && '🇩🇪 '}
                  {c === 'United Arab Emirates' && '🇦🇪 '}
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map(offer => (
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                key={offer.id}
                className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-purple-50">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-purple-900 shadow-sm flex items-center gap-1 border border-white/60">
                      {offer.type === 'train' && <Train className="w-3.5 h-3.5 text-[#8b75d7]" />}
                      {offer.type === 'flight' && <Plane className="w-3.5 h-3.5 text-[#8b75d7]" />}
                      {offer.type === 'attraction' && <Landmark className="w-3.5 h-3.5 text-[#8b75d7]" />}
                      {offer.type === 'tour' && <Compass className="w-3.5 h-3.5 text-[#8b75d7]" />}
                      <span>{offer.tag}</span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-sm">
                      {offer.country === 'India' && '🇮🇳 '}{offer.country}
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-semibold text-purple-600 block mb-1">
                      {offer.provider}
                    </span>
                    <h3 className="font-serif-title text-base font-bold text-slate-900 leading-snug">
                      {offer.title}
                    </h3>

                    {offer.origin && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{offer.origin}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8b75d7]" />
                        <span className="font-semibold text-slate-800">{offer.destination}</span>
                        <span className="text-slate-400">· {offer.duration}</span>
                      </div>
                    )}

                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      {offer.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-purple-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">From</span>
                    <span className="text-lg font-bold text-[#8b75d7]">
                      {formatPrice(offer.basePriceUSD)}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleOpenBookingModal(offer)}
                    className="px-4 py-2 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                  >
                    Book Ticket
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY CONFIRMED E-TICKETS */}
      {activeTab === 'my-tickets' && (
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 shadow-sm max-w-md mx-auto">
              <Ticket className="w-12 h-12 text-[#8b75d7] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No E-Tickets Booked</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Browse high-speed trains, flights, or monument entry passes to reserve your digital tickets instantly.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white font-bold text-xs rounded-xl shadow"
              >
                Browse Bookable Tickets
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookings.map(booking => {
                const isCancelled = booking.status === 'cancelled';
                return (
                  <motion.div
                    whileHover={{ y: -2 }}
                    key={booking.id}
                    className={`bg-white rounded-3xl border overflow-hidden shadow-sm transition-all ${
                      isCancelled ? 'border-slate-200 opacity-60' : 'border-purple-200 hover:border-[#8b75d7]'
                    }`}
                  >
                    {/* Header Strip */}
                    <div className={`p-4 text-white flex items-center justify-between ${
                      isCancelled ? 'bg-slate-700' : 'bg-gradient-to-r from-[#8b75d7] to-[#735dc9]'
                    }`}>
                      <div className="flex items-center gap-2">
                        {booking.type === 'train' && <Train className="w-4 h-4 text-white" />}
                        {booking.type === 'flight' && <Plane className="w-4 h-4 text-white" />}
                        {booking.type === 'attraction' && <Landmark className="w-4 h-4 text-white" />}
                        <span className="text-xs font-bold uppercase tracking-wider">{booking.type} Boarding Pass</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-md">
                          PNR: {booking.bookingRef}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCancelled ? 'bg-rose-500 text-white' : 'bg-emerald-400 text-slate-900'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Main Ticket Body */}
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="sm:col-span-2 space-y-3">
                        <h4 className="font-serif-title text-base font-bold text-slate-900 leading-snug">
                          {booking.title}
                        </h4>

                        {booking.origin && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <span>{booking.origin}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#8b75d7]" />
                            <span>{booking.destination}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-purple-50">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Passenger</span>
                            <span className="font-bold text-slate-800">{booking.passengerName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Seat / Allocation</span>
                            <span className="font-bold text-purple-700">{booking.seatOrQuantity}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                            <span className="font-medium text-slate-800">{booking.date} · {booking.time}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Boarding Station / Gate</span>
                            <span className="font-bold text-slate-800">{booking.gateOrPlatform}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 italic pt-1">
                          {booking.notes}
                        </div>
                      </div>

                      {/* Right: Digital QR Stamp & Actions */}
                      <div className="flex flex-col items-center justify-between border-t sm:border-t-0 sm:border-l border-purple-100 pt-4 sm:pt-0 sm:pl-4 text-center">
                        <div className="w-24 h-24 rounded-2xl bg-[#faf9ff] border-2 border-dashed border-purple-200 flex flex-col items-center justify-center p-2 shadow-2xs">
                          <QrCode className="w-12 h-12 text-slate-800 mb-1" />
                          <span className="text-[8px] font-mono text-slate-500 uppercase">{booking.bookingRef}</span>
                        </div>

                        <div className="mt-3">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Fare Paid</span>
                          <span className="text-base font-bold text-[#8b75d7]">
                            {formatPrice(booking.priceUSD)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => window.print()}
                            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                            title="Print E-Ticket"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {bookingOffer && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-100 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b75d7] block">
                    Instant E-Ticket Reservation
                  </span>
                  <h3 className="font-serif-title text-lg font-bold text-slate-900 mt-0.5">
                    {bookingOffer.title}
                  </h3>
                </div>
                <button onClick={() => setBookingOffer(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccessMsg ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-slate-900">{bookingSuccessMsg}</h4>
                  <p className="text-xs text-slate-500">Redirecting to your digital boarding passes...</p>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {/* Class Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Ticket Class
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {bookingOffer.classes.map((cls, idx) => {
                        const price = Math.round(bookingOffer.basePriceUSD * cls.priceMultiplier);
                        const isSelected = selectedClassIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedClassIndex(idx)}
                            className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-purple-50/80 border-[#8b75d7] ring-1 ring-[#8b75d7]'
                                : 'bg-[#faf9ff] border-purple-100 hover:border-purple-200'
                            }`}
                          >
                            <span className="font-bold text-slate-900 block">{cls.name}</span>
                            <span className="text-[#8b75d7] font-bold mt-1 block">
                              {formatPrice(price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Travel Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Travel / Visit Date
                    </label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={e => setTravelDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40"
                      required
                    />
                  </div>

                  {/* Passenger Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lead Passenger
                      </label>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={e => setPassengerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        E-Ticket Email
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={e => setPassengerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40"
                        required
                      />
                    </div>
                  </div>

                  {/* Price Summary Bar */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Fare ({currentCurrencyInfo.code}):</span>
                      <span className="font-bold text-slate-900">
                        {bookingOffer.classes[selectedClassIndex]?.name}
                      </span>
                    </div>
                    <span className="text-xl font-extrabold text-[#8b75d7]">
                      {formatPrice(bookingOffer.basePriceUSD * (bookingOffer.classes[selectedClassIndex]?.priceMultiplier || 1))}
                    </span>
                  </div>

                  {/* Submit */}
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingOffer(null)}
                      className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      disabled={bookingSubmitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-200 transition-all disabled:opacity-50"
                    >
                      {bookingSubmitting ? 'Confirming Ticket...' : 'Confirm & Issue E-Ticket'}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
