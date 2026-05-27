import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DatePicker from '../components/DatePicker';
import SlotGrid from '../components/SlotGrid';
import BookingModal from '../components/BookingModal';
import { getSlots } from '../services/api';
import { getDateRange, getTodayStr, isWeekend } from '../utils/helpers';
import type { SlotInfo, TurfId } from '../types';
import toast from 'react-hot-toast';
import { MdRefresh, MdInfo, MdKeyboardBackspace } from 'react-icons/md';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedTurf] = useState<TurfId>(() => {
    const state = location.state as { preselectedTurf?: TurfId } | null;
    return state?.preselectedTurf || 'A';
  });
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<SlotInfo[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const dates = getDateRange(30); // Show 30 days

  const fetchSlots = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await getSlots(selectedTurf, date);
      if (res.success && res.data) {
        setSlots(res.data.slots);
      }
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [selectedTurf]);

  useEffect(() => {
    fetchSlots(selectedDate);
    setSelectedSlots([]); // Clear selection when date changes
  }, [selectedDate, fetchSlots]);

  const handleSlotToggle = (slot: SlotInfo) => {
    setSelectedSlots(prev => {
      const isSelected = prev.some(s => s.hour === slot.hour);
      if (isSelected) {
        return prev.filter(s => s.hour !== slot.hour);
      } else {
        return [...prev, slot].sort((a, b) => a.hour - b.hour);
      }
    });
  };

  const handleBookingComplete = () => {
    fetchSlots(selectedDate);
    setSelectedSlots([]);
  };

  const totalAmount = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  const weekend = isWeekend(selectedDate);

  return (
    <div className="min-h-screen bg-surface-950 pb-32">
      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Switch Arena Back Action */}
        <button
          onClick={() => navigate('/activities')}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 hover:bg-white/10 transition-all cursor-pointer animate-fade-in"
        >
          <MdKeyboardBackspace size={16} /> Back to Activities
        </button>
        {/* Header */}
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
              Book Your <span className="gradient-text">Slots</span>
            </h1>
            <p className="text-surface-400 mt-2">
              Pick multiple slots for a longer game session 🏏
            </p>
          </div>
          
          <button
            onClick={() => fetchSlots(selectedDate)}
            className="w-fit px-4 py-2 rounded-xl bg-white/5 text-sm text-surface-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all border border-white/5"
          >
            <MdRefresh size={18} className={loading ? 'animate-spin' : ''} />
            Refresh Slots
          </button>
        </div>

        {/* Date Picker */}
        <div className="mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs sm:text-sm font-bold text-surface-300 uppercase tracking-[0.15em]">Select Date</h2>
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] sm:text-xs">
              <MdInfo className={weekend ? 'text-amber-400' : 'text-green-400'} size={14} />
              {weekend ? (
                <span className="text-amber-400 font-medium">Weekend Pricing</span>
              ) : (
                <span className="text-green-400 font-medium">Weekday Pricing</span>
              )}
            </div>
          </div>
          <DatePicker dates={dates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <p className="mt-3 text-[10px] sm:text-xs flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500/90 font-medium">
            <MdInfo size={16} className="mt-0.5 flex-shrink-0" />
            <span>On government holidays and festive seasons, weekend prices will be applied (if applicable on the selected date, excess amount will be collected at the arena).</span>
          </p>
        </div>

        {/* Slot Grids */}
        <div className="space-y-8 animate-slide-up">
          {(() => {
            const today = getTodayStr();
            const currentHour = new Date().getHours();
            
            // Filter out past hours if today
            const filterPastSlots = (slotsInfo: SlotInfo[]) => {
              if (selectedDate !== today) return slotsInfo;
              return slotsInfo.filter((slot) => slot.hour > currentHour);
            };

            const filteredSlots = filterPastSlots(slots);

            return (
              <SlotGrid
                slots={filteredSlots}
                turfId={selectedTurf}
                selectedSlotHours={selectedSlots.map(s => s.hour)}
                onSlotToggle={handleSlotToggle}
                isLoading={loading}
              />
            );
          })()}
        </div>
      </main>

      {/* Selection Action Bar */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-24 md:bottom-6 inset-x-0 mx-auto w-[90%] max-w-2xl z-50 animate-slide-up">
          <div className="bg-surface-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/50 flex items-center justify-between">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[10px] sm:text-xs text-surface-400 font-medium uppercase tracking-wider truncate">
                {selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'} Selected
              </span>
              <span className="text-lg sm:text-xl font-display font-black text-white">
                ₹{totalAmount}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <button 
                onClick={() => setSelectedSlots([])}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-surface-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn-primary py-2 sm:py-3 px-4 sm:px-8 text-sm sm:text-base shadow-xl shadow-primary-500/20 whitespace-nowrap"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        selectedSlots={selectedSlots}
        turfId={selectedTurf || 'A'}
        date={selectedDate}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
};

export default DashboardPage;
