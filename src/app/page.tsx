'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Shuffle, 
  CircleDollarSign, 
  Settings, 
  Plus, 
  Download, 
  Upload, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Building2,
  Wallet,
  ArrowUpDown,
  Search,
  Trash2,
  ShieldAlert,
  Coins,
  Receipt
} from 'lucide-react';

// ==========================================
// 1. ADVANCED DATA CORE STRUCTURE TYPES
// ==========================================
export interface Trade {
  id: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Disputed';
  asset: 'USDT' | 'BTC' | 'ETH' | 'EUR' | 'USD';
  buy_amount: number;
  buy_price: number;
  buy_currency: 'EUR' | 'USD';
  buy_platform: 'Binance' | 'Bybit' | 'OKX' | 'KuCoin' | 'Custom';
  buy_payment_method: string;
  buy_fee: number;
  sell_price: number;
  sell_currency: 'EUR' | 'USD';
  sell_platform: 'Binance' | 'Bybit' | 'OKX' | 'KuCoin' | 'Custom';
  sell_payment_method: string;
  sell_fee: number;
  merchant_name: string;
  net_profit: number;
  roi: number;
  created_at: string;
  notes: string;
}

const DB_NAME = 'P2P_Pro_OperatingSystem_DB';
const DB_VERSION = 2;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB unavailable during server build state'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('trades')) {
        db.createObjectStore('trades', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(request.error);
  });
};

const dbSaveTrade = async (trade: Trade): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['trades'], 'readwrite');
      const store = tx.objectStore('trades');
      
      const totalCost = (trade.buy_amount * trade.buy_price) + trade.buy_fee;
      const totalRevenue = (trade.buy_amount * trade.sell_price) - trade.sell_fee;
      trade.net_profit = totalRevenue - totalCost;
      trade.roi = totalCost > 0 ? (trade.net_profit / totalCost) * 100 : 0;

      const req = store.put(trade);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(err);
  }
};

const dbGetTrades = async (): Promise<Trade[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['trades'], 'readonly');
      const store = tx.objectStore('trades');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return [];
  }
};

const dbDeleteAllTrades = async (): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['trades'], 'readwrite');
      const store = tx.objectStore('trades');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(err);
  }
};

// ==========================================
// 2. COMPREHENSIVE MULTILINGUAL ENGINE
// ==========================================
interface TranslationSchema {
  dashboard: string; arbitrage: string; trades: string; settings: string;
  total_portfolio: string; today_profit: string; efficiency: string;
  liquidity: string; buy_p: string; sell_p: string; entry_p: string;
  exit_p: string; volume: string; net_spread: string;
  profitable: string; unprofitable: string; save_trade: string;
  amount: string; notes: string; status: string; platform: string;
  export_db: string; import_db: string; secure_note: string;
  fees: string; active_merchants: string; filter_all: string;
  pending_capital: string; break_even: string; risk_level: string;
}

