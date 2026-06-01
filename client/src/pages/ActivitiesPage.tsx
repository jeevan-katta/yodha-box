import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MdArrowForward, MdSportsCricket, MdDirectionsRun, MdMemory } from 'react-icons/md';

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();

  const activities = [
    {
      id: 'ground',
      title: 'Box Cricket',
      subtitle: 'STARTS AT ₹800/HR',
      badge: 'BOX CRICKET',
      badgeColor: 'bg-emerald-600/90 text-white',
      image: '/images/box_cricket.png',
      icon: <MdSportsCricket size={16} className="text-emerald-400" />,
      colorClass: 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 focus:ring-emerald-500/30',
      action: () => navigate('/dashboard', { state: { preselectedTurf: 'D' } })
    },
    {
      id: 'bowling',
      title: 'Bowling Machine',
      subtitle: 'STARTS AT ₹250 / 5 OVERS',
      badge: 'BOWLING NET',
      badgeColor: 'bg-purple-600/90 text-white',
      image: '/images/bowling_machine.png',
      icon: <MdMemory size={16} className="text-purple-400" />,
      colorClass: 'from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 focus:ring-purple-500/30',
      action: () => navigate('/dashboard/bowling')
    },
    {
      id: 'arena1',
      title: 'Pickleball 1',
      subtitle: 'STARTS AT ₹700/HR',
      badge: 'PICKLEBALL 1',
      badgeColor: 'bg-primary-500/90 text-white',
      image: '/images/pickleball.png',
      icon: <MdDirectionsRun size={16} className="text-primary-400" />,
      colorClass: 'from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 focus:ring-primary-500/30',
      action: () => navigate('/dashboard', { state: { preselectedTurf: 'A' } })
    },
    {
      id: 'arena2',
      title: 'Pickleball 2',
      subtitle: 'STARTS AT ₹800/HR',
      badge: 'PICKLEBALL 2',
      badgeColor: 'bg-accent-500/90 text-white',
      image: '/images/pickleball.png',
      icon: <MdDirectionsRun size={16} className="text-accent-400" />,
      colorClass: 'from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 focus:ring-accent-500/30',
      action: () => navigate('/dashboard', { state: { preselectedTurf: 'B' } })
    }
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col text-white pb-28">
      <Navbar />

      <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full animate-fade-in flex flex-col justify-center space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight">
            Select <span className="gradient-text">Activity</span>
          </h1>
          <p className="text-surface-400 text-xs sm:text-sm font-medium">
            Choose an activity turf below to view available times and book slots
          </p>
        </div>

        {/* Compact Grid: 2 Columns even on smaller screens */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto w-full">
          {activities.map((act) => (
            <div 
              key={act.id}
              onClick={act.action}
              className="glass-card border border-white/5 hover:border-white/15 shadow-xl rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden p-2.5 sm:p-3"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-surface-900">
                  <img 
                    src={act.image} 
                    alt={act.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 via-transparent to-transparent" />
                  
                  {/* Absolute Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-md ${act.badgeColor}`}>
                      {act.badge}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="px-1.5 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {act.icon}
                    <h3 className="text-xs sm:text-sm font-display font-black text-white leading-tight truncate">
                      {act.title}
                    </h3>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-surface-400 font-bold uppercase tracking-wider">
                    {act.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 px-0.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); act.action(); }}
                  className={`w-full py-2 px-3 bg-gradient-to-r text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white rounded-lg shadow-md ${act.colorClass} transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-1 focus:outline-none focus:ring-2`}
                >
                  <span>Book Now</span>
                  <MdArrowForward size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ActivitiesPage;
