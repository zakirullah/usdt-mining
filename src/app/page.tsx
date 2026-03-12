'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Lock, Eye, EyeOff, RefreshCw, Globe,
  ArrowDownRight, ArrowUpRight, Crown, Activity, Cpu, Gift,
  LogOut, Clock, Home, Server, Copy, Check, X, AlertCircle, CheckCircle,
  Menu, CreditCard, Settings, ChevronRight, Timer, Calculator, Percent, DollarSign,
  Bell, ChevronDown, ChevronUp, HelpCircle, MessageCircle
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
  totalDeposit: number;
  totalWithdraw: number;
  referralEarnings: number;
  referralCode: string;
  role?: string;
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
  const [liveMiningPower, setLiveMiningPower] = useState(128.45);

  // UI State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('starter');
  const [calculatorAmount, setCalculatorAmount] = useState(100);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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

  // Live Mining Power Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMiningPower(prev => {
        const change = (Math.random() - 0.5) * 2;
        return Math.max(120, Math.min(135, prev + change));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // FAQ Data
  const faqData = [
    { question: "How does USDT mining work?", answer: "USDT mining works through our cloud mining infrastructure. When you deposit USDT, you purchase mining power that generates daily returns of 4-4.5% based on your plan." },
    { question: "What is the minimum deposit?", answer: "The minimum deposit to start mining is 10 USDT for the Starter Plan. The Pro Plan requires a minimum of 100 USDT." },
    { question: "When can I withdraw profits?", answer: "You can withdraw your profits at any time. Withdrawals are processed within 24 hours and sent directly to your BEP20 wallet." },
    { question: "Is the platform secure?", answer: "Yes, we use 256-bit SSL encryption, secure smart contracts, and automated payout systems to ensure your funds are always safe." }
  ];

  // Recent Withdrawals Mock Data
  const recentWithdrawals = [
    { user: 'Aisha', amount: 44, time: 'Just now' },
    { user: 'Ahmed', amount: 59, time: 'Just now' },
    { user: 'Ali', amount: 120, time: '2 min ago' },
    { user: 'Omar', amount: 85, time: '5 min ago' },
    { user: 'Fatima', amount: 200, time: '8 min ago' },
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

  // ==================== DASHBOARD ====================
  if (showDashboard && user) {
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm font-mono">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
              </div>
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
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={activeTab === item.id ? { background: 'linear-gradient(to right, rgba(0, 245, 255, 0.2), rgba(123, 47, 247, 0.2))' } : {}}
                >
                  <item.icon className="w-5 h-5" style={{ color: activeTab === item.id ? '#00F5FF' : undefined }} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                  <p className="text-gray-400 font-mono text-sm">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</p>
                </div>
              </div>

              {/* Account Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Balance', value: `$${formatNumber(user.balance)}`, sub: 'Available to withdraw', color: '#00F5FF' },
                  { label: 'Deposits', value: `$${formatNumber(user.totalDeposit || 0)}`, sub: `${userStats?.depositCount || 0} transactions`, color: '#10B981' },
                  { label: 'Withdrawals', value: `$${formatNumber(user.totalWithdraw || 0)}`, sub: `${userStats?.withdrawalCount || 0} transactions`, color: '#8B5CF6' },
                  { label: 'Total Profit', value: `$${formatNumber(user.totalProfit)}`, sub: 'From mining', color: '#F59E0B' },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
                  >
                    <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                    <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
                    <p className="text-gray-500 text-xs mt-1">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Mining Status */}
              {miningData && miningData.status === 'active' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Mining Active</h3>
                        <p className="text-gray-400 text-sm">Investment: ${formatNumber(miningData.investment)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-lg">+${formatNumber(miningData.dailyProfit)}/day</p>
                      <p className="text-gray-500 text-xs">Total Earned: ${formatNumber(miningData.totalEarned)}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" style={{ width: '65%' }} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                      <Server className="w-7 h-7 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">No Active Mining Package</h3>
                      <p className="text-gray-400 text-sm">Deposit USDT to activate mining and earn 4% daily profit</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="px-6 py-3 rounded-xl font-semibold text-white"
                      style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}
                    >
                      Start Mining
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3 justify-center">
                {[
                  { icon: ArrowDownRight, label: 'Deposit', tab: 'deposit', color: '#10B981' },
                  { icon: ArrowUpRight, label: 'Withdraw', tab: 'withdraw', color: '#EF4444' },
                  { icon: Clock, label: 'History', tab: 'transactions', color: '#8B5CF6' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setActiveTab(action.tab)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all"
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Mining Profit Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Mining Profit Calculator</h3>
                </div>

                {/* Plan Selection */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setSelectedPlan('starter')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      selectedPlan === 'starter' ? 'text-white' : 'text-gray-400 bg-slate-700/50'
                    }`}
                    style={selectedPlan === 'starter' ? { background: 'linear-gradient(to right, #10B981, #059669)' } : {}}
                  >
                    Starter (4%)
                  </button>
                  <button
                    onClick={() => setSelectedPlan('pro')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      selectedPlan === 'pro' ? 'text-white' : 'text-gray-400 bg-slate-700/50'
                    }`}
                    style={selectedPlan === 'pro' ? { background: 'linear-gradient(to right, #8B5CF6, #6D28D9)' } : {}}
                  >
                    Pro (4.5%)
                  </button>
                </div>

                {/* Investment Input */}
                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">Investment Amount (USDT)</label>
                  <Input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="bg-slate-700/50 border-white/10 text-white h-14 text-xl"
                  />
                </div>

                {/* Profit Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Per Second', value: (calculatorAmount * (selectedPlan === 'pro' ? 0.045 : 0.04) / 86400).toFixed(6), color: '#00F5FF' },
                    { label: 'Per Minute', value: (calculatorAmount * (selectedPlan === 'pro' ? 0.045 : 0.04) / 1440).toFixed(4), color: '#8B5CF6' },
                    { label: 'Per Hour', value: (calculatorAmount * (selectedPlan === 'pro' ? 0.045 : 0.04) / 24).toFixed(4), color: '#F59E0B' },
                    { label: 'Per Day', value: (calculatorAmount * (selectedPlan === 'pro' ? 0.045 : 0.04)).toFixed(2), color: '#10B981' },
                    { label: 'Per Week', value: (calculatorAmount * (selectedPlan === 'pro' ? 0.045 : 0.04) * 7).toFixed(2), color: '#EC4899' },
                    { label: 'Per Month', value: (calculatorAmount * (selectedPlan === 'pro' ? 0.045 : 0.04) * 30).toFixed(2), color: '#F59E0B' },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-700/30 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">{item.label}</p>
                      <p className="font-bold" style={{ color: item.color }}>{item.value} USDT</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-400">Daily Profit: <span className="text-white font-semibold">{selectedPlan === 'pro' ? '4.5%' : '4%'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Duration: <span className="text-white font-semibold">30 Days</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-400">Total Return: <span className="text-white font-semibold">120%</span></span>
                  </div>
                </div>
              </motion.div>

              {/* Referral Program */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Referral Program</h3>
                    <p className="text-gray-400 text-sm">Earn 7% commission on every deposit</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Your Referral Code</label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={user.referralCode}
                        className="bg-slate-700/50 border-white/10 text-white font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(user.referralCode)}
                        className="px-4 bg-slate-700 rounded-xl text-gray-300 hover:text-white transition-all"
                      >
                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Referral Link</label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`https://usdtmininglab.com/ref=${user.referralCode}`}
                        className="bg-slate-700/50 border-white/10 text-white text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(`https://usdtmininglab.com/ref=${user.referralCode}`)}
                        className="px-4 bg-slate-700 rounded-xl text-gray-300 hover:text-white transition-all"
                      >
                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Direct Referral Commission</p>
                      <p className="text-gray-500 text-xs">Earn from every deposit your referrals make</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">7%</p>
                  </div>
                </div>
              </motion.div>

              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx, i) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.type === 'deposit' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                          }`}>
                            {tx.type === 'deposit' ? (
                              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{tx.type}</p>
                            <p className="text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}${formatNumber(tx.amount)}
                          </p>
                          <p className={`text-xs ${tx.status === 'approved' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No transactions yet</p>
                  </div>
                )}
              </motion.div>
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 px-4 py-3">
          <div className="flex justify-around">
            {[
              { id: 'dashboard', icon: Home },
              { id: 'deposit', icon: ArrowDownRight },
              { id: 'plans', icon: Zap },
              { id: 'withdraw', icon: ArrowUpRight },
              { id: 'referral', icon: Gift },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2 rounded-xl ${activeTab === item.id ? 'text-cyan-400' : 'text-gray-500'}`}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // ==================== LANDING PAGE (LOGIN/REGISTER) ====================
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

            {/* Live Mining Power */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-600 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-cyan-400 font-semibold text-sm">LIVE MINING POWER</p>
                    <p className="text-2xl font-bold text-white">{liveMiningPower.toFixed(2)} TH/s</p>
                    <p className="text-gray-500 text-xs">Global Hashrate • Real-time Network Speed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mx-auto mb-1" />
                  <span className="text-emerald-400 text-xs font-medium">LIVE</span>
                </div>
              </div>
            </motion.div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Active Miners', value: platformStats?.activeMining || 35847, color: '#3B82F6', icon: Users },
                { label: 'Total Deposits', value: `$${formatNumber(platformStats?.totalDeposits || 4589620, 0)}`, color: '#10B981', icon: ArrowDownRight },
                { label: 'Total Withdrawals', value: `$${formatNumber(platformStats?.totalWithdrawals || 2824530, 0)}`, color: '#8B5CF6', icon: ArrowUpRight },
                { label: 'Online Now', value: platformStats?.onlineUsers || 1847, color: '#F97316', icon: Activity },
                { label: 'Profit Paid', value: `$${formatNumber(1654280, 0)}`, color: '#F59E0B', icon: DollarSign },
                { label: 'Referral Bonus', value: '7%', color: '#EC4899', icon: Gift },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4"
                >
                  <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                  <p className="text-lg font-bold text-white">
                    {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} /> : stat.value}
                  </p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Visitors Today */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{(platformStats?.websiteVisitors || 8452).toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">Visitors Today</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </motion.div>

            {/* Today Statistics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Today Deposits', value: '$42,580', color: '#10B981', icon: ArrowDownRight },
                { label: 'Today Withdrawals', value: '$18,200', color: '#EF4444', icon: ArrowUpRight },
                { label: 'Registered Today', value: 134, color: '#3B82F6', icon: Users },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4"
                >
                  <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Withdrawals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-white font-semibold">Recent Withdrawals</h3>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-xs">Live</span>
                </div>
              </div>
              <div className="space-y-2">
                {recentWithdrawals.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-400 text-sm">{item.user}</span>
                    <span className="text-emerald-400 font-medium">+{item.amount} USDT</span>
                    <span className="text-gray-500 text-xs">{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Referral Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 mb-6"
            >
              <h3 className="text-white font-semibold mb-1">Earn 7% Referral Commission</h3>
              <p className="text-gray-400 text-sm mb-3">Invite friends and earn 7% commission on every deposit they make. No limits on earnings!</p>
              <button
                onClick={() => setAuthMode('register')}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-semibold text-sm"
              >
                Get Started
              </button>
            </motion.div>

            {/* Why Trust Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h3 className="text-white font-semibold mb-4">Why Trust Us</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Shield, label: 'Secure', desc: '256-bit SSL encryption', color: '#10B981' },
                  { icon: Settings, label: 'Smart Contract', desc: 'Automated payouts', color: '#8B5CF6' },
                  { icon: Clock, label: '24/7 Support', desc: 'Always here to help', color: '#3B82F6' },
                  { icon: TrendingUp, label: 'Daily Profits', desc: '4-4.5% guaranteed', color: '#F59E0B' },
                ].map((item, i) => (
                  <div key={item.label} className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                    <item.icon className="w-6 h-6 mx-auto mb-2" style={{ color: item.color }} />
                    <p className="text-white font-semibold text-sm">{item.label}</p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            >
              <h3 className="text-white font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {faqData.map((faq, i) => (
                  <div key={i} className="border-b border-white/5 last:border-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <span className="text-gray-300 text-sm">{faq.question}</span>
                      {expandedFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-500 text-sm px-3 pb-3">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
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
      <footer className="border-t border-white/5 py-8 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)' }}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                </svg>
              </div>
              <div>
                <span className="font-bold" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDT Mining Lab</span>
                <p className="text-gray-500 text-xs">Secure Cloud Mining Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-gray-500 text-xs">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Support</span>
              <span>Telegram</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />SSL Secured</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-cyan-400" />256-bit Encryption</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-400" />Verified Platform</span>
            </div>
            <p className="text-gray-600 text-xs">© 2026 USDT Mining Lab. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