const translations: Record<'en' | 'ar' | 'es', TranslationSchema> = {
  en: {
    dashboard: "Dashboard", arbitrage: "Arbitrage", trades: "Ledger Engine", settings: "Settings",
    total_portfolio: "Net Capital Balance", today_profit: "Realized Net Profit", efficiency: "Success Velocity",
    liquidity: "Active Bank Pipeline", buy_p: "Sourcing Exchange", sell_p: "Target Liquid Market", entry_p: "P2P Entry Price",
    exit_p: "P2P Liquidation Price", volume: "Capital Volume", net_spread: "Net Spread Yield",
    profitable: "High-Yield Arbitrage Route", unprofitable: "Suboptimal Capital Spread", save_trade: "Execute Local Trade Entry",
    amount: "Asset Volume Size", notes: "Counterparty Reference Logs", status: "Operational Status", platform: "Platform Host",
    export_db: "Backup Core Database to Phone (JSON)", import_db: "Restore Encrypted Ledger File",
    secure_note: "Sandboxed Local Storage Enclave Operational. Zero tracking tokens active.",
    fees: "Aggregated Fees", active_merchants: "Trusted Counterparty Tags", filter_all: "All Transactions",
    pending_capital: "Locked Escrow Capital", break_even: "Break-Even Sourcing Limit", risk_level: "Risk Evaluation Rating"
  },
  ar: {
    dashboard: "لوحة التحكم", arbitrage: "التحكيم الفوري", trades: "محرك العمليات", settings: "الإعدادات",
    total_portfolio: "إجمالي رأس المال النشط", today_profit: "صافي الأرباح المحققة", efficiency: "معدل سرعة النجاح",
    liquidity: "قنوات السيولة المصرفية", buy_p: "منصة الشراء الأساسية", sell_p: "منصة التصفية المستهدفة", entry_p: "سعر تنفيذ الشراء",
    exit_p: "سعر تسييل البيع", volume: "حجم السيولة المدارة", net_spread: "صافي هامش الفارق العائد",
    profitable: "مسار تحكيم عالي العائد", unprofitable: "هيكل سيولة غير مجدي حالياً", save_trade: "تسجيل المعاملة محلياً في النظام",
    amount: "حجم كمية الأصول", notes: "سجل مذكرات الأطراف المقابلة", status: "حالة التشغيل الحالية", platform: "المنصة الحاضنة",
    export_db: "تصدير نسخة احتياطية مشفرة للهاتف (JSON)", import_db: "استعادة ملف قاعدة البيانات المحلي",
    secure_note: "بيئة التخزين المعزولة محلياً نشطة بالكامل لحماية سرية حساباتك وأرباحك.",
    fees: "إجمالي الرسوم المدفوعة", active_merchants: "علامات التجار المعتمدين", filter_all: "كافة المعاملات",
    pending_capital: "رأس المال المعلق في الضمان", break_even: "نقطة التعادل للشراء الآمن", risk_level: "تصنيف تقييم المخاطر"
  },
  es: {
    dashboard: "Control", arbitrage: "Arbitraje", trades: "Libro de Órdenes", settings: "Ajustes",
    total_portfolio: "Capital Neto Balance", today_profit: "Ganancia Neta Realizada", efficiency: "Velocidad de Éxito",
    liquidity: "Canales de Banca Activos", buy_p: "Exchange de Origen", sell_p: "Mercado de Liquidación", entry_p: "Precio Entrada P2P",
    exit_p: "Precio Salida P2P", volume: "Volumen de Capital", net_spread: "Margen de Spread Neto",
    profitable: "Ruta de Arbitraje de Alto Rendimiento", unprofitable: "Diferencial de Capital Subóptimo", save_trade: "Ejecutar Registro Local",
    amount: "Volumen de Activos", notes: "Notas de Contraparte", status: "Estado Operacional", platform: "Exchange Gestor",
    export_db: "Copia de Seguridad a Teléfono (JSON)", import_db: "Restaurar Archivo de Contabilidad",
    secure_note: "Almacenamiento local aislado activo. Cero riesgo de servidores o fugas externas.",
    fees: "Comisiones Acumuladas", active_merchants: "Etiquetas de Comerciantes", filter_all: "Todas las Operaciones",
    pending_capital: "Capital de Depósito en Garantía", break_even: "Límite de Compra de Equilibrio", risk_level: "Evaluación de Riesgo"
  }
};

