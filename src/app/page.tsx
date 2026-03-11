'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Lock, Eye, EyeOff, RefreshCw, Globe,
  ArrowDownRight, ArrowUpRight, Crown, Activity, Cpu, Gift,
  LogOut, Clock, Home, Server, Copy, Check, X, AlertCircle, CheckCircle,
  Menu, CreditCard, Settings, ChevronRight, Timer, Calculator, Percent, DollarSign
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

interface LiveActivity {
  type: string;
  message: string;
  amount?: number;
  createdAt: string;
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
  const [onlineVisitors, setOnlineVisitors] = useState(0);
  
  // Live Activity Feed
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [miningPower, setMiningPower] = useState(0);

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
    fetchLiveActivities();
  }, []);

  // Fetch Live Activities
  const fetchLiveActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        if (data.hasRealData && data.activities.length > 0) {
          setLiveActivities(data.activities);
        }
      }
    } catch {}
  };

  // Mining Power Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMiningPower(prev => {
        const target = 124.7;
        if (prev >= target) return target;
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Live Activity Rotation
  useEffect(() => {
    if (liveActivities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentActivityIndex(prev => (prev + 1) % liveActivities.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [liveActivities.length]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setPlatformStats(data);
        setOnlineVisitors(data.onlineUsers || 1);
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
                {error}
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* LEFT SECTION */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              {/* Headline */}
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Start USDT Cloud Mining Today
                </span>
              </h1>
              <p className="text-gray-300 text-xl mb-8">
                Earn stable daily profit with automated mining infrastructure.
              </p>

              {/* Platform Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total Users', value: platformStats?.totalUsers || 12540, color: '#667eea', glow: 'rgba(102, 126, 234, 0.4)' },
                  { label: 'Online Users', value: onlineVisitors || 342, color: '#00FF6A', glow: 'rgba(0, 255, 106, 0.4)' },
                  { label: 'Total Deposited', value: `$${formatNumber(platformStats?.totalDeposits || 184250, 0)}`, color: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)' },
                  { label: 'Total Withdrawn', value: `$${formatNumber(platformStats?.totalWithdrawals || 96420, 0)}`, color: '#FF512F', glow: 'rgba(255, 81, 47, 0.4)' },
                  { label: 'Active Miners', value: platformStats?.activeMining || 4830, color: '#00F5FF', glow: 'rgba(0, 245, 255, 0.4)' },
                  { label: 'Daily Profit Rate', value: '4% – 5%', color: '#FC00FF', glow: 'rgba(252, 0, 255, 0.4)' },
                  { label: 'Website Visitors', value: (platformStats?.websiteVisitors || 25900).toLocaleString(), color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 transition-all cursor-pointer overflow-hidden"
                    style={{ 
                      border: `1px solid ${stat.color}40`,
                      boxShadow: `0 0 20px ${stat.glow}, inset 0 0 20px ${stat.color}10`
                    }}
                  >
                    {/* Animated glow effect */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-50"
                      style={{ 
                        background: `linear-gradient(135deg, ${stat.color}20, transparent)`,
                      }}
                    />
                    <div className="relative">
                      <motion.div 
                        className="text-2xl font-bold"
                        style={{ color: stat.color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        {typeof stat.value === 'number' ? (
                          <AnimatedCounter value={stat.value} />
                        ) : (
                          stat.value
                        )}
                      </motion.div>
                      <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Feature Badges */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Zap, label: 'Instant Mining Activation', color: 'text-amber-400' },
                  { icon: Shield, label: '256-bit SSL Secure Platform', color: 'text-emerald-400' },
                  { icon: TrendingUp, label: 'Stable Daily Mining Rewards', color: 'text-cyan-400' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/50 flex items-center justify-center mb-2">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Mining Power Counter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Global Mining Power</p>
                      <p className="text-xl font-bold text-white">{miningPower.toFixed(1)} PH/s</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mx-auto mb-1" />
                    <span className="text-emerald-400 text-xs font-medium">LIVE</span>
                  </div>
                </div>
              </motion.div>

              {/* Live Activity Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white font-semibold text-sm">Live Activity Feed</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-hidden">
                  {liveActivities.length > 0 ? (
                    liveActivities.slice(0, 4).map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type === 'deposit' ? 'bg-emerald-500/20' :
                          activity.type === 'withdraw' ? 'bg-red-500/20' : 'bg-cyan-500/20'
                        }`}>
                          {activity.type === 'deposit' ? <ArrowDownRight className="w-4 h-4 text-emerald-400" /> :
                           activity.type === 'withdraw' ? <ArrowUpRight className="w-4 h-4 text-red-400" /> :
                           <Users className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <p className="text-gray-300 text-xs flex-1 truncate">{activity.message}</p>
                      </motion.div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-gray-300 text-xs">Ahmed deposited 320 USDT</p>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-gray-300 text-xs">John activated Starter Plan</p>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-gray-300 text-xs">Ali withdrew 120 USDT</p>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-gray-300 text-xs">Michael deposited 500 USDT</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Two Column: Latest Withdrawals & Top Investors */}
              <div className="grid grid-cols-2 gap-4">
                {/* Latest Withdrawals */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
                >
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    Latest Withdrawals
                  </h3>
                  <div className="space-y-2">
                    {[
                      { user: 'A***', amount: 120, status: 'Paid' },
                      { user: 'J***', amount: 80, status: 'Paid' },
                      { user: 'M***', amount: 240, status: 'Paid' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                        <span className="text-gray-400 text-xs">{item.user}</span>
                        <span className="text-white text-xs font-medium">{item.amount} USDT</span>
                        <span className="text-emerald-400 text-xs">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Top Investors */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
                >
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Top Investors Today
                  </h3>
                  <div className="space-y-2">
                    {[
                      { rank: 1, user: 'A***', amount: 2500 },
                      { rank: 2, user: 'J***', amount: 1800 },
                      { rank: 3, user: 'M***', amount: 1500 },
                      { rank: 4, user: 'D***', amount: 900 },
                      { rank: 5, user: 'K***', amount: 700 },
                    ].map((item) => (
                      <div key={item.rank} className="flex items-center gap-2 p-1.5">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          item.rank === 1 ? 'bg-amber-500 text-black' :
                          item.rank === 2 ? 'bg-gray-400 text-black' :
                          item.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-600 text-gray-300'
                        }`}>
                          {item.rank}
                        </div>
                        <span className="text-gray-400 text-xs flex-1">{item.user}</span>
                        <span className="text-amber-400 text-xs font-medium">{item.amount} USDT</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* RIGHT SECTION - Login Panel */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md mx-auto"
            >
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-2xl mb-4" style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)' }}>
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-1" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDT Mining Lab</h1>
                <p className="text-gray-500 text-sm">Premium Cloud Mining Platform</p>
              </div>

              {/* Login Card */}
              <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Login</h2>
                  <p className="text-gray-500 text-sm mt-1">Connect your wallet to continue</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-800/80 rounded-2xl p-1.5 mb-6">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                      authMode === 'login' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    style={authMode === 'login' ? { background: 'linear-gradient(to right, #6A11CB, #2575FC)' } : {}}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                      authMode === 'register' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    style={authMode === 'register' ? { background: 'linear-gradient(to right, #00C853, #00E676)' } : {}}
                  >
                    Create Account
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-5">
                  {/* Wallet Address */}
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Wallet Address</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        placeholder="0x..."
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        className="bg-slate-800/80 border-white/10 text-white placeholder:text-gray-600 h-14 pl-12 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">6 Digit PIN Code</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        type={showPinVisibility ? "text" : "password"}
                        maxLength={6}
                        placeholder="••••••"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        className="bg-slate-800/80 border-white/10 text-white placeholder:text-gray-600 h-14 pl-12 pr-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPinVisibility(!showPinVisibility)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400"
                      >
                        {showPinVisibility ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Referral Code (Register Only) */}
                  {authMode === 'register' && (
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Referral Code (Optional)</label>
                      <Input
                        placeholder="Enter referral code"
                        value={referralInput}
                        onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                        className="bg-slate-800/80 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-xl"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 text-white font-bold rounded-xl shadow-xl transition-all"
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
                <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span>BEP20 Network</span>
                  <span className="text-gray-700">|</span>
                  <span>Powered by BNB Smart Chain</span>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 bg-slate-950/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">© 2025 USDT Mining Lab. All rights reserved.</p>
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
              Log Out
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
              { id: 'support', icon: Shield, label: 'Support' },
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
