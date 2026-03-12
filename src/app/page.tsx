'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Lock, Eye, EyeOff, RefreshCw,
  ArrowDownRight, ArrowUpRight, Crown, Activity, Cpu, Gift,
  LogOut, Clock, Home, Copy, Check, X, AlertCircle, CheckCircle,
  Menu, ChevronRight, Timer, DollarSign, HelpCircle, MessageCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Animated Counter Component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <>{count.toLocaleString()}</>;
}

// Types
interface User {
  id: string;
  walletAddress: string;
  balance: number;
  totalProfit: number;
  referralEarnings: number;
  referralCode: string;
}

interface MiningData {
  id: string;
  investment: number;
  dailyProfit: number;
  totalEarned: number;
  status: string;
  startedAt: string;
  expiresAt: string;
}

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawalCount: number;
  referralCount: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface PlatformStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeMining: number;
  onlineUsers: number;
  websiteVisitors: number;
}

export default function UsdtMiningLab() {
  // Loading Screen State
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(0);
  const [hashrateCounter, setHashrateCounter] = useState(0);
  
  const loadingMessages = [
    'Connecting Blockchain Nodes...',
    'Initializing Mining Servers...',
    'Launching Mining Engine...',
    'Synchronizing Network Data...'
  ];

  // Login Page State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [walletInput, setWalletInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [showPinVisibility, setShowPinVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dashboard State (after login)
  const [user, setUser] = useState<User | null>(null);
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Platform Stats
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [onlineVisitors, setOnlineVisitors] = useState(1847);
  
  // Live Mining Power
  const [miningPower, setMiningPower] = useState(0);
  const [liveHashrate, setLiveHashrate] = useState(128.45);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const particlesRef = useRef<HTMLDivElement>(null);

  // ==================== LOADING SCREEN ====================
  useEffect(() => {
    if (isLoadingScreen) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => prev >= 100 ? 100 : prev + 1.2);
      }, 35);

      const messageInterval = setInterval(() => {
        setLoadingMessage(prev => (prev + 1) % loadingMessages.length);
      }, 2000);

      const hashrateInterval = setInterval(() => {
        setHashrateCounter(prev => prev >= 120 ? 120 : prev + 3);
      }, 40);

      const completeTimeout = setTimeout(() => {
        setIsLoadingScreen(false);
        const savedUser = localStorage.getItem('usdt_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          fetchUserData();
          setShowDashboard(true);
        }
      }, 3000);

      // Create particles
      if (particlesRef.current) {
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'absolute rounded-full';
          particle.style.background = `rgba(0, 245, 255, ${Math.random() * 0.3 + 0.1})`;
          particle.style.width = `${Math.random() * 6 + 2}px`;
          particle.style.height = particle.style.width;
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
          particle.style.animationDelay = `${Math.random() * 5}s`;
          particlesRef.current.appendChild(particle);
        }
      }

      return () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        clearInterval(hashrateInterval);
        clearTimeout(completeTimeout);
      };
    }
  }, [isLoadingScreen]);

  // Fetch Platform Stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Mining Power Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMiningPower(prev => {
        const target = 128.45;
        if (prev >= target) return target;
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Live Hashrate fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveHashrate(prev => {
        const change = (Math.random() - 0.5) * 0.1;
        return Math.max(128, Math.min(129, prev + change));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online visitors fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineVisitors(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(1800, Math.min(1900, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setPlatformStats(data);
      }
    } catch {}
  };

  // Fetch User Data
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMiningData(data.mining);
        setUserStats(data.stats || null);
        setTransactions(data.transactions || []);
        localStorage.setItem('usdt_user', JSON.stringify(data.user));
      }
    } catch {}
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput || walletInput.length !== 42 || !walletInput.startsWith('0x')) {
      setError('Please enter a valid BEP20 wallet address');
      return;
    }
    if (!pinInput || pinInput.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInput, pin: pinInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      setMiningData(data.mining);
      setUserStats(data.stats || null);
      setTransactions(data.transactions || []);
      localStorage.setItem('usdt_user', JSON.stringify(data.user));
      setShowDashboard(true);
      setSuccess('Welcome back!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput || walletInput.length !== 42 || !walletInput.startsWith('0x')) {
      setError('Please enter a valid BEP20 wallet address');
      return;
    }
    if (!pinInput || pinInput.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInput, pin: pinInput, referralCode: referralInput || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      localStorage.setItem('usdt_user', JSON.stringify(data.user));
      setShowDashboard(true);
      setSuccess('Account created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('usdt_user');
    setUser(null);
    setMiningData(null);
    setShowDashboard(false);
    setWalletInput('');
    setPinInput('');
    setSuccess('Logged out successfully');
  };

  // Clear messages
  useEffect(() => {
    if (error) setTimeout(() => setError(null), 5000);
    if (success) setTimeout(() => setSuccess(null), 5000);
  }, [error, success]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // FAQ Data
  const faqs = [
    { q: 'How does USDT mining work?', a: 'USDT mining uses your deposited funds to generate daily profits through our cloud mining infrastructure. You earn 4-4.5% daily returns on your investment.' },
    { q: 'What is the minimum deposit?', a: 'The minimum deposit is 10 USDT for the Starter Plan and 100 USDT for the Pro Plan.' },
    { q: 'How do I withdraw my profits?', a: 'You can withdraw your profits anytime through the Withdraw section. Withdrawals are processed within 24 hours.' },
    { q: 'Is my investment safe?', a: 'Yes, we use 256-bit SSL encryption and smart contracts for automated payouts. Your funds are secure with us.' },
    { q: 'How does the referral program work?', a: 'Share your referral code and earn 7% commission on every deposit made by your referrals.' },
  ];

  // Recent Withdrawals Data
  const recentWithdrawals = [
    { user: 'Aisha', amount: 44, time: 'Just now' },
    { user: 'Ahmed', amount: 59, time: 'Just now' },
    { user: 'Ali', amount: 120, time: '2 min ago' },
    { user: 'Fatima', amount: 85, time: '5 min ago' },
    { user: 'Omar', amount: 200, time: '8 min ago' },
    { user: 'Sara', amount: 156, time: '12 min ago' },
  ];

  // ==================== LOADING SCREEN ====================
  if (isLoadingScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
        
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(0, 245, 255, 0.15)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(123, 47, 247, 0.15)', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center px-4">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-3xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)', boxShadow: '0 0 60px rgba(0, 245, 255, 0.5)' }}>
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            USDT Mining Lab
          </motion.h1>
          <motion.p className="text-gray-400 mb-8">Premium Cloud Mining Platform</motion.p>

          {/* Loading Message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 h-6 font-medium"
              style={{ color: '#00F5FF' }}
            >
              {loadingMessages[loadingMessage]}
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-72 mx-auto mb-4">
            <div className="h-3 rounded-full overflow-hidden border border-white/10 bg-slate-800/80">
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${loadingProgress}%`, background: 'linear-gradient(90deg, #00F5FF, #7B2FF7)' }}
              />
            </div>
            <div className="text-white mt-3 text-lg font-semibold">{Math.round(loadingProgress)}%</div>
          </div>

          {/* Hashrate */}
          <div className="mb-4">
            <span className="text-gray-500 text-sm">Hashrate: </span>
            <span className="font-mono text-lg font-bold" style={{ color: '#00F5FF' }}>{hashrateCounter} TH/s</span>
          </div>

          {/* Security */}
          <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />SSL Secured</span>
            <span>|</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" style={{ color: '#00F5FF' }} />256-bit Encryption</span>
          </div>
        </div>

        <style jsx>{`@keyframes float { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(10px); } }`}</style>
      </div>
    );
  }

  // ==================== LOGIN PAGE ====================
  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
        {/* Toast Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)' }}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDT Mining Lab</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>BEP20 Network</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* LIVE MINING POWER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-block bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl px-8 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-400 text-sm">LIVE MINING POWER</p>
                    <p className="text-3xl font-bold text-white">{liveHashrate.toFixed(2)} TH/s</p>
                    <p className="text-cyan-400 text-xs">Global Hashrate - Real-time Network Speed</p>
                  </div>
                  <div className="ml-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">LIVE</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Platform Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-white font-bold text-lg mb-4 text-center">Platform Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Active Miners', value: '35,847', icon: Users, color: '#00F5FF' },
                  { label: 'Total Deposits', value: '$4,589,620', icon: ArrowDownRight, color: '#00FF6A' },
                  { label: 'Total Withdrawals', value: '$2,824,530', icon: ArrowUpRight, color: '#FF512F' },
                  { label: 'Online Now', value: onlineVisitors.toLocaleString(), icon: Activity, color: '#10B981' },
                  { label: 'Profit Paid', value: '$1,654,280', icon: DollarSign, color: '#FFD700' },
                  { label: 'Referral Bonus', value: '7%', icon: Gift, color: '#FC00FF' },
                  { label: 'Visitors Today', value: '8,452', icon: TrendingUp, color: '#667eea' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center hover:border-cyan-500/50 transition-all"
                  >
                    <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-500 text-xs">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Today Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-white font-bold text-lg mb-4 text-center">Today Statistics</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Today Deposits', value: '$42,580', color: 'from-emerald-500 to-green-600' },
                  { label: 'Today Withdrawals', value: '$18,200', color: 'from-red-500 to-orange-600' },
                  { label: 'Registered Today', value: '134', color: 'from-purple-500 to-pink-600' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-center`}
                  >
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-white/70 text-xs">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mining Plans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-white font-bold text-lg mb-4 text-center">Mining Plans</h2>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Starter Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Starter Plan</h3>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Minimum Deposit</span>
                        <span className="text-white font-medium">10 USDT</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Daily Profit</span>
                        <span className="text-emerald-400 font-bold">4%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white font-medium">30 Days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Return</span>
                        <span className="text-cyan-400 font-bold">120%</span>
                      </div>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:opacity-90 transition-all">
                      Start Mining
                    </button>
                  </div>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">POPULAR</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Minimum Deposit</span>
                        <span className="text-white font-medium">100 USDT</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Daily Profit</span>
                        <span className="text-amber-400 font-bold">4.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white font-medium">30 Days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Return</span>
                        <span className="text-cyan-400 font-bold">135%</span>
                      </div>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 transition-all">
                      Start Mining
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Login/Register Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white">Login</h2>
                  <p className="text-gray-500 text-sm">Connect your wallet to continue</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-800/80 rounded-2xl p-1.5 mb-4">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      authMode === 'login' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    style={authMode === 'login' ? { background: 'linear-gradient(to right, #6A11CB, #2575FC)' } : {}}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      authMode === 'register' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    style={authMode === 'register' ? { background: 'linear-gradient(to right, #00C853, #00E676)' } : {}}
                  >
                    Create Account
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                  {/* Wallet Address */}
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Wallet Address</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="0x..."
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        className="bg-slate-800/80 border-white/10 text-white placeholder:text-gray-600 h-12 pl-10 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">6 Digit PIN Code</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type={showPinVisibility ? "text" : "password"}
                        maxLength={6}
                        placeholder="••••••"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        className="bg-slate-800/80 border-white/10 text-white placeholder:text-gray-600 h-12 pl-10 pr-10 rounded-xl text-center text-xl tracking-[0.3em]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPinVisibility(!showPinVisibility)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400"
                      >
                        {showPinVisibility ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Referral Code (Register Only) */}
                  {authMode === 'register' && (
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Referral Code (Optional)</label>
                      <Input
                        placeholder="Enter referral code"
                        value={referralInput}
                        onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                        className="bg-slate-800/80 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 text-white font-bold rounded-xl shadow-xl transition-all"
                    style={authMode === 'login' 
                      ? { background: 'linear-gradient(to right, #6A11CB, #2575FC)', boxShadow: '0 0 30px rgba(106, 17, 203, 0.4)' }
                      : { background: 'linear-gradient(to right, #00C853, #00E676)', boxShadow: '0 0 30px rgba(0, 200, 83, 0.4)' }
                    }
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Connecting...
                      </span>
                    ) : authMode === 'login' ? 'Login to Dashboard' : 'Create Account'}
                  </motion.button>
                </form>

                {/* Network Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span>BEP20 Network</span>
                  <span className="text-gray-700">|</span>
                  <span>Powered by BNB Smart Chain</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Withdrawals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-white font-bold text-lg mb-4 text-center">Recent Withdrawals</h2>
              <div className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="space-y-2">
                  {recentWithdrawals.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-white font-medium">{item.user}</span>
                          <span className="text-gray-500 text-xs ml-2">{item.time}</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold">+{item.amount} USDT</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Referral Program */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Earn 7% Referral Commission</h2>
                <p className="text-gray-400 mb-4">Share your referral link and earn 7% on every deposit made by your friends</p>
                <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:opacity-90 transition-all">
                  Get Started
                </button>
              </div>
            </motion.div>

            {/* Why Trust Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h2 className="text-white font-bold text-lg mb-4 text-center">Why Trust Us</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: Shield, title: 'Secure', desc: '256-bit SSL encryption' },
                  { icon: Zap, title: 'Smart Contract', desc: 'Automated payouts' },
                  { icon: MessageCircle, title: '24/7 Support', desc: 'Always here to help' },
                  { icon: TrendingUp, title: 'Daily Profits', desc: '4-4.5% guaranteed' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-3">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <h2 className="text-white font-bold text-lg mb-4 text-center">Frequently Asked Questions</h2>
              <div className="max-w-2xl mx-auto space-y-2">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="text-white font-medium flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        {faq.q}
                      </span>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-gray-400 text-sm">
                        {faq.a}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 bg-slate-950/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)' }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                </svg>
              </div>
              <span className="font-bold" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDT Mining Lab</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">Secure Cloud Mining Platform</p>
            <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-4">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Telegram</a>
            </div>
            <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />SSL Secured</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-cyan-400" />256-bit Encryption</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-400" />Verified Platform</span>
            </div>
            <p className="text-gray-600 text-xs mt-4">© 2025 USDT Mining Lab. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Toast */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg">{success}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)' }}>
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDT Mining Lab</span>
              <p className="text-gray-500 text-xs">Premium Cloud Mining</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm font-mono">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
              </div>
            )}
            <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar - Desktop Only */}
        <aside className="hidden lg:flex w-64 flex-col bg-slate-900/50 border-r border-white/5">
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'deposit', icon: ArrowDownRight, label: 'Deposit' },
              { id: 'plans', icon: Zap, label: 'Mining Plans' },
              { id: 'withdraw', icon: ArrowUpRight, label: 'Withdraw' },
              { id: 'referral', icon: Gift, label: 'Referral' },
              { id: 'transactions', icon: Clock, label: 'Transactions' },
              { id: 'support', icon: MessageCircle, label: 'Support' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Logout Section */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Wallet Balance', value: `$${formatNumber(user?.balance || 0)}`, gradient: 'from-[#667eea] to-[#764ba2]' },
              { label: 'Total Deposits', value: `$${formatNumber(userStats?.totalDeposits || 0)}`, gradient: 'from-[#00C853] to-[#00E676]' },
              { label: 'Total Withdrawals', value: `$${formatNumber(userStats?.totalWithdrawals || 0)}`, gradient: 'from-[#FF512F] to-[#DD2476]' },
              { label: 'Total Profit', value: `$${formatNumber(user?.totalProfit || 0)}`, gradient: 'from-[#FFD700] to-[#FFA500]' },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative overflow-hidden rounded-2xl p-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                <div className="relative">
                  <div className="text-white/60 text-xs uppercase tracking-wider mb-1">{card.label}</div>
                  <div className="text-2xl font-bold text-white">{card.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mining Status */}
          {miningData && miningData.status === 'active' ? (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Active Mining</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs">Investment</div>
                  <div className="text-xl font-bold text-white">${formatNumber(miningData.investment)}</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs">Daily Profit</div>
                  <div className="text-xl font-bold text-emerald-400">${formatNumber(miningData.dailyProfit)}</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs">Total Earned</div>
                  <div className="text-xl font-bold text-cyan-400">${formatNumber(miningData.totalEarned)}</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs">Status</div>
                  <div className="text-xl font-bold text-emerald-400">Active</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">No Active Mining</h3>
              <p className="text-gray-400">Deposit USDT to start earning 4% daily profit</p>
            </div>
          )}

          {/* Transactions */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <div>
                      <div className="text-white font-medium capitalize">{tx.type}</div>
                      <div className="text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${formatNumber(tx.amount)}
                      </div>
                      <div className={`text-xs ${tx.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-xs">© 2025 USDT Mining Lab</p>
        </div>
      </footer>
    </div>
  );
}