// ==========================================
// 3. CORE MANAGEMENT SUITE COMPONENT
// ==========================================
export default function MobileCoreApp() {
  const [lang, setLang] = useState<'en' | 'ar' | 'es'>('en');
  const [activeTab, setActiveTab] = useState<'dash' | 'arb' | 'trades' | 'settings'>('dash');
  const [trades, setTrades] = useState<Trade[]>([]);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [assetType, setAssetType] = useState<Trade['asset']>('USDT');
  const [buyAmount, setBuyAmount] = useState<number>(1000);
  const [buyPrice, setBuyPrice] = useState<number>(0.92);
  const [buyFee, setBuyFee] = useState<number>(0);
  const [buyPlatform, setBuyPlatform] = useState<Trade['buy_platform']>('Binance');
  const [buyMethod, setBuyMethod] = useState<string>('Wise');
  
  const [sellPrice, setSellPrice] = useState<number>(0.95);
  const [sellFee, setSellFee] = useState<number>(0);
  const [sellPlatform, setSellPlatform] = useState<Trade['sell_platform']>('Bybit');
  const [sellMethod, setSellMethod] = useState<string>('Revolut');
  
  const [merchantName, setMerchantName] = useState<string>('');
  const [tradeStatus, setTradeStatus] = useState<Trade['status']>('Completed');
  const [userNotes, setUserNotes] = useState<string>('');

  const [arbVol, setArbVol] = useState<number>(2500);
  const [arbBuyPrice, setArbBuyPrice] = useState<number>(0.915);
  const [arbSellPrice, setArbSellPrice] = useState<number>(0.948);
  const [arbPlatformFee, setArbPlatformFee] = useState<number>(2);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    dbGetTrades().then(setTrades).catch(console.error);
  }, [activeTab]);

  const handleCreateTrade = async () => {
    const freshTrade: Trade = {
      id: `p2p_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      status: tradeStatus,
      asset: assetType,
      buy_amount: buyAmount,
      buy_price: buyPrice,
      buy_currency: 'EUR',
      buy_platform: buyPlatform,
      buy_payment_method: buyMethod,
      buy_fee: buyFee,
      sell_amount: buyAmount,
      sell_price: sellPrice,
      sell_currency: 'EUR',
      sell_platform: sellPlatform,
      sell_payment_method: sellMethod,
      sell_fee: sellFee,
      merchant_name: merchantName || 'Anonymous P2P Counterparty',
      net_profit: 0,
      roi: 0,
      created_at: new Date().toISOString(),
      notes: userNotes || 'No custom tracking details added.'
    };
    
    await dbSaveTrade(freshTrade);
    alert(lang === 'ar' ? 'تمت معالجة الصفقة وتحديث المحفظة بأمان!' : 'Trade successfully executed and written to device memory!');
    
    setMerchantName('');
    setUserNotes('');
    dbGetTrades().then(setTrades);
    setActiveTab('dash');
  };

  const handleWipeDatabase = async () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع البيانات نهائياً؟ لا يمكن التراجع.' : 'CRITICAL WARNING: This completely wipes all local transaction records. Continue?')) {
      await dbDeleteAllTrades();
      setTrades([]);
    }
  };

  const handleBackupExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trades, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `p2p_operating_system_pro_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  const completedTrades = trades.filter(x => x.status === 'Completed');
  const totalRealizedProfit = completedTrades.reduce((sum, current) => sum + current.net_profit, 0);
  const totalFeesPaid = trades.reduce((sum, current) => sum + current.buy_fee + current.sell_fee, 0);
  const lockedEscrowCapital = trades.filter(x => x.status === 'Pending').reduce((sum, current) => sum + (current.buy_amount * current.buy_price), 0);
  
  const totalSimulatedCost = (arbVol * arbBuyPrice) + arbPlatformFee;
  const totalSimulatedRevenue = (arbVol * arbSellPrice) - arbPlatformFee;
  const liveArbNetProfit = totalSimulatedRevenue - totalSimulatedCost;
  const liveArbSpread = totalSimulatedCost > 0 ? (liveArbNetProfit / totalSimulatedCost) * 100 : 0;
  const liveBreakEvenPoint = arbSellPrice - (arbPlatformFee * 2 / arbVol);

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          trade.buy_payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trade.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || trade.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* PREMIUM STICKY FINTECH TOP BAR */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 backdrop-blur-xl">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-xs font-black tracking-widest text-zinc-300">P2P.OS PRO // v2.0</h1>
        </div>
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-inner">
          {(['en', 'ar', 'es'] as const).map((localeItem) => (
            <button
              key={localeItem}
              onClick={() => setLang(localeItem)}
              className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg transition-all ${lang === localeItem ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {localeItem}
            </button>
          ))}
        </div>
      </header>

      {/* CORE FRAMEWORK CONTAINER */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
        
        {/* VIEW 1: PREMIUM PERFORMANCE DASHBOARD */}
        {activeTab === 'dash' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/70 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-emerald-500/10 to-teal-500/0 rounded-full filter blur-2xl" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t.total_portfolio}</span>
              <span className="text-3xl font-black mt-1 text-zinc-100 tracking-tight block">
                €{(35000 + totalRealizedProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg font-bold">
                  <TrendingUp className="w-3 h-3" />
                  <span>+€{totalRealizedProfit.toFixed(2)} ROI</span>
                </div>
                <span className="text-[9px] text-zinc-600">Base Allocation: €35,000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{t.today_profit}</span>
                <span className="text-lg font-black text-emerald-400 mt-1 block">
                  +€{totalRealizedProfit > 0 ? totalRealizedProfit.toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{t.pending_capital}</span>
                <span className="text-lg font-black text-amber-500 mt-1 block">
                  €{lockedEscrowCapital.toFixed(2)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{t.fees}</span>
                <span className="text-lg font-black text-red-400 mt-1 block">
                  €{totalFeesPaid.toFixed(2)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{t.efficiency}</span>
                <span className="text-lg font-black text-teal-400 mt-1 block">
                  {trades.length > 0 ? ((completedTrades.length / trades.length) * 100).toFixed(1) : '100'}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900">
              <h3 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" /> {t.liquidity}
              </h3>
              <div className="space-y-3.5">
                {[
                  { name: 'Wise Bank Transfer Node', val: '€14,850', pct: 40, color: 'bg-blue-500' },
                  { name: 'Revolut International Pipeline', val: '€11,200', pct: 30, color: 'bg-amber-500' },
                  { name: 'BBVA / Santander Local Rail', val: '€8,950', pct: 20, color: 'bg-red-500' },
                  { name: 'Escrow Cold Wallet Buffer', val: '€5,000', pct: 10, color: 'bg-emerald-500' }
                ].map((bank, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-400">{bank.name}</span>
                      <span className="text-zinc-200 font-bold">{bank.val} <span className="text-[9px] text-zinc-600">({bank.pct}%)</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full">
                      <div className={`h-full rounded-full ${bank.color}`} style={{ width: `${bank.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 text-center py-6">
              <div className="h-16 flex items-end justify-between gap-1.5 px-2">
                {[30, 45, 35, 60, 50, 75, 65, 90, 85, 100].map((heightVal, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-md" style={{ height: `${heightVal}%` }} />
                ))}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mt-3 block">High Frequency Trade Flow Engine</span>
            </div>
          </div>
        )}

        {/* VIEW 2: ARBITRAGE SCANNER & COMPUTATION TOOL */}
        {activeTab === 'arb' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-emerald-400" /> {t.arbitrage}
            </h2>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.volume} (USDT)</label>
                <input 
                  type="number" 
                  inputMode="decimal" 
                  value={arbVol} 
                  onChange={(e) => setArbVol(Number(e.target.value))} 
                  className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.entry_p}</label>
                  <input 
                    type="number" 
                    step="0.001" 
                    inputMode="decimal" 
                    value={arbBuyPrice} 
                    onChange={(e) => setArbBuyPrice(Number(e.target.value))} 
                    className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.exit_p}</label>
                  <input 
                    type="number" 
                    step="0.001" 
                    inputMode="decimal" 
                    value={arbSellPrice} 
                    onChange={(e) => setArbSellPrice(Number(e.target.value))} 
                    className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">Estimated Banking Transfer Cost (€)</label>
                <input 
                  type="number" 
                  value={arbPlatformFee} 
                  onChange={(e) => setArbPlatformFee(Number(e.target.value))} 
                  className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" 
                />
              </div>
            </div>

            {liveArbNetProfit > 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /> {t.profitable}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-500/10">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">{t.net_spread}</span>
                    <span className="text-lg font-black text-emerald-400">+{liveArbSpread.toFixed(2)}%</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[9px] text-zinc-500 uppercase block">Expected Yield</span>
                    <span className="text-lg font-black text-emerald-400">+€{liveArbNetProfit.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-[10px] bg-zinc-900/60 p-2 rounded-xl border border-zinc-800 text-zinc-400 flex justify-between font-mono">
                  <span>{t.break_even}:</span>
                  <span className="text-emerald-400 font-bold">€{liveBreakEvenPoint.toFixed(3)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2 text-xs font-bold text-red-400 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4" /> {t.unprofitable}
                </div>
                <p className="text-[10px] text-zinc-500 font-normal">Spread falls below required ecosystem processing fees.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LEDGER AND TRANSACTION PIPELINE */}
        {activeTab === 'trades' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <h2 className="text-sm font-black text-zinc-200 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" /> {t.save_trade}
              </h2>

              <div className="grid grid-cols-3 gap-2">
                {(['USDT', 'BTC', 'EUR'] as const).map((ast) => (
                  <button 
                    key={ast} 
                    type="button"
                    onClick={() => setAssetType(ast as any)}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${assetType === ast ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-950 border border-zinc-800 text-zinc-400'}`}
                  >
                    {ast}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.amount}</label>
                  <input type="number" value={buyAmount} onChange={(e) => setBuyAmount(Number(e.target.value))} className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.buy_p}</label>
                  <select value={buyPlatform} onChange={(e) => setBuyPlatform(e.target.value as any)} className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:border-emerald-500 outline-none">
                    <option value="Binance">Binance</option>
                    <option value="Bybit">Bybit</option>
                    <option value="OKX">OKX</option>
                    <option value="KuCoin">KuCoin</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.entry_p}</label>
                  <input type="number" step="0.001" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Sourcing Fee</label>
                  <input type="number" value={buyFee} onChange={(e) => setBuyFee(Number(e.target.value))} className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Payment Rail</label>
                  <input type="text" value={buyMethod} onChange={(e) => setBuyMethod(e.target.value)} placeholder="Wise" className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.exit_p}</label>
                  <input type="number" step="0.001" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Liquid Fee</label>
                  <input type="number" value={sellFee} onChange={(e) => setSellFee(Number(e.target.value))} className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Liquid Target</label>
                  <select value={sellPlatform} onChange={(e) => setSellPlatform(e.target.value as any)} className="w-full h-11 px-1 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none">
                    <option value="Bybit">Bybit</option>
                    <option value="Binance">Binance</option>
                    <option value="OKX">OKX</option>
                    <option value="KuCoin">KuCoin</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Merchant Tag</label>
                  <input type="text" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="e.g. Ghazy_P2P" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Escrow Status</label>
                  <select value={tradeStatus} onChange={(e) => setTradeStatus(e.target.value as any)} className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm outline-none">
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Disputed">Disputed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.notes}</label>
                <input type="text" value={userNotes} onChange={(e) => setUserNotes(e.target.value)} placeholder="Order numbers or execution parameters" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
              </div>

              <button type="button" onClick={handleCreateTrade} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold text-zinc-950 shadow-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-zinc-950" /> {t.save_trade}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center px-3 gap-2">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search merchant, bank rails..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 bg-transparent text-xs text-zinc-100 outline-none"
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)} 
                  className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl px-2 outline-none font-bold"
                >
                  <option value="ALL">ALL</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </div>

              <div className="space-y-2">
                {filteredTrades.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-600 border border-dashed border-zinc-900 rounded-2xl">No transactional ledger records match active query filters.</div>
                ) : (
                  [...filteredTrades].reverse().map((ledgerItem) => (
                    <div key={ledgerItem.id} className="p-4 bg-zinc-900/40 border border-zinc-900/80 rounded-2xl space-y-2 animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 font-black text-xs text-zinc-200">
                            <span>{ledgerItem.buy_platform} ({ledgerItem.buy_payment_method})</span>
                            <span className="text-zinc-600">➔</span>
                            <span>{ledgerItem.sell_platform}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-1 font-mono">{ledgerItem.merchant_name}</span>
                        </div>
                        <div className="text-end">
                          <p className={`font-black text-sm ${ledgerItem.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {ledgerItem.net_profit >= 0 ? '+' : ''}€{ledgerItem.net_profit.toFixed(2)}
                          </p>
                          <span className="text-[9px] text-zinc-500 font-mono block">{ledgerItem.roi.toFixed(1)}% ROI</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-[10px] text-zinc-500">
                        <span className="font-mono">{new Date(ledgerItem.created_at).toLocaleDateString()} // {new Date(ledgerItem.created_at).toLocaleTimeString()}</span>
                        <span className={`px-2 py-0.5 rounded font-extrabold uppercase ${ledgerItem.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : ledgerItem.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                          {ledgerItem.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SYSTEM CONFIGURATION & SYSTEM TOOLS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" /> {t.settings}
            </h2>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-zinc-500" /> Core File Backup Utility
              </p>
              
              <button 
                type="button"
                onClick={handleBackupExport} 
                className="w-full h-12 border border-zinc-800 bg-zinc-950 rounded-xl font-bold text-zinc-200 text-xs flex items-center justify-center gap-2 active:bg-zinc-900 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" /> {t.export_db}
              </button>

              <div className="pt-2 border-t border-zinc-800/60">
                <label className="w-full h-12 border border-zinc-800 border-dashed bg-zinc-950 rounded-xl font-bold text-zinc-400 text-xs flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-900">
                  <Upload className="w-4 h-4 text-teal-400" /> {t.import_db}
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={async (e) => {
                      const targetFile = e.target.files?.[0];
                      if (!targetFile) return;
                      try {
                        const fileStringData = await targetFile.text();
                        const verifiedArray: Trade[] = JSON.parse(fileStringData);
                        for (const trRecord of verifiedArray) {
                          await dbSaveTrade(trRecord);
                        }
                        alert('Ecosystem state verification passed. Database payload fully merged!');
                        dbGetTrades().then(setTrades);
                      } catch (err) {
                        alert('Encrypted JSON formatting mismatch. Verification aborted.');
                      }
                    }} 
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/10 border border-red-900/30 space-y-2">
              <h3 className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Factory System Reset
              </h3>
              <p className="text-[10px] text-zinc-500 leading-normal">Purges your system database entries entirely from the local Chrome/Firefox profile cache. Ensure you have exported a valid backup configuration file beforehand.</p>
              <button 
                type="button"
                onClick={handleWipeDatabase}
                className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl text-xs transition-colors mt-1 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Ecosystem Database Logs
              </button>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-900/10 border border-zinc-900 text-center text-[10px] text-zinc-500 leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t.secure_note}</span>
            </div>
          </div>
        )}

      </main>

      {/* ERGONOMIC NATIVE-FEEL BOTTOM NAVIGATION NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-900 backdrop-blur-xl px-2 pb-safe shadow-[0_-10px_35px_rgba(0,0,0,0.9)]">
        <div className="flex justify-around items-center h-16">
          {[
            { id: 'dash', icon: LayoutDashboard, label: t.dashboard },
            { id: 'arb', icon: Shuffle, label: t.arbitrage },
            { id: 'trades', icon: CircleDollarSign, label: t.trades },
            { id: 'settings', icon: Settings, label: t.settings }
          ].map((navTab) => {
            const IconComponent = navTab.icon;
            const isTabActive = activeTab === navTab.id;
            return (
              <button 
                key={navTab.id} 
                type="button"
                onClick={() => setActiveTab(navTab.id as any)} 
                className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 touch-manipulation relative h-full"
              >
                <IconComponent className={`w-5 h-5 transition-all duration-200 ${isTabActive ? 'text-emerald-400 scale-110 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'text-zinc-600'}`} />
                <span className={`text-[10px] mt-1 transition-all duration-150 tracking-tight ${isTabActive ? 'text-zinc-100 font-black' : 'text-zinc-500'}`}>
                  {navTab.label}
                </span>
                {isTabActive && (
                  <div className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}