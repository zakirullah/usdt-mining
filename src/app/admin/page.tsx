'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Lock, Eye, EyeOff, RefreshCw, 
  ArrowDownRight, ArrowUpRight, Users, Bell,
  CheckCircle, AlertCircle, LogOut, Shield,
  DollarSign, TrendingUp, Clock, Settings
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminUser {
  id: string;
  email: string;
  walletAddress: string;
  role: string;
}

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

interface Deposit {
  id: string;
  amount: number;
  txHash: string;
  status: string;
  createdAt: string;
  user?: {
    email: string;
    walletAddress: string;
  };
}

interface Withdrawal {
  id: string;
  amount: number;
  walletAddress: string;
  status: string;
  createdAt: string;
  user?: {
    email: string;
    walletAddress: string;
  };
}

export default function AdminPanel() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [walletInput, setWalletInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data state
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0
  });
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Check existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Clear messages
  useEffect(() => {
    if (error) setTimeout(() => setError(null), 5000);
    if (success) setTimeout(() => setSuccess(null), 5000);
  }, [error, success]);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === 'admin') {
          setAdmin(data.user);
          setIsAuthenticated(true);
          fetchAdminData();
        }
      }
    } catch {}
  };

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
      
      if (data.user?.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }

      setAdmin(data.user);
      setIsAuthenticated(true);
      setSuccess('Welcome Admin!');
      fetchAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setAdmin(null);
    setWalletInput('');
    setPinInput('');
    setSuccess('Logged out successfully');
  };

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin?type=stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // Fetch pending deposits
      const depositsRes = await fetch('/api/admin?type=deposits&status=pending');
      if (depositsRes.ok) {
        const data = await depositsRes.json();
        setDeposits(data.deposits || []);
      }

      // Fetch pending withdrawals
      const withdrawalsRes = await fetch('/api/admin?type=withdrawals&status=pending');
      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setWithdrawals(data.withdrawals || []);
      }

      // Fetch users
      const usersRes = await fetch('/api/admin?type=users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Action failed');
      
      setSuccess(`${action} completed successfully!`);
      fetchAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      setError('Title and message are required');
      return;
    }

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: broadcastTitle, 
          message: broadcastMessage, 
          type: 'info' 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Broadcast failed');
      
      setSuccess('Broadcast sent to all users!');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Broadcast failed');
    }
  };

  // ==================== LOGIN PAGE ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-2xl mb-4" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
              <Shield className="w-10 h-10 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">USDT Mining Lab Administration</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Wallet Address */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Admin Wallet Address</label>
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
                    type={showPin ? "text" : "password"}
                    maxLength={6}
                    placeholder="••••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="bg-slate-800/80 border-white/10 text-white placeholder:text-gray-600 h-14 pl-12 pr-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 text-white font-bold rounded-xl shadow-xl transition-all"
                style={{ background: 'linear-gradient(to right, #FFD700, #FFA500)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </span>
                ) : 'Access Admin Panel'}
              </motion.button>
            </form>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <a href="/" className="text-gray-500 hover:text-cyan-400 text-sm">
                ← Back to Main Site
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==================== ADMIN DASHBOARD ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
              <Shield className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">Admin Panel</span>
              <p className="text-gray-500 text-xs">USDT Mining Lab</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-gray-400 text-sm">{admin?.email}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 border border-red-500/40 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'deposits', label: 'Deposits', icon: ArrowDownRight },
            { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'broadcast', label: 'Broadcast', icon: Bell },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900' 
                  : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                <div className="text-gray-500 text-sm">Total Users</div>
              </div>
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-400">${formatNumber(stats.totalDeposits, 0)}</div>
                <div className="text-gray-500 text-sm">Total Deposits</div>
              </div>
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-400">${formatNumber(stats.totalWithdrawals, 0)}</div>
                <div className="text-gray-500 text-sm">Total Withdrawals</div>
              </div>
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-400">{stats.pendingDeposits}</div>
                <div className="text-gray-500 text-sm">Pending Deposits</div>
              </div>
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-400">{stats.pendingWithdrawals}</div>
                <div className="text-gray-500 text-sm">Pending Withdrawals</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Pending Deposits */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                  Recent Pending Deposits
                </h3>
                {deposits.length > 0 ? (
                  <div className="space-y-3">
                    {deposits.slice(0, 5).map(deposit => (
                      <div key={deposit.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-amber-500/30">
                        <div>
                          <div className="text-white font-medium">${formatNumber(deposit.amount)} USDT</div>
                          <div className="text-gray-500 text-xs font-mono">{deposit.user?.walletAddress?.slice(0, 10)}...</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction('approveDeposit', deposit.id)}
                            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction('rejectDeposit', deposit.id)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No pending deposits</p>
                )}
              </div>

              {/* Recent Pending Withdrawals */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                  Recent Pending Withdrawals
                </h3>
                {withdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {withdrawals.slice(0, 5).map(withdrawal => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-amber-500/30">
                        <div>
                          <div className="text-white font-medium">${formatNumber(withdrawal.amount)} USDT</div>
                          <div className="text-gray-500 text-xs font-mono">To: {withdrawal.walletAddress?.slice(0, 10)}...</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction('approveWithdrawal', withdrawal.id)}
                            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction('rejectWithdrawal', withdrawal.id)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No pending withdrawals</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ArrowDownRight className="w-6 h-6 text-emerald-400" />
              All Pending Deposits
            </h3>
            {deposits.length > 0 ? (
              <div className="space-y-4">
                {deposits.map(deposit => (
                  <div key={deposit.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-amber-500/30 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-2xl font-bold text-white">${formatNumber(deposit.amount)} USDT</span>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">Pending</span>
                      </div>
                      <div className="text-gray-500 text-sm space-y-1">
                        <div>User: <span className="text-gray-300 font-mono">{deposit.user?.walletAddress}</span></div>
                        <div>TX Hash: <span className="text-gray-300 font-mono">{deposit.txHash?.slice(0, 20)}...</span></div>
                        <div>Date: {new Date(deposit.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction('approveDeposit', deposit.id)}
                        className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 border border-emerald-500/40 font-medium transition-all"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleAction('rejectDeposit', deposit.id)}
                        className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 border border-red-500/40 font-medium transition-all"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No pending deposits</p>
            )}
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ArrowUpRight className="w-6 h-6 text-red-400" />
              All Pending Withdrawals
            </h3>
            {withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map(withdrawal => (
                  <div key={withdrawal.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-amber-500/30 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-2xl font-bold text-white">${formatNumber(withdrawal.amount)} USDT</span>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">Pending</span>
                      </div>
                      <div className="text-gray-500 text-sm space-y-1">
                        <div>User: <span className="text-gray-300 font-mono">{withdrawal.user?.walletAddress}</span></div>
                        <div>To Wallet: <span className="text-gray-300 font-mono">{withdrawal.walletAddress}</span></div>
                        <div>Date: {new Date(withdrawal.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction('approveWithdrawal', withdrawal.id)}
                        className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 border border-emerald-500/40 font-medium transition-all"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleAction('rejectWithdrawal', withdrawal.id)}
                        className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 border border-red-500/40 font-medium transition-all"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No pending withdrawals</p>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              All Users ({users.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Wallet</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Balance</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Profit</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-white">{user.email}</td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-sm">{user.walletAddress?.slice(0, 10)}...{user.walletAddress?.slice(-6)}</td>
                      <td className="py-3 px-4 text-emerald-400">${formatNumber(user.balance)}</td>
                      <td className="py-3 px-4 text-cyan-400">${formatNumber(user.totalProfit)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-400" />
              Send Broadcast Message
            </h3>
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Broadcast Title</label>
                <Input
                  placeholder="Enter title..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-xl"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Message Content</label>
                <textarea
                  placeholder="Enter your message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
              <button
                onClick={handleBroadcast}
                disabled={!broadcastTitle || !broadcastMessage}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Send to All Users
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-xs">© 2025 USDT Mining Lab - Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}
