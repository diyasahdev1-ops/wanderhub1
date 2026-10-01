import React, { useState } from 'react';
import { Trip, Activity, ExpenseItem, PackingItem } from '../types';
import { api } from '../services/api';
import { Calendar, Plus, Trash2, BookOpen, Sparkles, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface TripsManagerProps {
  trips: Trip[];
  onTripUpdated: (trip: Trip) => void;
  onTripDeleted: (tripId: string) => void;
  onPlanWithAI: () => void;
}

export const TripsManager: React.FC<TripsManagerProps> = ({
  trips,
  onTripUpdated,
  onTripDeleted,
  onPlanWithAI,
}) => {
  const { user } = useAuth();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(trips[0] || null);

  // New Activity Modal
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activityDayNumber, setActivityDayNumber] = useState(1);
  const [actTitle, setActTitle] = useState('');
  const [actTime, setActTime] = useState('10:00 AM');
  const [actDesc, setActDesc] = useState('');
  const [actLocation, setActLocation] = useState('');
  const [actCost, setActCost] = useState(0);
  const [actCategory, setActCategory] = useState<Activity['category']>('sightseeing');

  // New Expense form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState(25);
  const [expCategory, setExpCategory] = useState<ExpenseItem['category']>('food');

  // New Packing item
  const [newPackItem, setNewPackItem] = useState('');
  const [newPackCat, setNewPackCat] = useState<PackingItem['category']>('essentials');

  // Active sub-tab in Trip Detail: 'itinerary' | 'budget' | 'packing'
  const [tripSubTab, setTripSubTab] = useState<'itinerary' | 'budget' | 'packing'>('itinerary');

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.deleteTrip(id);
      onTripDeleted(id);
      if (selectedTrip?.id === id) {
        setSelectedTrip(trips.find(t => t.id !== id) || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePacking = async (packId: string) => {
    if (!selectedTrip) return;
    const updatedPacking = selectedTrip.packingList.map(p =>
      p.id === packId ? { ...p, packed: !p.packed } : p
    );
    const updated = await api.updateTrip(selectedTrip.id, { packingList: updatedPacking });
    setSelectedTrip(updated);
    onTripUpdated(updated);
  };

  const handleAddPackingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !newPackItem.trim()) return;
    const newItem: PackingItem = {
      id: `pack-${Date.now()}`,
      item: newPackItem.trim(),
      packed: false,
      category: newPackCat,
    };
    const updated = await api.updateTrip(selectedTrip.id, {
      packingList: [...selectedTrip.packingList, newItem],
    });
    setSelectedTrip(updated);
    onTripUpdated(updated);
    setNewPackItem('');
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !expTitle.trim()) return;
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      amount: Number(expAmount) || 0,
      category: expCategory,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = await api.updateTrip(selectedTrip.id, {
      expenses: [...selectedTrip.expenses, newExp],
    });
    setSelectedTrip(updated);
    onTripUpdated(updated);
    setExpTitle('');
    setExpAmount(25);
    setShowAddExpense(false);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !actTitle.trim()) return;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      time: actTime,
      title: actTitle.trim(),
      description: actDesc.trim(),
      location: actLocation.trim() || selectedTrip.destination,
      cost: Number(actCost) || 0,
      category: actCategory,
    };

    const daysCopy = [...selectedTrip.days];
    const targetDay = daysCopy.find(d => d.dayNumber === activityDayNumber);
    if (targetDay) {
      targetDay.activities.push(newActivity);
    } else {
      daysCopy.push({
        dayNumber: activityDayNumber,
        title: `Day ${activityDayNumber}`,
        theme: 'Custom Adventures',
        activities: [newActivity],
      });
    }

    const updated = await api.updateTrip(selectedTrip.id, { days: daysCopy });
    setSelectedTrip(updated);
    onTripUpdated(updated);
    setShowAddActivityModal(false);
    setActTitle('');
    setActDesc('');
    setActLocation('');
    setActCost(0);
  };

  // Budget calculations
  const totalSpent = selectedTrip
    ? selectedTrip.expenses.reduce((sum, e) => sum + e.amount, 0)
    : 0;
  const budgetRatio = selectedTrip && selectedTrip.budgetTotal > 0
    ? Math.min(Math.round((totalSpent / selectedTrip.budgetTotal) * 100), 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8b75d7] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#8b75d7]" />
            <span>Travel Dream Logger & Itineraries</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            My Dream Journeys
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Log your future dream escapes, track actual expenses against budgets, and check off tailored packing lists.
          </p>
        </div>

        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPlanWithAI}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-purple-200 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>New AI Itinerary</span>
        </motion.button>
      </div>

      {trips.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 shadow-sm max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-[#8b75d7] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Trips Logged Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Use the Google Gemini AI Trip Architect or pick a curated destination to generate and save your first dream adventure.
          </p>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={onPlanWithAI}
            className="px-5 py-2.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            Launch Gemini AI Architect
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Trips Sidebar List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
              Saved Trips ({trips.length})
            </h3>
            {trips.map(trip => {
              const isSelected = selectedTrip?.id === trip.id;
              return (
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-50/80 border-[#8b75d7] shadow-sm ring-1 ring-[#8b75d7]/30 text-purple-950'
                      : 'bg-white text-slate-900 border-purple-100 hover:border-purple-200 hover:bg-purple-50/30'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider block text-[#8b75d7]">
                        {trip.destination}, {trip.country}
                      </span>
                      <h4 className="text-sm font-bold truncate mt-0.5">{trip.title}</h4>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{trip.days.length} Days</span>
                        <span className="font-semibold text-purple-700">${trip.budgetTotal} budget</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Selected Trip Details */}
          {selectedTrip && (
            <motion.div
              layout
              className="lg:col-span-8 bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Trip Header Banner */}
              <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-900">
                <img
                  src={selectedTrip.coverImage}
                  alt={selectedTrip.title}
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-xs uppercase font-bold text-purple-300 tracking-wider">
                      {selectedTrip.destination}, {selectedTrip.country}
                    </span>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-bold mt-0.5">
                      {selectedTrip.title}
                    </h2>
                    <p className="text-xs text-slate-200 mt-1">
                      {selectedTrip.startDate} - {selectedTrip.endDate} · {selectedTrip.notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs"
                      title="Print trip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(selectedTrip.id)}
                      className="p-2 bg-rose-500/30 hover:bg-rose-500/50 backdrop-blur-md text-rose-100 rounded-xl text-xs"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-tab navigation with smooth floating active pill */}
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-1.5 p-1 bg-purple-50/50 rounded-2xl border border-purple-100">
                  {(
                    [
                      { id: 'itinerary', label: `Itinerary (${selectedTrip.days.length} Days)` },
                      { id: 'budget', label: `Budget & Expenses ($${totalSpent}/$${selectedTrip.budgetTotal})` },
                      { id: 'packing', label: `Packing List (${selectedTrip.packingList.filter(p => p.packed).length}/${selectedTrip.packingList.length})` },
                    ] as const
                  ).map(tab => {
                    const isActive = tripSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setTripSubTab(tab.id)}
                        className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors z-10 ${
                          isActive ? 'text-white' : 'text-slate-600 hover:text-purple-900'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="tripDetailSubTabPill"
                            className="absolute inset-0 bg-[#8b75d7] rounded-xl shadow-sm -z-10"
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {tripSubTab === 'itinerary' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddActivityModal(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#8b75d7] hover:text-[#7c66d1]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity</span>
                  </motion.button>
                )}
              </div>

              {/* TAB CONTENT: ITINERARY */}
              {tripSubTab === 'itinerary' && (
                <div className="space-y-4">
                  {selectedTrip.days.map(day => (
                    <motion.div
                      whileHover={{ y: -2 }}
                      key={day.dayNumber}
                      className="p-5 rounded-2xl border border-purple-100 bg-[#faf9ff] transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-purple-100 pb-2 mb-3">
                        <div>
                          <span className="text-xs font-bold text-[#8b75d7] uppercase">Day {day.dayNumber}</span>
                          <h4 className="text-sm font-bold text-slate-900">{day.title}</h4>
                        </div>
                        <span className="text-xs text-slate-400">{day.theme}</span>
                      </div>

                      <div className="space-y-3">
                        {day.activities.map((act, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs">
                            <span className="px-2.5 py-0.5 rounded-lg bg-white border border-purple-100 text-purple-800 font-mono text-[11px] shrink-0 mt-0.5">
                              {act.time}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{act.title}</span>
                                {act.cost > 0 && <span className="text-slate-500 font-semibold">${act.cost}</span>}
                              </div>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">{act.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <span>{act.location}</span>
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
              )}

              {/* TAB CONTENT: BUDGET & EXPENSES */}
              {tripSubTab === 'budget' && (
                <div className="space-y-6">
                  {/* Summary Metric Bar */}
                  <div className="p-5 rounded-2xl bg-[#faf9ff] border border-purple-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700">Budget Progress</span>
                      <span className="font-bold text-purple-900">
                        ${totalSpent} spent of ${selectedTrip.budgetTotal} total ({budgetRatio}%)
                      </span>
                    </div>
                    {/* Visual Progress bar */}
                    <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${budgetRatio}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full ${
                          budgetRatio > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-[#8b75d7] to-[#7c66d1]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Add Expense Trigger & Form */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Expenses Log ({selectedTrip.expenses.length})
                    </h4>
                    {!showAddExpense && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowAddExpense(true)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Expense</span>
                      </motion.button>
                    )}
                  </div>

                  {showAddExpense && (
                    <form onSubmit={handleAddExpense} className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={expTitle}
                          onChange={e => setExpTitle(e.target.value)}
                          placeholder="Expense title (e.g., Train ticket, Lunch...)"
                          className="px-3 py-2 bg-white border border-purple-100 rounded-xl text-xs"
                          required
                        />
                        <input
                          type="number"
                          value={expAmount}
                          onChange={e => setExpAmount(Number(e.target.value))}
                          placeholder="Amount ($)"
                          className="px-3 py-2 bg-white border border-purple-100 rounded-xl text-xs"
                          required
                        />
                        <select
                          value={expCategory}
                          onChange={e => setExpCategory(e.target.value as ExpenseItem['category'])}
                          className="px-3 py-2 bg-white border border-purple-100 rounded-xl text-xs"
                        >
                          <option value="stay">Stay / Hotel</option>
                          <option value="food">Food & Dining</option>
                          <option value="activities">Activities & Sightseeing</option>
                          <option value="transport">Transport</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddExpense(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white font-bold rounded-xl text-xs shadow-sm"
                        >
                          Save Expense
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Expenses List */}
                  <div className="space-y-2">
                    {selectedTrip.expenses.map(exp => (
                      <div key={exp.id} className="p-3 bg-[#faf9ff] rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{exp.title}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{exp.category} · {exp.date}</span>
                        </div>
                        <span className="font-bold text-purple-900 text-sm">${exp.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PACKING LIST */}
              {tripSubTab === 'packing' && (
                <div className="space-y-4">
                  {/* Add packing item input */}
                  <form onSubmit={handleAddPackingItem} className="flex gap-2">
                    <input
                      type="text"
                      value={newPackItem}
                      onChange={e => setNewPackItem(e.target.value)}
                      placeholder="Add item (e.g. Travel adapter, Passport copy, Hiking boots)..."
                      className="flex-1 px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#8b75d7]/40"
                    />
                    <select
                      value={newPackCat}
                      onChange={e => setNewPackCat(e.target.value as PackingItem['category'])}
                      className="px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
                    >
                      <option value="clothing">Clothing</option>
                      <option value="electronics">Electronics</option>
                      <option value="essentials">Essentials</option>
                      <option value="documents">Documents</option>
                      <option value="toiletries">Toiletries</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white font-bold rounded-xl text-xs shadow-sm"
                    >
                      Add
                    </motion.button>
                  </form>

                  {/* Checklist grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {selectedTrip.packingList.map(item => (
                      <motion.div
                        whileHover={{ y: -2 }}
                        key={item.id}
                        onClick={() => handleTogglePacking(item.id)}
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
                        <span className="text-[10px] text-purple-600 uppercase font-semibold tracking-wider">{item.category}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Modal to add Activity */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add New Activity</h3>
              <button onClick={() => setShowAddActivityModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Day</label>
                <select
                  value={activityDayNumber}
                  onChange={e => setActivityDayNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
                >
                  {selectedTrip?.days.map(d => (
                    <option key={d.dayNumber} value={d.dayNumber}>
                      Day {d.dayNumber}: {d.title}
                    </option>
                  ))}
                  <option value={(selectedTrip?.days.length || 0) + 1}>
                    + Add New Day {(selectedTrip?.days.length || 0) + 1}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Time</label>
                <input
                  type="text"
                  value={actTime}
                  onChange={e => setActTime(e.target.value)}
                  placeholder="e.g. 09:30 AM"
                  className="w-full px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Activity Title</label>
                <input
                  type="text"
                  value={actTitle}
                  onChange={e => setActTitle(e.target.value)}
                  placeholder="e.g. Bamboo Forest Sunrise Walk"
                  className="w-full px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  value={actDesc}
                  onChange={e => setActDesc(e.target.value)}
                  placeholder="Details, insider tips, directions..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Cost ($ USD)</label>
                  <input
                    type="number"
                    value={actCost}
                    onChange={e => setActCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={actCategory}
                    onChange={e => setActCategory(e.target.value as Activity['category'])}
                    className="w-full px-3 py-2 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs"
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="food">Food & Dining</option>
                    <option value="culture">Culture</option>
                    <option value="nature">Nature</option>
                    <option value="relaxation">Relaxation</option>
                    <option value="stay">Stay</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
