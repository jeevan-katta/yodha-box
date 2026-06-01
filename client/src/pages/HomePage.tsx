import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../services/api';
import { formatDate, formatHour } from '../utils/helpers';
import type { Booking } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MdAccessTime, MdLocationOn, MdSportsCricket, 
  MdPhone, MdCheckCircle, MdArrowForward 
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    // Dynamic greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchNextBooking = async () => {
      try {
        const res = await getUserBookings();
        if (res.success && res.data && res.data.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const today = new Date(todayStr + 'T00:00:00');
          const currentHour = new Date().getHours();

          // Filter for active, confirmed, future bookings
          const confirmedFuture = res.data.filter((b: Booking) => {
            if (b.status !== 'confirmed') return false;
            const bDate = new Date(b.date + 'T00:00:00');
            if (bDate > today) return true;
            if (bDate.getTime() === today.getTime() && b.startHour > currentHour) return true;
            return false;
          });

          // Sort ascending (closest first)
          confirmedFuture.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + String(a.startHour).padStart(2, '0') + ':00:00');
            const dateB = new Date(b.date + 'T' + String(b.startHour).padStart(2, '0') + ':00:00');
            return dateA.getTime() - dateB.getTime();
          });

          if (confirmedFuture.length > 0) {
            setUpcomingBooking(confirmedFuture[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load home bookings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNextBooking();
  }, []);

  const handleBookArena = (turfId: 'A' | 'B') => {
    navigate('/dashboard', { state: { preselectedTurf: turfId } });
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col text-white pb-32">
      <Navbar />

      <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full animate-fade-in space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/15 bg-gradient-to-br from-surface-900 via-surface-950 to-surface-950 shadow-2xl shadow-black/40 group">
          
          {/* Ambient Glows */}
          <div className="absolute right-0 top-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl opacity-60 pointer-events-none transition-all duration-700 group-hover:bg-primary-500/15" />
          <div className="absolute left-0 bottom-0 w-36 h-36 bg-accent-500/5 rounded-full blur-2xl opacity-40 pointer-events-none" />
          
          {/* Background Branding Watermark */}
          <div className="absolute right-4 bottom-[-10px] opacity-[0.02] sm:opacity-[0.03] select-none text-[100px] sm:text-[140px] font-black tracking-tighter pointer-events-none text-white transition-all duration-500 group-hover:scale-105">
            YODHA
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                Arena Member
              </span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-surface-500 font-display">
                {greeting}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight capitalize truncate max-w-[280px] sm:max-w-md">
              {user?.name || 'Player'}
            </h1>
            
            <p className="text-xs sm:text-sm text-surface-400 font-medium max-w-sm sm:max-w-md leading-relaxed">
              Welcome back to Safilguda's premier athletic arena. Your next victory starts here.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/activities')}
            className="w-full sm:w-auto relative z-10 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm shadow-xl shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] whitespace-nowrap"
          >
            <span>Book Slots Now</span> 
            <MdArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Quick Booking CTAs */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest pl-1">Quick Arena Booking</h2>
          <div className="flex overflow-x-auto gap-3.5 pb-3 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
            
            {/* Open Ground CTA */}
            <div 
              onClick={() => handleBookArena('D' as any)}
              className="flex-shrink-0 w-[60%] sm:w-56 glass-card-hover border-white/5 p-3 rounded-2xl flex flex-col group cursor-pointer relative overflow-hidden snap-start"
            >
              <div className="relative h-24 w-full overflow-hidden rounded-xl">
                <img 
                  src="/images/box_cricket.png" 
                  alt="Box Cricket Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">
                    Box Cricket
                  </span>
                </div>
              </div>
              <div className="pt-2 px-1 text-left">
                <h3 className="text-xs sm:text-sm font-display font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                  Box Cricket
                </h3>
                <p className="text-[9px] text-surface-500 font-bold uppercase tracking-wider mt-0.5">
                  Book Box Cricket
                </p>
              </div>
            </div>

            {/* Bowling Machine CTA */}
            <div 
              onClick={() => navigate('/dashboard/bowling')}
              className="flex-shrink-0 w-[60%] sm:w-56 glass-card-hover border-white/5 p-3 rounded-2xl flex flex-col group cursor-pointer relative overflow-hidden snap-start"
            >
              <div className="relative h-24 w-full overflow-hidden rounded-xl">
                <img 
                  src="/images/bowling_machine.png" 
                  alt="Bowling Net Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-600 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">
                    Bowling Net
                  </span>
                </div>
              </div>
              <div className="pt-2 px-1 text-left">
                <h3 className="text-xs sm:text-sm font-display font-black text-white group-hover:text-purple-400 transition-colors truncate">
                  Bowling Machine
                </h3>
                <p className="text-[9px] text-surface-500 font-bold uppercase tracking-wider mt-0.5">
                  Overs Lane C
                </p>
              </div>
            </div>

            {/* Arena 1 CTA */}
            <div 
              onClick={() => handleBookArena('A')}
              className="flex-shrink-0 w-[60%] sm:w-56 glass-card-hover border-white/5 p-3 rounded-2xl flex flex-col group cursor-pointer relative overflow-hidden snap-start"
            >
              <div className="relative h-24 w-full overflow-hidden rounded-xl">
                <img 
                  src="/images/pickleball.png" 
                  alt="Pickleball 1 Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary-500 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">
                    Pickleball 1
                  </span>
                </div>
              </div>
              <div className="pt-2 px-1 text-left">
                <h3 className="text-xs sm:text-sm font-display font-black text-white group-hover:text-primary-400 transition-colors truncate">
                  Pickleball 1
                </h3>
                <p className="text-[9px] text-surface-500 font-bold uppercase tracking-wider mt-0.5">
                  Book Pickleball 1
                </p>
              </div>
            </div>

            {/* Arena 2 CTA */}
            <div 
              onClick={() => handleBookArena('B')}
              className="flex-shrink-0 w-[60%] sm:w-56 glass-card-hover border-white/5 p-3 rounded-2xl flex flex-col group cursor-pointer relative overflow-hidden snap-start"
            >
              <div className="relative h-24 w-full overflow-hidden rounded-xl">
                <img 
                  src="/images/pickleball.png" 
                  alt="Pickleball 2 Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-accent-500 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">
                    Pickleball 2
                  </span>
                </div>
              </div>
              <div className="pt-2 px-1 text-left">
                <h3 className="text-xs sm:text-sm font-display font-black text-white group-hover:text-accent-400 transition-colors truncate">
                  Pickleball 2
                </h3>
                <p className="text-[9px] text-surface-500 font-bold uppercase tracking-wider mt-0.5">
                  Book Pickleball 2
                </p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Dynamic Match Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest pl-1">Your Next Match</h2>
          
          {loading ? (
            <div className="glass-card border-white/5 py-12 flex justify-center">
              <LoadingSpinner size="md" text="Loading matches..." />
            </div>
          ) : upcomingBooking ? (
            <div className="glass-card border-green-500/20 bg-gradient-to-b from-white/[0.04] to-transparent p-5 sm:p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden ${
                  upcomingBooking.turfId === 'A' ? 'bg-primary-500/10' : 'bg-accent-500/10'
                }`}>
                  <span className={`absolute -right-1 -bottom-2 text-3xl font-black opacity-10 ${
                    upcomingBooking.turfId === 'A' ? 'text-primary-500' : 'text-accent-500'
                  }`}>{upcomingBooking.turfId}</span>
                  <span className={`relative font-display font-black text-2xl ${
                    upcomingBooking.turfId === 'A' ? 'text-primary-400' : 'text-accent-400'
                  }`}>
                    {upcomingBooking.turfId}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <MdCheckCircle size={10} /> Confirmed
                    </span>
                    <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">
                      {upcomingBooking.turfId === 'A' ? 'Pickleball 1' : upcomingBooking.turfId === 'B' ? 'Pickleball 2' : upcomingBooking.turfId === 'D' ? 'Box Cricket' : 'Bowling Net'}
                    </span>
                  </div>
                  <h4 className="text-white text-base font-black tracking-tight truncate">
                    {formatDate(upcomingBooking.date)}
                  </h4>
                  <p className="text-xs text-surface-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <MdAccessTime size={14} className="text-primary-400/80" />
                    <span>{formatHour(upcomingBooking.startHour)} - {formatHour(upcomingBooking.startHour + 1)}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-3">
                <button 
                  onClick={() => navigate('/bookings')}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-black uppercase tracking-wider text-surface-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card border-white/5 p-8 text-center rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                <MdSportsCricket className="text-surface-500" size={32} />
              </div>
              <h3 className="text-base font-display font-black text-white">No upcoming games scheduled</h3>
              <p className="text-xs text-surface-400 mt-1 max-w-xs mx-auto font-medium leading-relaxed">
                Unlock the ultimate box cricket thrill! Book your slot now and play with your friends.
              </p>
              <button 
                onClick={() => navigate('/activities')}
                className="mt-4 btn-primary py-2.5 px-6 text-xs rounded-xl shadow-lg shadow-primary-500/10 active:scale-[0.98]"
              >
                Go to Arena Booking
              </button>
            </div>
          )}
        </div>

        {/* Location & Support Utilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Location Block */}
          <div className="glass-card border-white/5 p-5 rounded-3xl flex flex-col justify-between">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0 text-primary-400 border border-primary-500/15">
                <MdLocationOn size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white tracking-tight">Yodha Nets Safilguda</h4>
                <p className="text-[11px] text-surface-400 font-medium leading-relaxed mt-1">
                  Plot No. 162, Road No. 3, Near Jain Mandir, East Anandbagh, Safilguda, Secunderabad 500047.
                </p>
              </div>
            </div>
            
            <a
              href="https://maps.app.goo.gl/BCCghi3hbdX2P5YZ9?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:bg-white/10 transition-all text-center cursor-pointer"
            >
              Get Arena Directions
            </a>
          </div>

          {/* Quick Support Block */}
          <div className="glass-card border-white/5 p-5 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-400 border border-green-500/15">
                  <FaWhatsapp size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight">Direct Support Channels</h4>
                  <p className="text-[11px] text-surface-400 font-medium leading-relaxed mt-1">
                    Have questions or need manual booking adjustments? Call or chat instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <a
                href="https://wa.me/919133101999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-widest text-green-400 hover:bg-green-500/20 transition-all text-center cursor-pointer"
              >
                WhatsApp
              </a>
              <a
                href="tel:+919133101999"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-surface-300 hover:bg-white/10 transition-all text-center cursor-pointer"
              >
                <MdPhone size={14} /> Call Support
              </a>
            </div>
          </div>
          
        </div>

      </main>
    </div>
  );
};

export default HomePage;
