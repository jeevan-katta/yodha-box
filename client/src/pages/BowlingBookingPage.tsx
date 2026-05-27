import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DatePicker from '../components/DatePicker';
import { getDateRange, getTodayStr, formatDate, formatCurrency } from '../utils/helpers';
import { createBowlingBooking, verifyPayment, getPublicBowlingPackages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdKeyboardBackspace, MdAccessTime, MdMemory, MdCheckCircle, MdPayment, MdSportsCricket } from 'react-icons/md';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import type { BowlingPackage } from '../types';

interface SessionInfo {
  id: string;
  name: string;
  timeLabel: string;
  startHour: number;
}

const BowlingBookingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<BowlingPackage | null>(null);
  const [packages, setPackages] = useState<BowlingPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<'confirm' | 'processing' | 'verifying' | 'success'>('confirm');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoOrder, setDemoOrder] = useState<any>(null);

  const dates = useMemo(() => getDateRange(30), []);

  const sessions: SessionInfo[] = [
    { id: 'morning',   name: 'Morning Session',   timeLabel: '6:00 AM – 12:00 PM', startHour: 6  },
    { id: 'afternoon', name: 'Afternoon Session',  timeLabel: '12:00 PM – 6:00 PM', startHour: 12 },
    { id: 'evening',   name: 'Evening Session',    timeLabel: '6:00 PM – 12:00 AM', startHour: 18 },
    { id: 'night',     name: 'Night & Late Night', timeLabel: '12:00 AM – 6:00 AM', startHour: 0  },
  ];

  // Fetch bowling packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await getPublicBowlingPackages();
        if (res.success && res.data) {
          setPackages(res.data);
          // Auto-select 10 overs by default
          const defaultPkg = res.data.find(p => p.overs === 10) || res.data[0];
          if (defaultPkg) setSelectedPackage(defaultPkg);
        }
      } catch {
        toast.error('Failed to load bowling packages');
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  const totalAmount = selectedPackage?.price ?? 0;
  const overs = selectedPackage?.overs ?? 0;

  const handleCheckout = async () => {
    if (!selectedSession) {
      toast.error('Please select a session');
      return;
    }
    if (!selectedPackage) {
      toast.error('Please select an overs package');
      return;
    }

    try {
      setCheckoutStep('processing');
      const orderRes = await createBowlingBooking(selectedDate, selectedSession.startHour, selectedPackage.overs);

      if (!orderRes.success || !orderRes.data) {
        toast.error(orderRes.message || 'Failed to create booking order');
        setCheckoutStep('confirm');
        return;
      }

      const orderData = orderRes.data;

      // Handle Demo Mode
      if (orderData.orderId.startsWith('order_DEMO_')) {
        setDemoOrder(orderData);
        setShowDemoModal(true);
        setCheckoutStep('confirm');
        return;
      }

      // Live Razorpay Mode
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'VSY Box Cricket Pro',
        description: `Bowling Net | ${formatDate(selectedDate)} | ${selectedSession.name} (${overs} Overs)`,
        order_id: orderData.orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setCheckoutStep('verifying');
          try {
            const verifyRes = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            if (verifyRes.success) {
              setCheckoutStep('success');
              toast.success('🎉 Booking confirmed!');
              setTimeout(() => navigate('/bookings'), 2000);
            } else {
              toast.error('Payment verification failed');
              setCheckoutStep('confirm');
            }
          } catch {
            toast.error('Payment verification error');
            setCheckoutStep('confirm');
          }
        },
        prefill: {
          contact: user?.phone || '',
          name: user?.name || '',
        },
        theme: { color: '#a855f7' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setCheckoutStep('confirm');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      const message = err.response?.data?.message || 'Booking initiation failed';
      toast.error(message);
      setCheckoutStep('confirm');
    }
  };

  const handleDemoPayment = async () => {
    if (!demoOrder) return;
    setShowDemoModal(false);
    setCheckoutStep('verifying');

    await new Promise(r => setTimeout(r, 1500));

    try {
      const verifyRes = await verifyPayment(
        demoOrder.orderId,
        `pay_DEMO_${Math.random().toString(36).slice(2, 11)}`,
        'demo_signature'
      );
      if (verifyRes.success) {
        setCheckoutStep('success');
        toast.success('🎉 Demo Booking confirmed!');
        setTimeout(() => navigate('/bookings'), 2000);
      } else {
        toast.error('Demo Payment verification failed');
        setCheckoutStep('confirm');
      }
    } catch {
      toast.error('Demo Payment verification error');
      setCheckoutStep('confirm');
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col text-white pb-32">
      <Navbar />

      <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full animate-fade-in space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/activities')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 hover:bg-white/10 transition-all cursor-pointer"
        >
          <MdKeyboardBackspace size={16} /> Back to Activities
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <MdMemory size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">
              Bowling Net <span className="gradient-text">Booking</span>
            </h1>
            <p className="text-surface-400 text-xs sm:text-sm font-medium">
              Equipped with professional bowling machine. Select a package &amp; session. First-come, first-served.
            </p>
          </div>
        </div>

        {/* Step 1: Select Date */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest pl-1">1. Select Date</h2>
          <DatePicker dates={dates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        {/* Step 2: Select Session */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest pl-1">2. Select Session</h2>
          <div className="grid grid-cols-2 gap-3">
            {sessions.map((sess) => {
              const active = selectedSession?.id === sess.id;
              return (
                <button
                  key={sess.id}
                  onClick={() => setSelectedSession(sess)}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all relative overflow-hidden ${
                    active 
                      ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {active && <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-500" />}
                  <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-surface-500'}`}>
                    <MdAccessTime size={18} />
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-display font-black leading-tight ${active ? 'text-purple-400' : 'text-white'}`}>
                      {sess.name}
                    </h4>
                    <p className="text-[10px] text-surface-400 mt-1 font-medium">{sess.timeLabel}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Select Package */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest pl-1">3. Select Overs Package</h2>

          {loadingPackages ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner text="Loading packages..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?._id === pkg._id;
                const gradientMap: Record<number, string> = {
                  5:  'from-purple-600/15 to-purple-500/5',
                  10: 'from-purple-500/15 to-indigo-500/5',
                  15: 'from-indigo-600/15 to-purple-500/5',
                  20: 'from-violet-600/15 to-purple-500/5',
                };
                return (
                  <button
                    key={pkg._id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative flex flex-col items-center p-4 sm:p-5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-purple-500/60 bg-gradient-to-br ' + gradientMap[pkg.overs] + ' ring-2 ring-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/15'
                    }`}
                  >
                    {isSelected && <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-2xl bg-gradient-to-r from-purple-500 to-violet-400" />}

                    {/* Cricket icon badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-colors ${isSelected ? 'bg-purple-500/25 text-purple-400' : 'bg-white/5 text-surface-500'}`}>
                      <MdSportsCricket size={16} />
                    </div>

                    {/* Overs */}
                    <span className={`text-3xl sm:text-4xl font-display font-black leading-none ${isSelected ? 'text-white' : 'text-surface-200'}`}>
                      {pkg.overs}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isSelected ? 'text-purple-400' : 'text-surface-500'}`}>
                      Overs
                    </span>

                    {/* Divider */}
                    <div className={`w-full h-px my-3 ${isSelected ? 'bg-purple-500/30' : 'bg-white/5'}`} />

                    {/* Price */}
                    <p className={`text-xl sm:text-2xl font-display font-black ${isSelected ? 'text-purple-300' : 'text-surface-300'}`}>
                      {formatCurrency(pkg.price)}
                    </p>
                    <p className="text-[10px] text-surface-500 font-bold mt-0.5">total</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Checkout Summary */}
        {selectedSession && selectedPackage && (
          <div className="p-5 glass-card border-purple-500/10 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-4">
            <div className="space-y-1 text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">Total Price Summary</p>
              <h3 className="text-3xl font-display font-black text-white leading-none mt-1">
                {formatCurrency(totalAmount)}
              </h3>
              <p className="text-xs text-surface-400 font-medium">
                {overs} Overs · {formatDate(selectedDate)} · {selectedSession.name}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutStep === 'processing'}
              className="btn-primary py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {checkoutStep === 'processing' ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        )}

      </main>

      {/* Demo Checkout Modal */}
      <Modal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} title="Demo Payment Gateway">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
            <MdPayment size={32} />
          </div>
          <h3 className="text-xl font-display font-black text-white">Select Demo Action</h3>
          <p className="text-xs text-surface-400 mt-2 max-w-xs leading-relaxed font-medium">
            You are currently booking the Bowling Net in <strong>Demo Mode</strong>. Trigger a mock payment to complete the transaction.
          </p>
          <div className="w-full mt-6 space-y-2">
            <p className="text-xs text-surface-500 font-bold">{overs} Overs · {selectedSession?.name}</p>
            <p className="text-2xl font-display font-black text-purple-300">{formatCurrency(totalAmount)}</p>
          </div>
          <button
            onClick={handleDemoPayment}
            className="w-full btn-primary bg-purple-600 hover:bg-purple-500 font-black uppercase tracking-widest text-xs py-4 rounded-xl mt-5 shadow-xl shadow-purple-500/20"
          >
            Trigger Success Payment ({formatCurrency(totalAmount)})
          </button>
        </div>
      </Modal>

      {/* Loading Overlay */}
      {(checkoutStep === 'verifying' || checkoutStep === 'success') && (
        <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          {checkoutStep === 'verifying' ? (
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <h3 className="text-lg font-display font-black text-white uppercase tracking-widest animate-pulse">Verifying Payment</h3>
              <p className="text-surface-500 text-xs font-bold uppercase">Confirming session ticket with arena</p>
            </div>
          ) : (
            <div className="text-center space-y-4 max-w-xs p-6 bg-surface-900 border border-white/10 rounded-3xl animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-green-500/25 flex items-center justify-center mx-auto text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <MdCheckCircle size={36} />
              </div>
              <h3 className="text-2xl font-display font-black text-green-400">Confirmed!</h3>
              <p className="text-xs text-surface-400 leading-relaxed font-medium">
                Your bowling net session is successfully reserved. You are now placed in the queue for {selectedSession?.name}!
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default BowlingBookingPage;
