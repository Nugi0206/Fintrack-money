import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDocFromServer,
  query,
  where,
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
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
  Download,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  AlertCircle,
  Chrome,
  Mail,
  Lock,
  Camera,
  ArrowLeft,
  Crown,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Copy,
  Check,
  Upload
} from 'lucide-react';
import { auth, db, APP_ID } from './lib/firebase';

// --- Translations ---
const TRANSLATIONS: any = {
  en: {
    appName: "FinTrack.",
    tagline: "Manage your finances easily and securely in the cloud.",
    signInGoogle: "Sign in with Gmail / Google",
    signInEmail: "Sign in with Email",
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    email: "Email Address",
    password: "Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    noAccount: "Don't have an account? Sign Up",
    hasAccount: "Already have an account? Sign In",
    passwordTooShort: "Password must be at least 6 characters.",
    emailAlreadyInUse: "This email is already registered. Please sign in instead.",
    invalidEmail: "Please enter a valid email address.",
    authNotAllowed: "Email login is not enabled. Please contact the administrator or enable it in Firebase Console.",
    authGeneralError: "Authentication failed. Please check your details and try again.",
    hello: "Hello,",
    welcomeBackUser: "Welcome back,",
    dailySpendingPlan: "Daily Spending Plan",
    idealDailyBudget: "Ideal Daily Budget",
    monthlyGoal: "Monthly Goal",
    targetSavings: "Target Savings",
    income: "Income",
    expense: "Expense",
    cashFlow: "Cash Flow",
    today: "Today",
    sevenDays: "7 Days",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions yet",
    statistics: "Statistics",
    categoryBreakdown: "Category Breakdown",
    monthlyOverview: "Monthly Overview",
    totalExpense: "Total Expense",
    totalIncome: "Total Income",
    myWallets: "My Wallets",
    totalBalance: "Total Balance",
    initialBalance: "Initial Balance",
    newWallet: "New Wallet",
    editWallet: "Edit Wallet",
    walletName: "Wallet Name",
    create: "Create",
    save: "Save",
    settings: "Settings",
    editProfile: "Edit Profile",
    signOut: "Sign Out",
    displayName: "Display Name",
    photoUrl: "Photo URL",
    saveChanges: "Save Changes",
    newTransaction: "New Transaction",
    transactionDetails: "Transaction Details",
    amount: "Amount (Rp)",
    category: "Category",
    wallet: "Wallet",
    note: "Note",
    optional: "Optional",
    add: "Add",
    select: "Select",
    financialPlanning: "Financial Planning",
    smartRecommendation: "Smart Recommendation",
    budgetRecommendation: "Based on your income, we recommend saving at least 20% and following the 50/30/20 rule.",
    monthlyIncome: "Monthly Income (Rp)",
    savingsGoal: "Savings Goal (%)",
    idealDailySpend: "Ideal Daily Spend:",
    monthlySavings: "Monthly Savings:",
    recommendedAllocation: "Recommended Allocation (50/30/20)",
    needs: "Needs (50%)",
    wants: "Wants (30%)",
    savings: "Savings (20%)",
    applyPlan: "Apply Plan",
    back: "Back",
    home: "Home",
    stats: "Stats",
    me: "Me",
    language: "Language",
    profilePreview: "Profile Preview",
    saveGoalHint: "Leave 0 to use actual monthly income from transactions.",
    premiumLicense: "Premium License",
    buyLicense: "Buy License",
    redeem: "Redeem",
    premiumExclusive: "Premium Exclusive",
    unlockPremium: "Unlock premium features to access smart financial planning and daily recommendations for only Rp 35.000.",
    paymentInstructions: "Transfer Rp 35.000 to one of the following accounts (a/n Muhamad Nugi Andri), then click 'Confirm Payment' to unlock automatically:",
    dana: "DANA: 08993358221 (Muhamad Nugi Andri)",
    bankBca: "Bank BCA: 2990609821 (Muhamad Nugi Andri)",
    confirmPayment: "Confirm Payment",
    licenseHint: "Your unique license code will be generated automatically after confirmation.",
    paymentPending: "Payment Pending Approval",
    paymentPendingDesc: "We have received your confirmation. Please wait for the admin to verify your transfer. This usually takes 5-30 minutes.",
    adminDashboard: "Admin Dashboard",
    approve: "Approve",
    reject: "Reject",
    noRequests: "No pending requests",
    paymentMethod: "Payment Method",
    user: "User",
    admin: "Admin",
    previous: "Previous",
    next: "Next",
    allRequests: "All License Requests",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    uploadProof: "Upload Payment Proof",
    proofRequired: "Please upload payment proof",
    alreadyRequested: "You have already submitted a request. Please wait for approval.",
    viewProof: "View Proof",
  },
  id: {
    appName: "FinTrack.",
    tagline: "Kelola keuangan Anda dengan mudah dan aman di cloud.",
    signInGoogle: "Masuk dengan Gmail / Google",
    signInEmail: "Masuk dengan Email",
    welcomeBack: "Selamat Datang Kembali",
    createAccount: "Buat Akun",
    email: "Alamat Email",
    password: "Kata Sandi",
    signIn: "Masuk",
    signUp: "Daftar",
    noAccount: "Belum punya akun? Daftar",
    hasAccount: "Sudah punya akun? Masuk",
    passwordTooShort: "Kata sandi harus minimal 6 karakter.",
    emailAlreadyInUse: "Email ini sudah terdaftar. Silakan masuk saja.",
    invalidEmail: "Silakan masukkan alamat email yang valid.",
    authNotAllowed: "Login email belum diaktifkan. Silakan hubungi administrator atau aktifkan di Firebase Console.",
    authGeneralError: "Autentikasi gagal. Silakan periksa detail Anda dan coba lagi.",
    hello: "Halo,",
    welcomeBackUser: "Selamat datang kembali,",
    dailySpendingPlan: "Rencana Pengeluaran Harian",
    idealDailyBudget: "Anggaran Harian Ideal",
    monthlyGoal: "Target Bulanan",
    targetSavings: "Target Tabungan",
    income: "Pemasukan",
    expense: "Pengeluaran",
    cashFlow: "Arus Kas",
    today: "Hari Ini",
    sevenDays: "7 Hari",
    recentTransactions: "Transaksi Terakhir",
    noTransactions: "Belum ada transaksi",
    statistics: "Statistik",
    categoryBreakdown: "Rincian Kategori",
    monthlyOverview: "Ikhtisar Bulanan",
    totalExpense: "Total Pengeluaran",
    totalIncome: "Total Pemasukan",
    myWallets: "Dompet Saya",
    totalBalance: "Total Saldo",
    initialBalance: "Saldo Awal",
    newWallet: "Dompet Baru",
    editWallet: "Edit Dompet",
    walletName: "Nama Dompet",
    create: "Buat",
    save: "Simpan",
    settings: "Pengaturan",
    editProfile: "Edit Profil",
    signOut: "Keluar",
    displayName: "Nama Tampilan",
    photoUrl: "URL Foto",
    saveChanges: "Simpan Perubahan",
    newTransaction: "Transaksi Baru",
    transactionDetails: "Detail Transaksi",
    amount: "Jumlah (Rp)",
    category: "Kategori",
    wallet: "Dompet",
    note: "Catatan",
    optional: "Opsional",
    add: "Tambah",
    select: "Pilih",
    financialPlanning: "Perencanaan Keuangan",
    smartRecommendation: "Rekomendasi Pintar",
    budgetRecommendation: "Berdasarkan pendapatan Anda, kami menyarankan untuk menabung setidaknya 20% dan mengikuti aturan 50/30/20.",
    monthlyIncome: "Pendapatan Bulanan (Rp)",
    savingsGoal: "Target Tabungan (%)",
    idealDailySpend: "Pengeluaran Harian Ideal:",
    monthlySavings: "Tabungan Bulanan:",
    recommendedAllocation: "Alokasi yang Disarankan (50/30/20)",
    needs: "Kebutuhan (50%)",
    wants: "Keinginan (30%)",
    savings: "Tabungan (20%)",
    applyPlan: "Terapkan Rencana",
    back: "Kembali",
    home: "Beranda",
    stats: "Statistik",
    me: "Saya",
    language: "Bahasa",
    profilePreview: "Pratinjau Profil",
    saveGoalHint: "Isi 0 untuk menggunakan pendapatan bulanan aktual dari transaksi.",
    premiumLicense: "Lisensi Premium",
    buyLicense: "Beli Lisensi",
    redeem: "Tukarkan",
    premiumExclusive: "Eksklusif Premium",
    unlockPremium: "Buka fitur premium untuk mengakses perencanaan keuangan pintar dan rekomendasi harian hanya seharga Rp 35.000.",
    paymentInstructions: "Transfer Rp 35.000 ke salah satu rekening berikut (a/n Muhamad Nugi Andri), lalu klik 'Konfirmasi Pembayaran' untuk membuka otomatis:",
    dana: "DANA: 08993358221 (Muhamad Nugi Andri)",
    bankBca: "Bank BCA: 2990609821 (Muhamad Nugi Andri)",
    confirmPayment: "Konfirmasi Pembayaran",
    licenseHint: "Kode lisensi unik Anda akan dibuat secara otomatis setelah konfirmasi.",
    paymentPending: "Pembayaran Menunggu Persetujuan",
    paymentPendingDesc: "Kami telah menerima konfirmasi Anda. Harap tunggu admin memverifikasi transfer Anda. Ini biasanya memakan waktu 5-30 menit.",
    adminDashboard: "Dashboard Admin",
    approve: "Setujui",
    reject: "Tolak",
    noRequests: "Tidak ada permintaan tertunda",
    paymentMethod: "Metode Pembayaran",
    user: "Pengguna",
    admin: "Admin",
    previous: "Sebelumnya",
    next: "Berikutnya",
    allRequests: "Semua Permintaan Lisensi",
    pending: "Tertunda",
    approved: "Disetujui",
    rejected: "Ditolak",
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
    yearly: "Tahunan",
    uploadProof: "Unggah Bukti Pembayaran",
    proofRequired: "Harap unggah bukti pembayaran",
    alreadyRequested: "Anda sudah mengajukan permintaan. Harap tunggu persetujuan.",
    viewProof: "Lihat Bukti",
  },
  zh: {
    appName: "FinTrack.",
    tagline: "在云端轻松安全地管理您的财务。",
    signInGoogle: "使用 Gmail / Google 登录",
    signInEmail: "使用电子邮件登录",
    welcomeBack: "欢迎回来",
    createAccount: "创建账户",
    email: "电子邮件地址",
    password: "密码",
    signIn: "登录",
    signUp: "注册",
    noAccount: "没有账户？注册",
    hasAccount: "已有账户？登录",
    passwordTooShort: "密码长度必须至少为 6 个字符。",
    hello: "你好，",
    welcomeBackUser: "欢迎回来，",
    dailySpendingPlan: "每日支出计划",
    idealDailyBudget: "理想每日预算",
    monthlyGoal: "每月目标",
    targetSavings: "目标储蓄",
    income: "收入",
    expense: "支出",
    cashFlow: "现金流",
    today: "今天",
    sevenDays: "7天",
    recentTransactions: "最近交易",
    noTransactions: "暂无交易",
    statistics: "统计数据",
    categoryBreakdown: "类别明细",
    monthlyOverview: "每月概览",
    totalExpense: "总支出",
    totalIncome: "总收入",
    myWallets: "我的钱包",
    totalBalance: "总余额",
    initialBalance: "初始余额",
    newWallet: "新钱包",
    editWallet: "编辑钱包",
    walletName: "钱包名称",
    create: "创建",
    save: "保存",
    settings: "设置",
    editProfile: "编辑个人资料",
    signOut: "退出登录",
    displayName: "显示名称",
    photoUrl: "照片 URL",
    saveChanges: "保存更改",
    newTransaction: "新交易",
    transactionDetails: "交易详情",
    amount: "金额 (Rp)",
    category: "类别",
    wallet: "钱包",
    note: "备注",
    optional: "可选",
    add: "添加",
    select: "选择",
    financialPlanning: "财务规划",
    smartRecommendation: "智能推荐",
    budgetRecommendation: "根据您的收入，我们建议至少储蓄 20% 并遵循 50/30/20 原则。",
    monthlyIncome: "月收入 (Rp)",
    savingsGoal: "储蓄目标 (%)",
    idealDailySpend: "理想每日支出：",
    monthlySavings: "每月储蓄：",
    recommendedAllocation: "建议分配 (50/30/20)",
    needs: "需求 (50%)",
    wants: "想要 (30%)",
    savings: "储蓄 (20%)",
    applyPlan: "应用计划",
    back: "返回",
    home: "首页",
    stats: "统计",
    me: "我的",
    language: "语言",
    profilePreview: "个人资料预览",
    saveGoalHint: "留空或填 0 以使用交易中的实际月收入。",
    premiumLicense: "高级版许可证",
    buyLicense: "购买许可证",
    redeem: "兑换",
    premiumExclusive: "高级版专属",
    unlockPremium: "只需 Rp 35.000 即可解锁高级功能，访问智能财务规划和每日建议。",
    paymentInstructions: "转账 Rp 35.000 至以下账户之一（户名：Muhamad Nugi Andri），然后点击“确认付款”即可自动解锁：",
    dana: "DANA: 08993358221 (Muhamad Nugi Andri)",
    bankBca: "Bank BCA: 2990609821 (Muhamad Nugi Andri)",
    confirmPayment: "确认付款",
    licenseHint: "您的唯一许可证代码将在确认后自动生成。",
    daily: "每日",
    weekly: "每周",
    monthly: "每月",
    yearly: "每年",
  },
  ja: {
    appName: "FinTrack.",
    tagline: "クラウドで簡単かつ安全に財務を管理します。",
    signInGoogle: "Gmail / Google でサインイン",
    signInEmail: "メールでサインイン",
    welcomeBack: "おかえりなさい",
    createAccount: "アカウント作成",
    email: "メールアドレス",
    password: "パスワード",
    signIn: "サインイン",
    signUp: "サインアップ",
    noAccount: "アカウントをお持ちでないですか？サインアップ",
    hasAccount: "すでにアカウントをお持ちですか？サインイン",
    passwordTooShort: "パスワードは6文字以上である必要があります。",
    hello: "こんにちは、",
    welcomeBackUser: "おかえりなさい、",
    dailySpendingPlan: "毎日の支出計画",
    idealDailyBudget: "理想的な1日の予算",
    monthlyGoal: "月間目標",
    targetSavings: "目標貯蓄額",
    income: "収入",
    expense: "支出",
    cashFlow: "キャッシュフロー",
    today: "今日",
    sevenDays: "7日間",
    recentTransactions: "最近の取引",
    noTransactions: "取引はまだありません",
    statistics: "統計",
    categoryBreakdown: "カテゴリー内訳",
    monthlyOverview: "月間概要",
    totalExpense: "総支出",
    totalIncome: "総収入",
    myWallets: "マイウォレット",
    totalBalance: "総残高",
    initialBalance: "初期残高",
    newWallet: "新しいウォレット",
    editWallet: "ウォレットを編集",
    walletName: "ウォレット名",
    create: "作成",
    save: "保存",
    settings: "設定",
    editProfile: "プロフィールを編集",
    signOut: "サインアウト",
    displayName: "表示名",
    photoUrl: "写真URL",
    saveChanges: "変更を保存",
    newTransaction: "新しい取引",
    transactionDetails: "取引の詳細",
    amount: "金額 (Rp)",
    category: "カテゴリー",
    wallet: "ウォレット",
    note: "メモ",
    optional: "オプション",
    add: "追加",
    select: "選択",
    financialPlanning: "財務計画",
    smartRecommendation: "スマート推奨",
    budgetRecommendation: "収入に基づいて、少なくとも20%を貯蓄し、50/30/20ルールに従うことをお勧めします。",
    monthlyIncome: "月収 (Rp)",
    savingsGoal: "貯蓄目標 (%)",
    idealDailySpend: "理想的な1日の支出:",
    monthlySavings: "毎月の貯蓄額:",
    recommendedAllocation: "推奨配分 (50/30/20)",
    needs: "ニーズ (50%)",
    wants: "ウォンツ (30%)",
    savings: "貯蓄 (20%)",
    applyPlan: "計画を適用",
    back: "戻る",
    home: "ホーム",
    stats: "統計",
    me: "マイページ",
    language: "言語",
    profilePreview: "プロフィールプレビュー",
    saveGoalHint: "0のままにすると、取引からの実際の月収が使用されます。",
    premiumLicense: "プレミアムライセンス",
    buyLicense: "ライセンスを購入",
    redeem: "引き換え",
    premiumExclusive: "プレミアム限定",
    unlockPremium: "わずか Rp 35.000 でプレミアム機能のロックを解除し、スマートな財務計画や毎日の推奨事項にアクセスできます。",
    paymentInstructions: "Rp 35.000 を次のいずれかの口座（名義：Muhamad Nugi Andri）に送金し、「支払いを確認」をクリックして自動的にロックを解除してください：",
    dana: "DANA: 08993358221 (Muhamad Nugi Andri)",
    bankBca: "銀行 BCA: 2990609821 (Muhamad Nugi Andri)",
    confirmPayment: "支払いを確認",
    licenseHint: "固有のライセンスコードは、確認後に自動的に生成されます。",
    daily: "日次",
    weekly: "週次",
    monthly: "月次",
    yearly: "年次",
  }
};

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

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "{}");
        if (parsed.error) {
          errorMessage = `Database Error: ${parsed.error} (${parsed.operationType} on ${parsed.path})`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0d0e14] flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Application Error</h1>
          <p className="text-gray-500 mb-6 max-w-xs">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold active:scale-95 transition-all"
          >
            Reload Application
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

interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  wallet: string;
  note?: string;
  date: string;
  timestamp: number;
}

interface WalletType {
  id: string;
  name: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
}

function ExpenseTracker() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'selection' | 'email-login' | 'email-signup'>('selection');
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'wallet' | 'me' | 'admin'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState({ name: 'User', photo: '', language: 'en', isPremium: false, licenseCode: '' });
  const [budgetSettings, setBudgetSettings] = useState({ monthlyIncome: 0, savingsGoal: 20 });
  
  const t = TRANSLATIONS[profile.language || 'en'];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [licenseRequests, setLicenseRequests] = useState<any[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'expense' | 'income',
    category: '',
    wallet: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [profileForm, setProfileForm] = useState({ name: '', photo: '', language: 'en' });
  const [walletForm, setWalletForm] = useState({ name: '', balance: 0 });
  const [statsFilter, setStatsFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [filterDate, setFilterDate] = useState(new Date());

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
      if (u) {
        setAuthMode('selection'); // Reset mode on success
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'email-login') {
        await signInWithEmailAndPassword(auth, emailForm.email, emailForm.password);
      } else {
        if (emailForm.password.length < 6) {
          setAuthError(t.passwordTooShort);
          setAuthLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, emailForm.email, emailForm.password);
        // Set initial profile for new email user
        const profilePath = `artifacts/${APP_ID}/users/${userCred.user.uid}/settings/profile`;
        await setDoc(doc(db, profilePath), { name: emailForm.email.split('@')[0], photo: '' });
      }
    } catch (error: any) {
      console.error("Email auth failed", error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = t.emailAlreadyInUse;
      else if (error.code === 'auth/invalid-email') msg = t.invalidEmail;
      else if (error.code === 'auth/weak-password') msg = t.passwordTooShort;
      else if (error.code === 'auth/operation-not-allowed') msg = t.authNotAllowed;
      else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') msg = t.authGeneralError;
      
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (!user) return;

    const profilePath = `artifacts/${APP_ID}/users/${user.uid}/settings/profile`;
    const profileRef = doc(db, profilePath);
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setProfile({
          name: data.name || 'User',
          photo: data.photo || '',
          language: data.language || 'en',
          isPremium: data.isPremium || false,
          licenseCode: data.licenseCode || ''
        });
        setProfileForm(data);
      } else {
        setDoc(profileRef, { name: 'User', photo: '', language: 'en', isPremium: false, licenseCode: '' }).catch(e => handleFirestoreError(e, OperationType.WRITE, profilePath));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, profilePath));

    const budgetPath = `artifacts/${APP_ID}/users/${user.uid}/settings/budget`;
    const budgetRef = doc(db, budgetPath);
    const unsubBudget = onSnapshot(budgetRef, (snap) => {
      if (snap.exists()) {
        setBudgetSettings(snap.data() as any);
      } else {
        setDoc(budgetRef, { monthlyIncome: 0, savingsGoal: 20 }).catch(e => handleFirestoreError(e, OperationType.WRITE, budgetPath));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, budgetPath));

    const walletsPath = `artifacts/${APP_ID}/users/${user.uid}/wallets`;
    const walletsCol = collection(db, walletsPath);
    const unsubWallets = onSnapshot(walletsCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as WalletType));
      setWallets(data);
      if (data.length === 0) {
        addDoc(walletsCol, { name: 'Cash', balance: 0 }).catch(e => handleFirestoreError(e, OperationType.CREATE, walletsPath));
        addDoc(walletsCol, { name: 'Bank', balance: 0 }).catch(e => handleFirestoreError(e, OperationType.CREATE, walletsPath));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, walletsPath));

    const catsPath = `artifacts/${APP_ID}/users/${user.uid}/categories`;
    const catsCol = collection(db, catsPath);
    const unsubCats = onSnapshot(catsCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      setCategories(data);
      if (data.length === 0) {
        ['Food', 'Transport', 'Shopping', 'Others'].forEach(c => addDoc(catsCol, { name: c }).catch(e => handleFirestoreError(e, OperationType.CREATE, catsPath)));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, catsPath));

    const transPath = `artifacts/${APP_ID}/users/${user.uid}/transactions`;
    const transCol = collection(db, transPath);
    const unsubTrans = onSnapshot(transCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, (e) => handleFirestoreError(e, OperationType.GET, transPath));

    // Fetch license requests
    const requestsCol = collection(db, `artifacts/${APP_ID}/license_requests_v3`);
    const isAdminUser = user?.email === "muhamadnugiandri@gmail.com" && user?.emailVerified;
    const requestsQuery = isAdminUser ? requestsCol : query(requestsCol, where('userId', '==', user?.uid));
    
    const unsubRequests = onSnapshot(requestsQuery, (snap) => {
      setLicenseRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `artifacts/${APP_ID}/license_requests_v3`);
    });

    return () => {
      unsubProfile();
      unsubBudget();
      unsubWallets();
      unsubCats();
      unsubTrans();
      unsubRequests();
    };
  }, [user]);

  // --- Handlers ---
  const handlePrevPeriod = () => {
    const newDate = new Date(filterDate);
    if (statsFilter === 'daily') newDate.setDate(newDate.getDate() - 1);
    else if (statsFilter === 'weekly') newDate.setDate(newDate.getDate() - 7);
    else if (statsFilter === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
    else if (statsFilter === 'yearly') newDate.setFullYear(newDate.getFullYear() - 1);
    setFilterDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(filterDate);
    if (statsFilter === 'daily') newDate.setDate(newDate.getDate() + 1);
    else if (statsFilter === 'weekly') newDate.setDate(newDate.getDate() + 7);
    else if (statsFilter === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
    else if (statsFilter === 'yearly') newDate.setFullYear(newDate.getFullYear() + 1);
    setFilterDate(newDate);
  };

  const getFilterLabel = () => {
    if (statsFilter === 'daily') return filterDate.toLocaleDateString(profile.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    if (statsFilter === 'weekly') {
      const start = new Date(filterDate);
      start.setDate(filterDate.getDate() - filterDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString(profile.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString(profile.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    if (statsFilter === 'monthly') return filterDate.toLocaleDateString(profile.language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });
    if (statsFilter === 'yearly') return filterDate.getFullYear().toString();
    return '';
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const data = { 
      ...formData, 
      amount: parseFloat(formData.amount), 
      timestamp: Date.now() 
    };
    const path = `artifacts/${APP_ID}/users/${user.uid}/transactions`;
    try {
      if (editingTransaction) {
        await updateDoc(doc(db, path, editingTransaction.id), data);
      } else {
        await addDoc(collection(db, path), data);
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
    const data = { ...walletForm, balance: parseFloat(walletForm.balance.toString()) };
    const path = `artifacts/${APP_ID}/users/${user.uid}/wallets`;
    try {
      if (editingWallet) {
        await updateDoc(doc(db, path, editingWallet.id), data);
      } else {
        await addDoc(collection(db, path), data);
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
    const path = `artifacts/${APP_ID}/users/${user.uid}/settings/profile`;
    try {
      await updateDoc(doc(db, path), profileForm);
      setIsProfileModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const path = `artifacts/${APP_ID}/users/${user.uid}/settings/budget`;
    try {
      await updateDoc(doc(db, path), budgetSettings);
      setIsBudgetModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateLanguage = async (lang: string) => {
    if (!user) return;
    const path = `artifacts/${APP_ID}/users/${user.uid}/settings/profile`;
    try {
      await updateDoc(doc(db, path), { language: lang });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("File size too large. Please upload an image smaller than 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatePayment = async (method: string) => {
    if (!user) return;
    if (!paymentProof) {
      alert(t.proofRequired);
      return;
    }
    if (myRequest) {
      alert(t.alreadyRequested);
      return;
    }
    const path = `artifacts/${APP_ID}/license_requests_v3`;
    const data = {
      userId: user.uid,
      userEmail: user.email || 'no-email',
      userName: profile.name || 'User',
      status: 'pending',
      timestamp: Date.now(),
      paymentMethod: method,
      paymentProof: paymentProof
    };
    try {
      await addDoc(collection(db, path), data);
      setPaymentProof(null);
      alert('Request sent! Please wait for admin approval.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleApproveRequest = async (request: any) => {
    if (!isAdmin) return;
    const requestPath = `artifacts/${APP_ID}/license_requests_v3`;
    const profilePath = `artifacts/${APP_ID}/users/${request.userId}/settings/profile`;
    const uniqueCode = `PREM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    try {
      await updateDoc(doc(db, requestPath, request.id), { status: 'approved' });
      await updateDoc(doc(db, profilePath), { 
        isPremium: true, 
        licenseCode: uniqueCode 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }
  };

  const handleRejectRequest = async (request: any) => {
    if (!isAdmin) return;
    const path = `artifacts/${APP_ID}/license_requests_v3`;
    try {
      await updateDoc(doc(db, path, request.id), { status: 'rejected' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleRedeemLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !licenseInput.trim()) return;
    const path = `artifacts/${APP_ID}/users/${user.uid}/settings/profile`;
    try {
      // In a real app, you'd verify the code on the server.
      // For this demo, we'll accept any non-empty code and mark as premium.
      await updateDoc(doc(db, path), { 
        isPremium: true, 
        licenseCode: licenseInput.trim() 
      });
      setIsLicenseModalOpen(false);
      setLicenseInput('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const isAdmin = user?.email === "muhamadnugiandri@gmail.com" && user?.emailVerified;
  const myRequest = useMemo(() => licenseRequests.find(r => r.userId === user?.uid), [licenseRequests, user]);

  const totals = useMemo(() => {
    const now = filterDate;
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // For weekly, we define the range based on filterDate
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    return transactions.reduce((acc, t) => {
      const tDate = new Date(t.date);
      const amt = t.amount;
      
      const isThisMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      const isThisYear = tDate.getFullYear() === currentYear;
      const isToday = t.date === todayStr;
      const isThisWeek = tDate >= startOfWeek && tDate <= endOfWeek;

      if (t.type === 'expense') {
        const realNow = new Date();
        const realTodayStr = realNow.toISOString().split('T')[0];
        const realMonth = realNow.getMonth();
        const realYear = realNow.getFullYear();
        const realSevenDaysAgo = new Date(realNow.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (tDate.getMonth() === realMonth && tDate.getFullYear() === realYear) acc.monthExpense += amt;
        if (t.date === realTodayStr) acc.todayExpense += amt;
        if (tDate >= realSevenDaysAgo) acc.sevenDayExpense += amt;
      } else {
        const realNow = new Date();
        if (tDate.getMonth() === realNow.getMonth() && tDate.getFullYear() === realNow.getFullYear()) acc.monthIncome += amt;
      }

      // Stats Filter Logic
      let matchFilter = false;
      if (statsFilter === 'daily') matchFilter = isToday;
      else if (statsFilter === 'weekly') matchFilter = isThisWeek;
      else if (statsFilter === 'monthly') matchFilter = isThisMonth;
      else if (statsFilter === 'yearly') matchFilter = isThisYear;

      if (matchFilter) {
        if (t.type === 'expense') acc.filteredExpense += amt;
        else acc.filteredIncome += amt;
      }

      return acc;
    }, { monthExpense: 0, monthIncome: 0, todayExpense: 0, sevenDayExpense: 0, filteredExpense: 0, filteredIncome: 0 });
  }, [transactions, statsFilter, filterDate]);

  const recommendations = useMemo(() => {
    const income = budgetSettings.monthlyIncome || totals.monthIncome || 0;
    const savingsGoal = budgetSettings.savingsGoal / 100;
    const savingsAmount = income * savingsGoal;
    const spendableAmount = income - savingsAmount;
    const dailyIdeal = spendableAmount / 30;
    
    return {
      income,
      savingsAmount,
      spendableAmount,
      dailyIdeal,
      needs: income * 0.5,
      wants: income * 0.3,
      savings: income * 0.2
    };
  }, [budgetSettings, totals.monthIncome]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Date", "Type", "Category", "Wallet", "Amount", "Note"];
    const rows = transactions.map(t => [
      t.date,
      t.type === 'expense' ? 'Expense' : 'Income',
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
    link.setAttribute("download", `Financial_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWalletBalance = (walletName: string, initialBalance = 0) => {
    const trans = transactions.filter(t => t.wallet === walletName);
    return trans.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, initialBalance);
  };

  // --- Login Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d0e14] flex flex-col items-center justify-center p-6 text-center relative">
        <div className="absolute top-8 flex gap-2">
          {[
            { code: 'en', label: 'EN' },
            { code: 'id', label: 'ID' },
            { code: 'zh', label: 'ZH' },
            { code: 'ja', label: 'JA' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setProfile(prev => ({ ...prev, language: lang.code }))}
              className={`w-10 h-10 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex items-center justify-center ${
                profile.language === lang.code 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-[#1a1b23] border-white/5 text-gray-600 hover:text-gray-400'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
          <Wallet size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">{t.appName}</h1>
        <p className="text-gray-500 mb-12 max-w-[250px]">{t.tagline}</p>
        
        {authMode === 'selection' ? (
          <div className="w-full max-w-xs space-y-4">
            <button 
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full bg-white text-black font-bold py-4 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50 cursor-pointer group"
            >
              {authLoading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-[10px]">G</div>
                  <span>{t.signInGoogle}</span>
                </div>
              )}
            </button>
            <button 
              onClick={() => setAuthMode('email-login')}
              className="w-full bg-[#1a1b23] text-white font-bold py-4 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/5 cursor-pointer"
            >
              <Mail size={20} />
              {t.signInEmail}
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="w-full max-w-xs space-y-4 text-left">
            <button type="button" onClick={() => setAuthMode('selection')} className="flex items-center gap-2 text-gray-500 text-xs font-bold mb-4 hover:text-white transition-all cursor-pointer">
              <ArrowLeft size={14} /> {t.back}
            </button>
            <h2 className="text-xl font-bold text-white mb-6">{authMode === 'email-login' ? t.welcomeBack : t.createAccount}</h2>
            
            {authError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold mb-4">{authError}</div>}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.email}</label>
              <input 
                type="email" 
                required 
                value={emailForm.email} 
                onChange={(e) => setEmailForm({...emailForm, email: e.target.value})} 
                placeholder="email@example.com" 
                className="w-full bg-[#1a1b23] border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-500/50" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.password}</label>
              <input 
                type="password" 
                required 
                value={emailForm.password} 
                onChange={(e) => setEmailForm({...emailForm, password: e.target.value})} 
                placeholder="••••••••" 
                className="w-full bg-[#1a1b23] border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-500/50" 
              />
              {authMode === 'email-signup' && (
                <p className="text-[8px] text-gray-600 ml-4 mt-1 italic">{t.passwordTooShort}</p>
              )}
            </div>
            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl text-[10px] cursor-pointer mt-4 flex items-center justify-center gap-2"
            >
              {authLoading ? <RefreshCw size={16} className="animate-spin" /> : (authMode === 'email-login' ? t.signIn : t.signUp)}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setAuthMode(authMode === 'email-login' ? 'email-signup' : 'email-login');
                setAuthError('');
              }}
              className="w-full bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl mt-4 hover:bg-blue-600/20 transition-all cursor-pointer"
            >
              {authMode === 'email-login' ? t.noAccount : t.hasAccount}
            </button>
          </form>
        )}
      </div>
    );
  }

  // --- Main Views ---
  const renderHome = () => (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-center px-6 pt-6">
        <div>
          <p className="text-gray-500 text-sm font-medium">{t.hello}</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsBudgetModalOpen(true)} className="w-10 h-10 bg-[#1f2029] rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all cursor-pointer">
            <TrendingUp size={18} className="text-blue-400" />
          </button>
        </div>
      </div>

      {/* Smart Planning Card */}
          <div className="px-6">
        <div className={`rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all ${profile.isPremium ? 'bg-gradient-to-br from-indigo-600 to-blue-700 shadow-blue-500/20' : 'bg-[#1a1b23] border border-white/5'}`}>
          {!profile.isPremium && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Lock size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">{t.premiumExclusive}</h3>
              <p className="text-gray-400 text-[10px] font-medium mb-6 leading-relaxed max-w-[200px]">{t.unlockPremium}</p>
              <button 
                onClick={() => setIsLicenseModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
              >
                {t.buyLicense}
              </button>
            </div>
          )}
          
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <p className={`text-[10px] font-black uppercase tracking-widest ${profile.isPremium ? 'text-white/60' : 'text-gray-600'}`}>{t.dailySpendingPlan}</p>
              {profile.isPremium && (
                <button onClick={() => setIsBudgetModalOpen(true)} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all cursor-pointer"><Edit2 size={14} className="text-white" /></button>
              )}
            </div>
            <h2 className={`text-4xl font-black mb-2 tracking-tighter ${profile.isPremium ? 'text-white' : 'text-gray-700'}`}>{formatIDR(recommendations.dailyIdeal)}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${profile.isPremium ? 'text-white/60' : 'text-gray-700'}`}>{t.idealDailyBudget}</p>
            
            <div className={`mt-8 pt-6 border-t flex justify-between items-center ${profile.isPremium ? 'border-white/10' : 'border-white/5'}`}>
              <div>
                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${profile.isPremium ? 'text-white/50' : 'text-gray-700'}`}>{t.monthlyGoal}</p>
                <p className={`font-bold text-sm ${profile.isPremium ? 'text-white' : 'text-gray-700'}`}>{t.savings} {budgetSettings.savingsGoal}%</p>
              </div>
              <div className="text-right">
                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${profile.isPremium ? 'text-white/50' : 'text-gray-700'}`}>{t.targetSavings}</p>
                <p className={`font-bold text-sm ${profile.isPremium ? 'text-white' : 'text-gray-700'}`}>{formatIDR(recommendations.savingsAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 grid grid-cols-1 gap-4">
        <div className="relative overflow-hidden bg-[#1a1b23] rounded-[2.5rem] p-8 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
             <TrendingDown size={16} className="text-blue-400" />
             <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-80">{t.totalExpense}</p>
          </div>
          <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">{formatIDR(totals.monthExpense)}</h2>
          
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
             <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                   <p className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">{t.income}</p>
                </div>
                <p className="text-white font-bold text-lg">{formatIDR(totals.monthIncome)}</p>
             </div>
             <div className="h-8 w-[1px] bg-white/10"></div>
             <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                   <p className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">{t.cashFlow}</p>
                </div>
                <p className="text-white font-bold text-lg">{formatIDR(totals.monthIncome - totals.monthExpense)}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6">
        <div className="bg-[#1a1b23] p-5 rounded-[2rem] border border-white/5 shadow-lg relative overflow-hidden group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t.today}</p>
          <h3 className="text-xl font-black text-pink-500">{formatIDR(totals.todayExpense)}</h3>
        </div>
        <div className="bg-[#1a1b23] p-5 rounded-[2rem] border border-white/5 shadow-lg relative overflow-hidden group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t.sevenDays}</p>
          <h3 className="text-xl font-black text-blue-400">{formatIDR(totals.sevenDayExpense)}</h3>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{t.recentTransactions}</h4>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="py-12 text-center bg-[#1a1b23] rounded-[2rem] border border-dashed border-white/5">
              <p className="text-gray-600 text-sm italic font-medium">{t.noTransactions}</p>
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

  const renderAdmin = () => (
    <div className="p-6 pb-32 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t.adminDashboard}</h1>
        <div className="w-10 h-10 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
          <ShieldCheck size={20} />
        </div>
      </div>

      <div className="bg-[#1a1b23] border border-white/5 rounded-[2.5rem] p-8">
        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">{t.allRequests}</h2>
        <div className="space-y-4">
          {licenseRequests.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-12 italic">{t.noRequests}</p>
          ) : (
            licenseRequests.sort((a, b) => b.timestamp - a.timestamp).map((req) => (
              <div key={req.id} className="bg-[#0d0e14] border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{req.userName || 'User'}</p>
                      <p className="text-gray-500 text-[10px] font-medium">{req.userEmail}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                    req.status === 'pending' ? 'bg-blue-600/20 text-blue-400' :
                    req.status === 'approved' ? 'bg-emerald-600/20 text-emerald-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {t[req.status]}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{t.paymentMethod}</span>
                    <span className="text-white font-bold text-xs uppercase">{req.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">DATE</span>
                    <p className="text-gray-400 text-[10px] font-medium">{new Date(req.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>

                {req.paymentProof && (
                  <div className="pt-2">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">{t.viewProof}</p>
                    <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                      <img 
                        src={req.paymentProof} 
                        alt="Payment Proof" 
                        className="w-full h-auto max-h-48 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handleApproveRequest(req)} 
                      className="flex-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      {t.approve}
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(req)} 
                      className="flex-1 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl active:scale-95 transition-all border border-red-500/10"
                    >
                      {t.reject}
                    </button>
                  </div>
                )}
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
        
        {activeTab === 'home' && renderHome()}
        {activeTab === 'admin' && isAdmin && renderAdmin()}
        {activeTab === 'stats' && (
          <div className="p-6 pb-32">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">{t.statistics}</h1>
              <button onClick={exportToCSV} className="flex items-center gap-2 bg-blue-600/10 text-blue-400 px-4 py-2 rounded-2xl border border-blue-600/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer">
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setStatsFilter(f); setFilterDate(new Date()); }}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap cursor-pointer ${
                    statsFilter === f 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-[#1a1b23] border-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {t[f]}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-[#1a1b23] border border-white/5 rounded-2xl p-4 mb-6">
              <button onClick={handlePrevPeriod} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90 cursor-pointer">
                <ArrowLeft size={18} />
              </button>
              <div className="text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">{t[statsFilter]}</p>
                <p className="text-white font-bold text-sm">{getFilterLabel()}</p>
              </div>
              <button onClick={handleNextPeriod} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90 cursor-pointer">
                <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="bg-[#1a1b23] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{t.expense}</p>
                  <h2 className="text-xl font-black text-pink-500">{formatIDR(totals.filteredExpense)}</h2>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{t.income}</p>
                  <h2 className="text-xl font-black text-emerald-400">{formatIDR(totals.filteredIncome)}</h2>
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{t.categoryBreakdown}</p>
                {categories.map(cat => {
                  const catTotal = transactions.filter(t => {
                    if (t.category !== cat.name || t.type !== 'expense') return false;
                    const tDate = new Date(t.date);
                    const now = new Date();
                    const todayStr = now.toISOString().split('T')[0];
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();
                    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

                    if (statsFilter === 'daily') return t.date === todayStr;
                    if (statsFilter === 'weekly') return tDate >= sevenDaysAgo;
                    if (statsFilter === 'monthly') return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                    if (statsFilter === 'yearly') return tDate.getFullYear() === currentYear;
                    return false;
                  }).reduce((sum, t) => sum + t.amount, 0);
                  
                  const percentage = totals.filteredExpense > 0 ? (catTotal / totals.filteredExpense) * 100 : 0;
                  if (catTotal === 0) return null;
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
              <h1 className="text-2xl font-bold text-white tracking-tight">{t.myWallets}</h1>
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
            <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">{t.settings}</h1>
            <div className="bg-[#1a1b23] rounded-[2.5rem] p-8 border border-white/5 text-center relative overflow-hidden mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 p-1 shadow-2xl relative">
                <div className="w-full h-full rounded-full bg-[#1a1b23] flex items-center justify-center overflow-hidden">
                  {profile.photo ? <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" /> : <User size={40} className="text-white/20" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{profile.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                {profile.isPremium ? (
                  <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                    <Crown size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-gray-500/10 text-gray-500 px-3 py-1 rounded-full border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest">Free Plan</span>
                  </div>
                )}
              </div>
              <button onClick={() => setIsProfileModalOpen(true)} className="mt-6 bg-white/5 text-white/70 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 cursor-pointer">{t.editProfile}</button>
            </div>

            {/* Premium Section */}
            <div className="bg-[#1a1b23] rounded-[2rem] p-6 border border-white/5 mb-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><Crown size={80} /></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 ml-2">{t.premiumLicense}</p>
                {profile.isPremium ? (
                  <div className="flex items-center gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Active License</p>
                      <p className="text-gray-500 text-[10px] font-mono mt-0.5">{profile.licenseCode}</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(profile.licenseCode || '');
                        alert('License code copied!');
                      }}
                      className="p-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-all cursor-pointer"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsLicenseModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-blue-600 rounded-2xl text-white active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} />
                      <span className="font-bold text-sm">{t.buyLicense}</span>
                    </div>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Language Selection Menu */}
            <div className="bg-[#1a1b23] rounded-[2rem] p-6 border border-white/5 mb-6">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 ml-2">{t.language}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { code: 'id', label: 'Bahasa Indonesia' },
                  { code: 'en', label: 'English' },
                  { code: 'zh', label: '中文' },
                  { code: 'ja', label: '日本語' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateLanguage(lang.code)}
                    className={`p-3 rounded-2xl text-[10px] font-bold border transition-all cursor-pointer ${
                      profile.language === lang.code 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => signOut(auth)} className="w-full bg-red-500/5 p-5 rounded-[2rem] border border-red-500/10 flex items-center gap-4 active:bg-red-500/10 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500"><LogOut size={22} /></div>
              <p className="text-red-500 font-bold">{t.signOut}</p>
            </button>
          </div>
        )}

        {/* Tab Bar Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-6 pt-2 z-50">
          <nav className="relative bg-[#1a1b23]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] h-20 flex items-center justify-around px-2 shadow-2xl">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'home' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <Home size={20} />
              <span className="text-[8px] font-black uppercase mt-1">{t.home}</span>
            </button>
            <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'stats' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <BarChart3 size={20} />
              <span className="text-[8px] font-black uppercase mt-1">{t.stats}</span>
            </button>
            <div className="relative -top-10">
              <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="w-16 h-16 bg-gradient-to-br from-[#8083ff] to-[#5356ff] rounded-[2rem] flex items-center justify-center shadow-[0_15px_30px_rgba(83,86,255,0.4)] active:scale-90 transition-all border-4 border-[#0d0e14] text-white cursor-pointer">
                <Plus size={32} strokeWidth={3} />
              </button>
            </div>
            <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'wallet' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <Wallet size={20} />
              <span className="text-[8px] font-black uppercase mt-1">{t.wallet}</span>
            </button>
            <button onClick={() => setActiveTab('me')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'me' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
              <User size={20} />
              <span className="text-[8px] font-black uppercase mt-1">{t.me}</span>
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${activeTab === 'admin' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
                <ShieldCheck size={20} />
                <span className="text-[8px] font-black uppercase mt-1">{t.admin}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Modals Section */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? t.transactionDetails : t.newTransaction}>
          <form onSubmit={handleSaveTransaction} className="space-y-5 pb-4">
            <div className="flex gap-2 p-1 bg-[#0d0e14] rounded-2xl border border-white/5">
              <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${formData.type === 'expense' ? 'bg-[#1a1b23] text-blue-400 shadow-lg' : 'text-gray-600'}`}>{t.expense}</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${formData.type === 'income' ? 'bg-[#1a1b23] text-emerald-400 shadow-lg' : 'text-gray-600'}`}>{t.income}</button>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.amount}</label>
              <input autoFocus type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0" className="w-full bg-[#0d0e14] border border-white/5 rounded-[2rem] p-6 text-3xl font-black text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.category}</label>
                <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white appearance-none">
                  <option value="">{t.select}</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.wallet}</label>
                <select required value={formData.wallet} onChange={(e) => setFormData({...formData, wallet: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white appearance-none">
                  <option value="">{t.select}</option>
                  {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.note}</label>
              <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder={t.optional} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white placeholder:text-gray-800" />
            </div>
            <div className="flex gap-4 pt-4">
              {editingTransaction && (
                <button type="button" onClick={async () => { 
                  if (user) {
                    const path = `artifacts/${APP_ID}/users/${user.uid}/transactions`;
                    try {
                      await deleteDoc(doc(db, path, editingTransaction.id)); 
                      setIsModalOpen(false); 
                    } catch (error) {
                      handleFirestoreError(error, OperationType.DELETE, path);
                    }
                  }
                }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl active:scale-90 transition-all cursor-pointer"><Trash2 size={24} /></button>
              )}
              <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer">{editingTransaction ? t.save : t.add}</button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} title={editingWallet ? t.editWallet : t.newWallet}>
          <form onSubmit={handleSaveWallet} className="space-y-5 pb-4">
            <div className="space-y-1"><label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.walletName}</label><input type="text" required value={walletForm.name} onChange={(e) => setWalletForm({...walletForm, name: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold" /></div>
            <div className="space-y-1"><label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.initialBalance} (Rp)</label><input type="number" required value={walletForm.balance} onChange={(e) => setWalletForm({...walletForm, balance: parseFloat(e.target.value)})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold" /></div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer">{editingWallet ? t.save : t.create}</button>
          </form>
        </Modal>

        <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title={t.editProfile}>
          <form onSubmit={handleUpdateProfile} className="space-y-6 pb-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#0d0e14] border-2 border-blue-500/30 flex items-center justify-center overflow-hidden mb-4 relative group">
                {profileForm.photo ? (
                  <img src={profileForm.photo} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <User size={40} className="text-white/20" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.profilePreview}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.displayName}</label>
              <input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.photoUrl}</label>
              <input type="text" value={profileForm.photo} onChange={(e) => setProfileForm({...profileForm, photo: e.target.value})} placeholder="https://example.com/photo.jpg" className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold text-xs focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.language}</label>
              <select 
                value={profileForm.language} 
                onChange={(e) => setProfileForm({...profileForm, language: e.target.value})} 
                className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ja">日本語 (Japanese)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer active:scale-95 transition-all">{t.saveChanges}</button>
          </form>
        </Modal>

        <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title={t.financialPlanning}>
          {profile.isPremium ? (
            <form onSubmit={handleUpdateBudget} className="space-y-6 pb-4">
              <div className="p-6 bg-blue-500/10 rounded-[2rem] border border-blue-500/20 mb-4">
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.smartRecommendation}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{t.budgetRecommendation}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.monthlyIncome} (Rp)</label>
                <input type="number" required value={budgetSettings.monthlyIncome} onChange={(e) => setBudgetSettings({...budgetSettings, monthlyIncome: parseFloat(e.target.value)})} className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-500/50" />
                <p className="text-[8px] text-gray-600 ml-4 mt-1 italic">{t.saveGoalHint}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{t.savingsGoal} (%)</label>
                  <span className="text-blue-400 font-black text-sm">{budgetSettings.savingsGoal}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={budgetSettings.savingsGoal} onChange={(e) => setBudgetSettings({...budgetSettings, savingsGoal: parseInt(e.target.value)})} className="w-full h-2 bg-[#0d0e14] rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>{t.idealDailySpend}</span>
                  <span className="text-white">{formatIDR(recommendations.dailyIdeal)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>{t.monthlySavings}</span>
                  <span className="text-emerald-400">{formatIDR(recommendations.savingsAmount)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{t.recommendedAllocation}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-bold">{t.needs}</span>
                    <span className="text-white text-xs font-bold">{formatIDR(recommendations.needs)}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '50%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-bold">{t.wants}</span>
                    <span className="text-white text-xs font-bold">{formatIDR(recommendations.wants)}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '30%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-bold">{t.savings}</span>
                    <span className="text-white text-xs font-bold">{formatIDR(recommendations.savings)}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer active:scale-95 transition-all">{t.applyPlan}</button>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-6 text-blue-400">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t.premiumExclusive}</h3>
              <p className="text-gray-500 text-xs mb-8 max-w-[250px] leading-relaxed">{t.unlockPremium}</p>
              <button 
                onClick={() => { setIsBudgetModalOpen(false); setIsLicenseModalOpen(true); }}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 cursor-pointer active:scale-95 transition-all"
              >
                {t.buyLicense}
              </button>
            </div>
          )}
        </Modal>

        <Modal isOpen={isLicenseModalOpen} onClose={() => setIsLicenseModalOpen(false)} title={t.premiumLicense}>
          <div className="space-y-6 pb-4">
            {myRequest ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mb-6 ${
                  myRequest.status === 'pending' ? 'bg-blue-600/10 text-blue-400 animate-pulse' :
                  myRequest.status === 'approved' ? 'bg-emerald-600/10 text-emerald-400' :
                  'bg-red-600/10 text-red-400'
                }`}>
                  {myRequest.status === 'pending' ? <RefreshCw size={32} /> :
                   myRequest.status === 'approved' ? <Check size={32} /> :
                   <X size={32} />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {myRequest.status === 'pending' ? t.paymentPending :
                   myRequest.status === 'approved' ? t.approved :
                   t.rejected}
                </h3>
                <p className="text-gray-500 text-xs max-w-[250px] leading-relaxed mb-8">
                  {myRequest.status === 'pending' ? t.paymentPendingDesc :
                   myRequest.status === 'approved' ? "Your account is now premium!" :
                   "Your request was rejected. Please contact support."}
                </p>
                <div className="w-full bg-[#0d0e14] p-4 rounded-2xl border border-white/5 text-left">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">{t.paymentMethod}</p>
                  <p className="text-white font-bold text-sm uppercase">{myRequest.paymentMethod}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-blue-600/10 p-6 rounded-[2rem] border border-blue-600/20">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">{t.paymentInstructions}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white font-bold text-sm">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><CreditCard size={16} /></div>
                      {t.dana}
                    </div>
                    <div className="flex items-center gap-3 text-white font-bold text-sm">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><CreditCard size={16} /></div>
                      {t.bankBca}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.uploadProof}</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center transition-all ${paymentProof ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-[#1a1b23] group-hover:border-blue-500/30'}`}>
                        {paymentProof ? (
                          <>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-2">
                              <Check size={20} />
                            </div>
                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">File Selected</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 mb-2 group-hover:text-blue-400 transition-colors">
                              <Upload size={20} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest group-hover:text-blue-400 transition-colors">{t.uploadProof}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleSimulatePayment('DANA')}
                      className="bg-[#1a1b23] border border-white/5 text-white font-black uppercase tracking-widest p-4 rounded-2xl text-[10px] cursor-pointer hover:bg-blue-600/10 transition-all"
                    >
                      DANA
                    </button>
                    <button 
                      onClick={() => handleSimulatePayment('BCA')}
                      className="bg-[#1a1b23] border border-white/5 text-white font-black uppercase tracking-widest p-4 rounded-2xl text-[10px] cursor-pointer hover:bg-blue-600/10 transition-all"
                    >
                      BCA
                    </button>
                  </div>
                  
                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <span className="relative px-4 bg-[#14151d] text-[8px] font-black text-gray-600 uppercase tracking-widest">OR REDEEM CODE</span>
                  </div>

                  <form onSubmit={handleRedeemLicense} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">{t.licenseCode}</label>
                      <input 
                        type="text" 
                        required 
                        value={licenseInput} 
                        onChange={(e) => setLicenseInput(e.target.value)} 
                        placeholder="XXXX-XXXX-XXXX" 
                        className="w-full bg-[#0d0e14] border border-white/5 rounded-2xl p-4 text-white font-mono font-bold text-center tracking-widest focus:outline-none focus:border-blue-500/50" 
                      />
                      <p className="text-[8px] text-gray-600 ml-4 mt-2 italic">{t.licenseHint}</p>
                    </div>
                    <button type="submit" className="w-full bg-[#1a1b23] border border-white/5 text-white font-black uppercase tracking-[0.2em] p-5 rounded-2xl shadow-xl text-[10px] cursor-pointer">{t.redeem}</button>
                  </form>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ExpenseTracker />
    </ErrorBoundary>
  );
}
