import React, { useState } from 'react';
import { 
  Wallet, 
  BarChart3, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X,
  MessageCircle,
  Star,
  Lock,
  Plus,
  Home,
  User,
  ArrowUpRight,
  RefreshCw,
  Moon,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update nomor WhatsApp di sini
  const WHATSAPP_NUMBER = "628993358221"; 
  const PRODUCT_NAME = "FinTrack Lifetime License";

  const handleBuyNow = () => {
    const message = encodeURIComponent(`Halo CloudPrime, saya tertarik untuk membeli lisensi ${PRODUCT_NAME} seharga Rp 99rb. Bagaimana langkah selanjutnya?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e14] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d0e14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wallet size={24} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">FinTrack<span className="text-blue-500">.</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">Fitur</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">Cara Kerja</button>
            <button onClick={() => scrollTo('pricing')} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">Harga</button>
            <button onClick={() => scrollTo('faq')} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">FAQ</button>
            <button onClick={handleBuyNow} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer">
              Dapatkan Lisensi
            </button>
          </div>

          <button className="md:hidden text-white cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#16171d] border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <button onClick={() => scrollTo('features')} className="text-sm font-black uppercase text-left cursor-pointer">Fitur</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-black uppercase text-left cursor-pointer">Cara Kerja</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm font-black uppercase text-left cursor-pointer">Harga</button>
            <button onClick={() => scrollTo('faq')} className="text-sm font-black uppercase text-left cursor-pointer">FAQ</button>
            <button onClick={handleBuyNow} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
              <MessageCircle size={20} /> Hubungi Admin
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-44 pb-24 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8 animate-pulse">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">By CloudPrime Digital Product</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Uang Anda <br /> 
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent italic tracking-[-0.05em]">Punya Cerita.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Berhenti bertanya-tanya ke mana perginya uang Anda. FinTrack membantu Anda mencatat setiap rupiah dengan presisi tinggi dan dashboard yang memanjakan mata.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button onClick={() => scrollTo('pricing')} className="group w-full sm:w-auto bg-white text-black px-12 py-6 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 cursor-pointer">
              Beli Lisensi <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => scrollTo('features')} className="w-full sm:w-auto bg-[#1a1b23] border border-white/5 px-12 py-6 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all cursor-pointer">
              Pelajari Fitur
            </button>
          </div>
        </div>
      </section>

      {/* Stats/Showcase Section */}
      <section className="py-24 px-6 bg-[#0a0b10]/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600/20 blur-[120px] -z-10 group-hover:bg-blue-600/30 transition-all duration-700"></div>
            
            {/* Real App Interface Simulation */}
            <div className="relative bg-[#0d0e14] border-[8px] border-[#1a1b23] rounded-[3.5rem] shadow-2xl overflow-hidden max-w-[380px] mx-auto transition-transform duration-500 hover:scale-[1.02]">
              {/* Status Bar */}
              <div className="h-10 px-8 flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>15.12</span>
                <div className="flex items-center gap-1.5"><RefreshCw size={10} /><div className="w-4 h-2 bg-gray-600 rounded-sm"></div></div>
              </div>

              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Selamat Datang,</p>
                  <p className="text-xl font-black">CloudPrime</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-xl"><RefreshCw size={18} className="text-gray-400" /></div>
                  <Moon size={22} className="text-yellow-400 fill-yellow-400" />
                </div>
              </div>

              {/* Main Spending Card */}
              <div className="px-6 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80 mb-2">Total Pengeluaran Bulan Ini</p>
                    <h3 className="text-3xl font-black mb-6">Rp 9.003.932</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl w-fit border border-white/10">
                      <CheckCircle2 size={12} className="text-green-400" />
                      <span>Terakhir sinkron: 25 Mar • 16.06</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="px-6 grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#12b3bc1a] border border-[#12b3bc33] p-5 rounded-[2.2rem]">
                   <p className="text-[8px] font-black uppercase text-[#12b3bc] tracking-widest mb-1">Hari Ini</p>
                   <p className="text-lg font-black italic">Rp 106.500</p>
                </div>
                <div className="bg-[#12bc771a] border border-[#12bc7733] p-5 rounded-[2.2rem]">
                   <p className="text-[8px] font-black uppercase text-[#12bc77] tracking-widest mb-1">7 Hari Terakhir</p>
                   <p className="text-lg font-black italic">Rp 2.226.240</p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="px-6 pb-20">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">25 Mar 2026</p>
                  <span className="text-[9px] font-black bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded">-Rp 106.500</span>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-[#16171d] p-5 rounded-[1.8rem] flex justify-between items-center border border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shadow-inner">
                        <ArrowUpRight size={18} className="rotate-180" />
                       </div>
                       <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">Alfamart Regular D</p>
                        <p className="text-[8px] font-bold text-gray-600">BCA</p>
                       </div>
                    </div>
                    <p className="text-xs font-black text-pink-500">-Rp 94.500</p>
                  </div>
                </div>
              </div>

              {/* Tab Bar Navigation */}
              <div className="absolute bottom-0 left-0 w-full px-6 py-6 bg-[#0d0e14]/90 backdrop-blur-md border-t border-white/5">
                <div className="flex items-center justify-between relative px-2 text-gray-600">
                  <div className="flex flex-col items-center gap-1 text-blue-500"><Home size={20}/><span className="text-[7px] font-black uppercase">Home</span></div>
                  <div className="flex flex-col items-center gap-1"><BarChart3 size={20}/><span className="text-[7px] font-black uppercase">Stats</span></div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center -mt-12 border-[6px] border-[#0d0e14] text-white shadow-xl shadow-blue-600/30">
                    <Plus size={28} />
                  </div>
                  <div className="flex flex-col items-center gap-1"><Wallet size={20}/><span className="text-[7px] font-black uppercase">Wallet</span></div>
                  <div className="flex flex-col items-center gap-1"><User size={20}/><span className="text-[7px] font-black uppercase">Me</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="w-12 h-1 w-20 bg-blue-600 rounded-full"></div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Dashboard yang Berbicara untuk Anda.</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              Kami tidak hanya membuat pencatat keuangan. Kami membuat asisten visual. Anda bisa melihat pergerakan saldo dari berbagai dompet (BCA, Seabank, E-Wallet) dalam satu layar tanpa perlu login ke banyak aplikasi bank.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-blue-500 shrink-0" />
                <span className="font-bold text-gray-200">Manajemen Multi-Dompet Terintegrasi</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-blue-500 shrink-0" />
                <span className="font-bold text-gray-200">Kategori Transaksi yang Bisa Dikustomisasi</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-blue-500 shrink-0" />
                <span className="font-bold text-gray-200">History Lengkap dengan Catatan Detail</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Solusi Pintar</h2>
            <p className="text-4xl md:text-6xl font-black tracking-tight">Kendalikan Aliran Kas Anda.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<BarChart3 className="text-blue-400" size={40} />}
              title="Analitik Mendalam"
              desc="Grafik pie dan bar otomatis yang memisahkan pengeluaran konsumtif dan produktif Anda."
            />
            <FeatureCard 
              icon={<Download className="text-emerald-400" size={40} />}
              title="Laporan Ekspor CSV"
              desc="Ekspor semua data ke format Excel hanya dalam hitungan detik untuk audit mandiri."
            />
            <FeatureCard 
              icon={<Lock className="text-purple-400" size={40} />}
              title="Privasi Mutlak"
              desc="Data Anda disimpan di Firebase Google dengan enkripsi tingkat tinggi. Hanya Anda yang punya kunci aksesnya."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#16171d]/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Alur Pembelian</h2>
            <p className="text-3xl md:text-5xl font-black tracking-tight">Cepat & Transparan.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <StepItem number="01" title="Checkout WA" desc="Klik tombol beli dan konfirmasi pembayaran ke admin CloudPrime." />
            <StepItem number="02" title="Kirim File" desc="Source code & panduan instalasi lengkap dikirimkan dalam 5 menit." />
            <StepItem number="03" title="Live & Online" desc="Ikuti panduan setup sederhana dan aplikasi Anda online selamanya." />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Investasi Terbaik</h2>
            <p className="text-4xl md:text-6xl font-black tracking-tight">Harga Satu Kali, Manfaat Abadi.</p>
          </div>

          <div className="max-w-xl mx-auto bg-gradient-to-br from-[#1a1b23] to-[#0d0e14] border border-white/10 rounded-[4rem] p-12 relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden group">
            <div className="relative z-10 text-center">
              <div className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full inline-block mb-8 border border-blue-600/30">
                ⭐ Promo Terbatas Bulan Ini
              </div>
              <div className="flex flex-col items-center gap-2 mb-10">
                <span className="text-gray-500 line-through font-bold">Rp 499.000</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black italic tracking-tighter text-white">Rp 99rb</span>
                </div>
                <p className="text-gray-500 text-sm font-medium mt-2">Lisensi Seumur Hidup (Lifetime)</p>
              </div>
              
              <div className="space-y-5 mb-12 text-left max-w-xs mx-auto">
                <PriceItem text="Full Source Code (React JS)" />
                <PriceItem text="Panduan Deployment Vercel" />
                <PriceItem text="Konfigurasi Firebase Database" />
                <PriceItem text="Support Tanya Jawab CloudPrime" />
              </div>

              <button onClick={handleBuyNow} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] py-7 rounded-[2.5rem] shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 text-sm cursor-pointer">
                <MessageCircle size={22} /> Amankan Lisensi Saya
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#0a0b10]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Pusat Bantuan</h2>
            <p className="text-3xl md:text-5xl font-black tracking-tight italic">Sering Ditanyakan.</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              q="Apakah saya perlu bayar bulanan?" 
              a="Tidak. Ini adalah model sekali bayar. Setelah Anda memiliki source codenya, Anda bisa menggunakannya selamanya tanpa biaya tambahan atau langganan apapun." 
            />
            <FAQItem 
              q="Bagaimana jika saya gaptek atau tidak mengerti koding?" 
              a="Jangan khawatir. Paket penjualan sudah termasuk panduan PDF dan video singkat yang menjelaskan cara online-kan aplikasi hanya dengan beberapa klik. Admin CloudPrime juga siap membantu jika Anda bingung." 
            />
            <FAQItem 
              q="Apakah aman untuk data keuangan saya?" 
              a="Sangat aman. Data tidak disimpan di server kami, melainkan di server Google Firebase milik Anda sendiri. Hanya Anda yang memiliki akses ke database tersebut." 
            />
            <FAQItem 
              q="Bisakah saya mengedit logo atau tampilannya?" 
              a="Tentu saja! Karena Anda mendapatkan full source code (React JS), Anda bebas memodifikasi warna, logo, atau fitur sesuai keinginan Anda atau brand Anda." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 bg-[#0a0b10]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Wallet size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">FinTrack<span className="text-blue-500">.</span></span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm mx-auto md:mx-0">Solusi modern untuk mengelola finansial pribadi dengan gaya dan keamanan tingkat tinggi.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2026 CloudPrime Digital Product • Crafted with Precision</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// UI Sub-components
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#1a1b23] p-12 rounded-[3.5rem] border border-white/5 hover:border-blue-500/30 transition-all duration-500 group">
      <div className="mb-8 p-4 bg-white/5 rounded-[1.5rem] inline-block group-hover:scale-110 group-hover:bg-blue-600/10 transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-5 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative z-10 text-center space-y-4">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-xl font-black shadow-2xl shadow-blue-500/40">{number}</div>
      <h4 className="text-xl font-black tracking-tight">{title}</h4>
      <p className="text-gray-500 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function PriceItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
        <CheckCircle2 size={14} className="text-emerald-500" />
      </div>
      <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">{text}</span>
    </div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[#1a1b23] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <span className="text-lg font-black tracking-tight pr-8">{q}</span>
        <ChevronDown size={20} className={`text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
          <p className="text-gray-500 text-sm leading-relaxed font-medium border-t border-white/5 pt-6">{a}</p>
        </div>
      )}
    </div>
  );
}
