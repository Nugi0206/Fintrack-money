import React, { Component, ErrorInfo, useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut 
} from 'firebase/auth';
import { 
  Home, 
  BarChart3, 
  Wallet, 
  User, 
  Plus, 
  ArrowUpRight, 
  X, 
  Trash2, 
  LogOut,
  Moon,
  RefreshCw,
  Edit2,
  LogIn,
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { db, auth } from '../firebase';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = `Database Error: ${parsed.error}`;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0d0e14] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Oops!</h2>
          <p className="text-gray-400 mb-8 max-w-xs mx-auto">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold active:scale-95 transition-all cursor-pointer"
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- UI Components ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1a1b23] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/70 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({ name: 'User', photo: '' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    wallet: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [profileForm, setProfileForm] = useState({ name: '', photo: '' });
  const [walletForm, setWalletForm] = useState({ name: '', balance: 0 });

  // --- Connection Test ---
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // --- Authentication ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'users', user.uid, 'profile', 'settings');
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setProfileForm(data as any);
      } else {
        setDoc(profileRef, { name: user.displayName || 'User', photo: user.photoURL || '' })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, profileRef.path));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, profileRef.path));

    const walletsCol = collection(db, 'users', user.uid, 'wallets');
    const unsubWallets = onSnapshot(walletsCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWallets(data);
      if (data.length === 0) {
        addDoc(walletsCol, { name: 'BCA', balance: 0 })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, walletsCol.path));
        addDoc(walletsCol, { name: 'SEABANK', balance: 0 })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, walletsCol.path));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, walletsCol.path));

    const catsCol = collection(db, 'users', user.uid, 'categories');
    const unsubCats = onSnapshot(catsCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategories(data);
      if (data.length === 0) {
        ['Makan', 'Transport', 'Belanja', 'Lainnya'].forEach(c => {
          addDoc(catsCol, { name: c })
            .catch(e => handleFirestoreError(e, OperationType.WRITE, catsCol.path));
        });
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, catsCol.path));

    const transCol = collection(db, 'users', user.uid, 'transactions');
    const unsubTrans = onSnapshot(transCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, (e) => handleFirestoreError(e, OperationType.GET, transCol.path));

    return () => {
      unsubProfile();
      unsubWallets();
      unsubCats();
      unsubTrans();
    };
  }, [user]);

  // --- Handlers ---
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const data = { ...formData, amount: parseFloat(formData.amount), timestamp: Date.now() };
    const path = editingTransaction 
      ? `users/${user.uid}/transactions/${editingTransaction.id}`
      : `users/${user.uid}/transactions`;
    
    try {
      if (editingTransaction) {
        await updateDoc(doc(db, 'users', user.uid, 'transactions', editingTransaction.id), data);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      setFormData({ amount: '', type: 'expense', category: '', wallet: '', note: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      handleFirestoreError(error, editingTransaction ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const data = { ...walletForm, balance: parseFloat(walletForm.balance as any) };
    const path = editingWallet 
      ? `users/${user.uid}/wallets/${editingWallet.id}`
      : `users/${user.uid}/wallets`;

    try {
      if (editingWallet) {
        await updateDoc(doc(db, 'users', user.uid, 'wallets', editingWallet.id), data);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'wallets'), data);
      }
      setIsWalletModalOpen(false);
      setEditingWallet(null);
      setWalletForm({ name: '', balance: 0 });
    } catch (error) {
      handleFirestoreError(error, editingWallet ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const path = `users/${user.uid}/profile/settings`;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'profile', 'settings'), profileForm);
      setIsProfileModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Tanggal", "Tipe", "Kategori", "Dompet", "Jumlah", "Keterangan"];
    const rows = transactions.map(t => [
      t.date,
      t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
      t.category,
      t.wallet,
      t.amount,
      t.note || ""
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return transactions.reduce((acc, t) => {
      const tDate = new Date(t.date);
      const amt = t.amount;
      const isThisMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

      if (t.type === 'expense') {
        if (isThisMonth) acc.monthExpense += amt;
        if (t.date === todayStr) acc.todayExpense += amt;
        if (tDate >= sevenDaysAgo) acc.sevenDayExpense += amt;
      } else {
        if (isThisMonth) acc.monthIncome += amt;
      }
      return acc;
    }, { monthExpense: 0, monthIncome: 0, todayExpense: 0, sevenDayExpense: 0 });
  }, [transactions]);

  const getWalletBalance = (walletName: string, initialBalance = 0) => {
    const trans = transactions.filter(t => t.wallet === walletName);
    return trans.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, initialBalance);
  };

  // --- Login Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d0e14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
          <Wallet size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">FinTrack.</h1>
        <p className="text-gray-500 mb-12 max-w-[250px]">Kelola keuangan Anda dengan mudah dan aman di cloud.</p>
        
        <button 
          onClick={handleLogin}
          disabled={authLoading}
          className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50 cursor-pointer"
        >
          {authLoading ? <RefreshCw size={20} className="animate-spin" /> : <LogIn size={20} />}
          Masuk Sekarang
        </button>
      </div>
    );
  }

  // --- Main Views ---
  const renderHome = () => (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-center px-6 pt-6">
        <div>
          <p className="text-gray-500 text-sm font-medium">Halo,</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h1>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-[#1f2029] rounded-full flex items-center justify-center border border-white/5">
            <Moon size={18} className="text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      </div>

      {/* DASHBOARD SUMMARY */}
      <div className="px-6 grid grid-cols-1 gap-4">
        {/* Main Expense Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#5356ff] to-[#3a3cbd] rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex items-center gap-2 mb-2">
             <TrendingDown size={16} className="text-blue-200" />
             <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80">Pengeluaran Bulan Ini</p>
          </div>
          <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">{formatIDR(totals.monthExpense)}</h2>
          
          {/* Inline Income Summary */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
             <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                   <p className="text-blue-100/60 text-[9px] font-bold uppercase tracking-wider">Total Pemasukan</p>
                </div>
                <p className="text-white font-bold text-lg">{formatIDR(totals.monthIncome)}</p>
             </div>
             <div className="h-8 w-[1px] bg-white/10"></div>
             <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                   <p className="text-blue-100/60 text-[9px] font-bold uppercase tracking-wider">Arus Kas</p>
                </div>
                <p className="text-white font-bold text-lg">{formatIDR(totals.monthIncome - totals.monthExpense)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 px-6">
        <div className="bg-[#1a1b23] p-5 rounded-[2rem] border border-white/5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 text-white/5 group-hover:text-white/10 transition-colors">
            <ArrowUpRight size={64} />
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Hari Ini</p>
          <h3 className="text-xl font-black text-pink-500">{formatIDR(totals.todayExpense)}</h3>
        </div>
        <div className="bg-[#1a1b23] p-5 rounded-[2rem] border border-white/5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 text-white/5 group-hover:text-white/10 transition-colors">
             <TrendingDown size={64} />
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Pemasukan Bulan Ini</p>
          <h3 className="text-xl font-black text-emerald-400">{formatIDR(totals.monthIncome)}</h3>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Transaksi Terbaru</h4>
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Lihat Semua</span>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="py-12 text-center bg-[#1a1b23] rounded-[2rem] border border-dashed border-white/5">
              <p className="text-gray-600 text-sm italic font-medium">Belum ada transaksi</p>
            </div>
          ) : (
            transactions.slice(0, 10).map(t => (
              <div key={t.id} className="bg-[#1a1b23] p-4 rounded-3xl flex items-center gap-4 border border-white/5 active:scale-[0.98] transition-transform cursor-pointer" onClick={() => { setEditingTransaction(t); setFormData(t); setIsModalOpen(true); }}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'expense' ? 'bg-[#2a2b36] text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {t.type === 'expense' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-white font-bold leading-tight truncate text-sm">{t.note || t.category}</h5>
                  <p className="text-gray-500 text-[9px] font-black uppercase mt-0.5 tracking-widest opacity-60">{t.wallet}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${t.type === 'expense' ? 'text-pink-500' : 'text-emerald-400'}`}>
                    {t.type === 'expense' ? '-' : '+'} {formatIDR(t.amount)}
                  </p>
                  <p className="text-[9px] text-gray-700 mt-1 font-black uppercase tracking-tighter">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0e14] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-md mx-auto relative min-h-screen border-x border-white/[0.02]">
        
        {/* Main Content Areas */}
        {activeTab === 'home' && renderHome()}
        {activeTab === 'stats' && (
          <div className="p-6 pb-32">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">Laporan</h1>
              <button onClick={exportToCSV} className="flex items-center gap-2 bg-blue-600/10 text-blue-400 px-4 py-2 rounded-2xl border border-blue-600/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer">
                <Download size={14} /> Ekspor CSV
              </button>
            </div>
            
            <div className="bg-[#1a1b23] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Pengeluaran</p>
                  <h2 className="text-xl font-black text-pink-500">{formatIDR(totals.monthExpense)}</h2>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Pemasukan</p>
                  <h2 className="text-xl font-black text-emerald-400">{formatIDR(totals.monthIncome)}</h2>
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Berdasarkan Kategori</p>
                {categories.map(cat => {
                  const catTotal = transactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                  const percentage = totals.monthExpense > 0 ? (catTotal / totals.monthExpense) * 100 : 0;
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-300 font-bold">{cat.name}</span>
                        <span className="text-gray-500 font-black">{formatIDR(catTotal)}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'wallet' && (
           <div className="p-6 pb-32 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">Dompet</h1>
              <button onClick={() => { setEditingWallet(null); setWalletForm({ name: '', balance: 0 }); setIsWalletModalOpen(true); }} className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all cursor-pointer">
                <Plus size={20} />
              </button>
            </div>
            <div className="grid gap-4">
              {wallets.map(w => (
                <div key={w.id} onClick={() => { setEditingWallet(w); setWalletForm({ name: w.name, balance: w.balance || 0 }); setIsWalletModalOpen(true); }} className="bg-[#1a1b23] p-6 rounded-[2rem] border border-white/5 flex justify-between items-center group relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20"></div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-none">{w.name}</h3>
                    <p className="text-blue-400 font-black text-xl mt-2 tracking-tight">{formatIDR(getWalletBalance(w.name, w.balance || 0))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit2 size={16} className="text-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'me' && (
          <div className="p-6 pb-32">
            <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">Setelan</h1>
            <div className="bg-[#1a1b23] rounded-[2.5rem] p-8 border border-white/5 text-center relative overflow-hidden mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 p-1 shadow-2xl relative">
                <div className="w-full h-full rounded-full bg-[#1a1b23] flex items-center justify-center overflow-hidden">
                  {profile.photo ? <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" /> : <User size={40} className="text-white/20" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{profile.name}</h2>
              <button onClick={() => setIsProfileModalOpen(true)} className="mt-4 bg-white/5 text-white/70 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 cursor-pointer">Ubah Profil</button>
            </div>
            <button onClick={() => signOut(auth)} className="w-full bg-red-500/5 p-5 rounded-[2rem] border border-red-500/10 flex items-center gap-4 active:bg-red-500/10 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500"><LogOut size={22} /></div>
              <p className="text-red-500 font-bold">Keluar Akun</p>
            </button>
          </div>
        )}

        {/* Tab Bar Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-6 pt-2 z-50">
          <nav className="relative bg-[#1a1b23]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] h-20 flex items-center justify-around px-2 shadow-2xl">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'home' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <Home size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase mt-1">Home</span>
            </button>
            <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'stats' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <BarChart3 size={20} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase mt-1">Stats</span>
            </button>
            <div className="relative -top-10">
              <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="w-16 h-16 bg-gradient-to-br from-[#8083ff] to-[#5356ff] rounded-[2rem] flex items-center justify-center shadow-[0_15px_30px_rgba(83,86,255,0.4)] active:scale-90 transition-all border-4 border-[#0d0e14] text-white cursor-pointer">
                <Plus size={32} strokeWidth={3} />
              </button>
            </div>
            <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'wallet' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <Wallet size={20} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase mt-1">Wallet</span>
            </button>
            <button onClick={() => setActiveTab('me')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'me' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <User size={20} strokeWidth={activeTab === 'me' ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase mt-1">Me</span>
            </button>
          </nav>
        </div>

        {/* Modals Section */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? 'Detail Transaksi' : 'Transaksi Baru'}>
          <form onSubmit={handleSaveTransaction} className="space-y-5 pb-4">
            <div className="flex gap-2 p-1 bg-[#0d0e14] rounded-2xl border border-white/5">
              <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${formData.type === 'expense' ? 'bg-[#1a1b23] text-blue-400 shadow-lg' : 'text-gray-600'}`}>Pengeluaran</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${formData.type === 'income' ? 'bg-[#1a1b23] text-emerald-400 shadow-lg' : 'text-gray-600'}`}>Pemasukan</button>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Nominal (Rp)</label>
              <input autoFocus type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0" className="w-full bg-[#0d0e14] border border-white/5 rounded-[2rem] p-6 text-3xl font-black text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Kategori</label>
                <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white appearance-none">
                  <option value="">Pilih</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Metode</label>
                <select required value={formData.wallet} onChange={(e) => setFormData({...formData, wallet: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white appearance-none">
                  <option value="">Pilih</option>
                  {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Catatan</label>
              <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder="Opsional" className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white placeholder:text-gray-800" />
            </div>
            <div className="flex gap-4 pt-4">
              {editingTransaction && (
                <button 
                  type="button" 
                  onClick={async () => { 
                    if(window.confirm('Hapus transaksi?')) { 
                      const path = `users/${user.uid}/transactions/${editingTransaction.id}`;
                      try {
                        await deleteDoc(doc(db, 'users', user.uid, 'transactions', editingTransaction.id)); 
                        setIsModalOpen(false); 
                      } catch (error) {
                        handleFirestoreError(error, OperationType.DELETE, path);
                      }
                    }
                  }} 
                  className="p-4 bg-red-500/10 text-red-500 rounded-2xl active:scale-90 transition-all cursor-pointer"
                >
                  <Trash2 size={24} />
                </button>
              )}
              <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer">{editingTransaction ? 'Simpan' : 'Tambah'}</button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} title={editingWallet ? 'Edit Dompet' : 'Dompet Baru'}>
          <form onSubmit={handleSaveWallet} className="space-y-5 pb-4">
            <div className="space-y-1"><label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Nama Dompet</label><input type="text" required value={walletForm.name} onChange={(e) => setWalletForm({...walletForm, name: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold" /></div>
            <div className="space-y-1"><label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Saldo Manual (Rp)</label><input type="number" required value={walletForm.balance} onChange={(e) => setWalletForm({...walletForm, balance: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold" /></div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer">{editingWallet ? 'Simpan' : 'Buat'}</button>
          </form>
        </Modal>

        <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Edit Profil">
          <form onSubmit={handleUpdateProfile} className="space-y-6 pb-4">
            <div className="space-y-1"><label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Nama</label><input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold" /></div>
            <div className="space-y-1"><label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Foto URL</label><input type="text" value={profileForm.photo} onChange={(e) => setProfileForm({...profileForm, photo: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold text-xs" /></div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer">Simpan</button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
