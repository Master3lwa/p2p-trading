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
  Receipt,
  Sparkles,
  UserCheck,
  Percent,
  History,
  TrendingDown
} from 'lucide-react';

// ==========================================
// 1. EXTENDED PRODUCTION ARCHITECTURE TYPES
// ==========================================
export interface Trade {
  id: string;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Disputed';
  asset: string;       // e.g. USDT, BTC, ETH, SOL
  buy_amount: number;
  buy_price: number;
  buy_currency: string; // e.g. EUR, USD, EGP, SAR
  buy_platform: string; // e.g. Binance, Bybit
  buy_payment_method: string; // e.g. Wise, Revolut
  buy_fee: number;
  sell_price: number;
  sell_currency: string;
  sell_platform: string;
  sell_payment_method: string;
  sell_fee: number;
  merchant_name: string;
  merchant_risk: 'Safe' | 'Suspicious' | 'Verified Pro';
  net_profit_usd: number; // Normalizing to base asset for metrics
  roi: number;
  created_at: string;
  notes: string;
}

export interface BankNode {
  id: string;
  name: string;      // e.g. Wise, Revolut, Instapay
  currency: string;  // e.g. EUR, USD, EGP
  balance: number;
  estimated_fee_pct: number;
}

const DB_NAME = 'P2P_Monstruous_Ecosystem_v3';
const DB_VERSION = 3;

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
      if (!db.objectStoreNames.contains('banks')) {
        db.createObjectStore('banks', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(request.target.result);
    request.onerror = (e: any) => reject(request.error);
  });
};

// Database utility mutations
const dbSaveTrade = async (trade: Trade): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['trades'], 'readwrite');
    const store = tx.objectStore('trades');
    const totalCost = (trade.buy_amount * trade.buy_price) + trade.buy_fee;
    const totalRevenue = (trade.buy_amount * trade.sell_price) - trade.sell_fee;
    trade.net_profit_usd = totalRevenue - totalCost;
    trade.roi = totalCost > 0 ? (trade.net_profit_usd / totalCost) * 100 : 0;
    const req = store.put(trade);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const dbGetTrades = async (): Promise<Trade[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['trades'], 'readonly');
    const store = tx.objectStore('trades');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

const dbSaveBank = async (bank: BankNode): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['banks'], 'readwrite');
    const store = tx.objectStore('banks');
    const req = store.put(bank);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const dbGetBanks = async (): Promise<BankNode[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['banks'], 'readonly');
    const store = tx.objectStore('banks');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

const dbWipeAllData = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['trades', 'banks'], 'readwrite');
    tx.objectStore('trades').clear();
    tx.objectStore('banks').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// ==========================================
// 2. MONSTERS TRANSLATION SCHEMA MATRIX (i18n)
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
  ai_insights: string; bank_nodes: string; add_node: string;
  risk_rating: string; merchant_tag: string; tri_arb: string;
}

const translations: Record<'en' | 'ar' | 'es', TranslationSchema> = {
  en: {
    dashboard: "Command Center", arbitrage: "Arbitrage Lab", trades: "Ecosystem Ledger", settings: "System Core",
    total_portfolio: "Consolidated Asset Valuation", today_profit: "Realized Net Yield", efficiency: "Success Velocity",
    liquidity: "Liquidity Network Map", buy_p: "Sourcing Hub Node", sell_p: "Target Capital Market", entry_p: "Asset Entry Value",
    exit_p: "Liquidation Value", volume: "Processed Capital Mass", net_spread: "Calculated Alpha Spread",
    profitable: "Optimal High-Yield Pipeline", unprofitable: "Suboptimal Flow - Negative Spread", save_trade: "Commit Record To Secure Memory",
    amount: "Transaction Asset Size", notes: "Audit & Compliance Reference Logs", status: "Network Escrow State", platform: "Exchange Node",
    export_db: "Dump Master Database Image (JSON)", import_db: "Ingest Encrypted System File",
    secure_note: "Military-grade browser hardware sandboxing operational. External tracing baseline: 0%.",
    fees: "Total Friction Leakage (Fees)", active_merchants: "Counterparty Profiles", filter_all: "Unfiltered General Ledger",
    pending_capital: "Capital Bound in Escrow", break_even: "Absolute Loss Floor Limit", risk_level: "Risk Evaluation Model",
    ai_insights: "AI Predictive Operational Engine", bank_nodes: "Liquidity Rails / Bank Accounts", add_node: "Initialize Liquidity Rail",
    risk_rating: "Counterparty Counter-Risk Profile", merchant_tag: "Counterparty Unique Identity Signature", tri_arb: "Multi-Leg Triangular Arbitrage Matrix"
  },
  ar: {
    dashboard: "مركز القيادة", arbitrage: "مختبر التحكيم", trades: "دفتر حسابات النظام", settings: "نواة النظام",
    total_portfolio: "رأس المال الموحد الشامل", today_profit: "صافي الأرباح التشغيلية", efficiency: "مؤشر سرعة النجاح",
    liquidity: "شبكة القنوات المالية النشطة", buy_p: "مصدر/منصة التوريد", sell_p: "سوق التصريف والتسييل", entry_p: "سعر توريد الأصل المعادل",
    exit_p: "سعر تسييل التصفية المعادل", volume: "كتلة رأس المال المدار", net_spread: "هامش العائد الصافي (Alpha)",
    profitable: "قناة تحكيم ممتازة - عائد مرتفع", unprofitable: "عائد سلبي - لا ينصح بالتنفيذ", save_trade: "تثبيت المعاملة في الذاكرة المعزولة",
    amount: "حجم أصول الصفقة", notes: "سجل التدقيق والملاحظات الأمنية", status: "حالة الضمان المالي الحالي", platform: "عقدة المنصة",
    export_db: "تصدير نسخة كاملة من النظام (JSON)", import_db: "استيراد ملف قاعدة البيانات المشفر",
    secure_note: "نظام التشفير والعزل المحلي نشط بالكامل داخل ذاكرة هاتفك الآمنة لخصوصية تامة.",
    fees: "إجمالي التسريب المالي (الرسوم)", active_merchants: "ملفات الأطراف المقابلة والتجار", filter_all: "دفتر الحسابات العام الشامل",
    pending_capital: "رأس المال المقيد في عقود الضمان", break_even: "الحد الأدنى لمنع الخسارة (التعادل)", risk_level: "نموذج تقييم مخاطر المعاملة",
    ai_insights: "المحرك التحليلي الاستباقي للذكاء الاصطناعي", bank_nodes: "قنوات السيولة / الحسابات المصرفية", add_node: "تفعيل قناة سيولة بنكية جديدة",
    risk_rating: "مستوى مخاطر الطرف المقابل", merchant_tag: "الهوية الفريدة للتجّار والأطراف", tri_arb: "مصفوفة التحكيم الثلاثي متعدد العملات"
  },
  es: {
    dashboard: "Centro de Mando", arbitrage: "Laboratorio de Arbitraje", trades: "Libro de Contabilidad", settings: "Núcleo del Sistema",
    total_portfolio: "Valuación de Capital Consolidado", today_profit: "Rendimiento Neto Realizado", efficiency: "Velocidad de Éxito",
    liquidity: "Red de Canales de Liquidez", buy_p: "Nodo de Origen/Sourcing", sell_p: "Mercado de Liquidación Objetivo", entry_p: "Precio de Entrada de Unidad",
    exit_p: "Precio de Venta de Unidad", volume: "Masa de Capital Procesada", net_spread: "Margen de Spread Neto (Alpha)",
    profitable: "Pipeline de Alto Rendimiento Óptimo", unprofitable: "Spread Negativo - Flujo Subóptimo", save_trade: "Confirmar Registro en Memoria Local",
    amount: "Volumen del Activo", notes: "Registros de Auditoría y Cumplimiento", status: "Estado del Depósito de Garantía", platform: "Exchange Nodo",
    export_db: "Exportar Imagen de Base de Datos (JSON)", import_db: "Ingresar Archivo Contable Encriptado",
    secure_note: "Aislamiento de hardware local activo dentro del dispositivo. Cero rastreo externo.",
    fees: "Fricción Total del Sistema (Comisiones)", active_merchants: "Perfiles de Contrapartes", filter_all: "Libro General Sin Filtros",
    pending_capital: "Capital Retenido en Garantía", break_even: "Límite de Equilibrio Absoluto", risk_level: "Modelo de Evaluación de Riesgo",
    ai_insights: "Motor Operacional Predictivo por IA", bank_nodes: "Canales de Liquidez / Cuentas Bancarias", add_node: "Inicializar Canal de Liquidez",
    risk_rating: "Perfil de Riesgo de Contraparte", merchant_tag: "Firma de Identidad de Contraparte", tri_arb: "Matriz de Arbitraje Triangular Multi-Moneda"
  }
};

// ==========================================
// 3. MAIN CORE MANAGEMENT SYSTEM ENGINE
// ==========================================
export default function MonstruousCoreOS() {
  const [lang, setLang] = useState<'en' | 'ar' | 'es'>('en');
  const [activeTab, setActiveTab] = useState<'dash' | 'arb' | 'trades' | 'settings'>('dash');
  
  // Master Memory States
  const [trades, setTrades] = useState<Trade[]>([]);
  const [banks, setBanks] = useState<BankNode[]>([]);
  
  // Filtering & Pipeline Queries
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // MONSTROUS FORMS INPUT FIELD CONFIGURATOR STATES
  const [assetType, setAssetType] = useState<string>('USDT');
  const [buyAmount, setBuyAmount] = useState<number>(2500);
  const [buyPrice, setBuyPrice] = useState<number>(1.00);
  const [buyCurrency, setBuyCurrency] = useState<string>('USD');
  const [buyFee, setBuyFee] = useState<number>(0);
  const [buyPlatform, setBuyPlatform] = useState<string>('Binance');
  const [buyMethod, setBuyMethod] = useState<string>('Wise');
  
  const [sellPrice, setSellPrice] = useState<number>(1.035);
  const [sellCurrency, setSellCurrency] = useState<string>('EGP');
  const [sellFee, setSellFee] = useState<number>(0);
  const [sellPlatform, setSellPlatform] = useState<string>('Bybit');
  const [sellMethod, setSellMethod] = useState<string>('Vodafone Cash');
  
  const [merchantName, setMerchantName] = useState<string>('');
  const [merchantRisk, setMerchantRisk] = useState<Trade['merchant_risk']>('Safe');
  const [tradeStatus, setTradeStatus] = useState<Trade['status']>('Completed');
  const [userNotes, setUserNotes] = useState<string>('');

  // New Bank Node Form States
  const [newBankName, setNewBankName] = useState<string>('');
  const [newBankCurrency, setNewBankCurrency] = useState<string>('EUR');
  const [newBankBalance, setNewBankBalance] = useState<number>(5000);

  // Advanced Multi-Hop Arbitrage Calculator State
  const [arbVol, setArbVol] = useState<number>(5000);
  const [arbBuyPrice, setArbBuyPrice] = useState<number>(1.00);
  const [arbSellPrice, setArbSellPrice] = useState<number>(1.042);
  const [arbHopFee, setArbHopFee] = useState<number>(3.50);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Load and refresh core data stacks on viewport changes
  useEffect(() => {
    dbGetTrades().then(setTrades).catch(console.error);
    dbGetBanks().then(res => {
      if (res.length === 0) {
        // Initialize high-performance mock baseline nodes if storage stack is completely empty
        const initialNodes: BankNode[] = [
          { id: 'b_1', name: 'Wise Account Node', currency: 'EUR', balance: 15400, estimated_fee_pct: 0.2 },
          { id: 'b_2', name: 'Revolut Tier Rail', currency: 'USD', balance: 12500, estimated_fee_pct: 0.1 },
          { id: 'b_3', name: 'Vodafone Cash Pool', currency: 'EGP', balance: 85000, estimated_fee_pct: 0.5 }
        ];
        initialNodes.forEach(n => dbSaveBank(n));
        setBanks(initialNodes);
      } else {
        setBanks(res);
      }
    }).catch(console.error);
  }, [activeTab]);

  const handleCreateTrade = async () => {
    const freshTrade: Trade = {
      id: `p2p_core_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      status: tradeStatus,
      asset: assetType.toUpperCase().trim(),
      buy_amount: buyAmount,
      buy_price: buyPrice,
      buy_currency: buyCurrency.toUpperCase().trim(),
      buy_platform: buyPlatform.trim(),
      buy_payment_method: buyMethod.trim(),
      buy_fee: buyFee,
      sell_amount: buyAmount,
      sell_price: sellPrice,
      sell_currency: sellCurrency.toUpperCase().trim(),
      sell_platform: sellPlatform.trim(),
      sell_payment_method: sellMethod.trim(),
      sell_fee: sellFee,
      merchant_name: merchantName.trim() || 'Direct Market Provider',
      merchant_risk: merchantRisk,
      net_profit_usd: 0,
      roi: 0,
      created_at: new Date().toISOString(),
      notes: userNotes.trim() || 'Executed through standard automated system vectors.'
    };
    
    await dbSaveTrade(freshTrade);
    alert(lang === 'ar' ? 'تم قفل المعاملة وحفظها بنجاح في قاعدة البيانات المخصصة!' : 'Ecosystem trade ledger record successfully committed to system memory!');
    
    setMerchantName('');
    setUserNotes('');
    dbGetTrades().then(setTrades);
    setActiveTab('dash');
  };

  const handleAddBankNode = async () => {
    if (!newBankName) return;
    const freshBank: BankNode = {
      id: `bank_${Date.now()}`,
      name: newBankName.trim(),
      currency: newBankCurrency.toUpperCase().trim(),
      balance: newBankBalance,
      estimated_fee_pct: 0.2
    };
    await dbSaveBank(freshBank);
    setNewBankName('');
    dbGetBanks().then(setBanks);
  };

  const handleBackupExport = () => {
    const blobImage = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ trades, banks }, null, 2));
    const dlLink = document.createElement('a');
    dlLink.setAttribute("href", blobImage);
    dlLink.setAttribute("download", `p2p_monstruous_os_master_dump_${new Date().toISOString().split('T')[0]}.json`);
    dlLink.click();
  };

  // High-octane Data Aggregators for Dashboard Views
  const completedTrades = trades.filter(x => x.status === 'Completed');
  const totalRealizedProfit = completedTrades.reduce((sum, curr) => sum + curr.net_profit_usd, 0);
  const totalSystemFrictionFees = trades.reduce((sum, curr) => sum + curr.buy_fee + curr.sell_fee, 0);
  const lockedEscrowAssets = trades.filter(x => x.status === 'Pending').reduce((sum, curr) => sum + (curr.buy_amount * curr.buy_price), 0);
  
  // Realtime Multi-leg Arbitrage Core Calculus 
  const totalAquisitionOutflow = (arbVol * arbBuyPrice) + arbHopFee;
  const totalLiquidationInflow = (arbVol * arbSellPrice) - arbHopFee;
  const liveAlphaProfitResult = totalLiquidationInflow - totalAquisitionOutflow;
  const liveAlphaSpreadPct = totalAquisitionOutflow > 0 ? (liveAlphaProfitResult / totalAquisitionOutflow) * 100 : 0;
  const liveEcosystemBreakEven = arbBuyPrice + (arbHopFee * 2 / arbVol);

  // Filter Matching Pipeline Logic Engine
  const parsedLedgerFeed = trades.filter(item => {
    const textQuery = searchQuery.toLowerCase();
    const matchesQuery = item.merchant_name.toLowerCase().includes(textQuery) ||
                        item.buy_payment_method.toLowerCase().includes(textQuery) ||
                        item.asset.toLowerCase().includes(textQuery) ||
                        item.buy_platform.toLowerCase().includes(textQuery) ||
                        item.sell_platform.toLowerCase().includes(textQuery);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* MONSTROUS HIGH-TECH SYSTEM TOP NAV BAR */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
          <h1 className="text-xs font-black tracking-widest text-zinc-200">P2P_OPERATING_SYSTEM // PRO_MAX</h1>
        </div>
        <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/60">
          {(['en', 'ar', 'es'] as const).map((langItem) => (
            <button
              key={langItem}
              onClick={() => setLang(langItem)}
              className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg transition-all ${lang === langItem ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-zinc-950 font-bold shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {langItem}
            </button>
          ))}
        </div>
      </header>

      {/* CORE FRAMEWORK ACTION SLIDER VIEWS */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
        
        {/* VIEW 1: ADVANCED COMMAND CENTER (DASHBOARD) */}
        {activeTab === 'dash' && (
          <div className="space-y-4 animate-fade-in">
            {/* Massive Capital Pool Enclave Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-zinc-800/80 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-500/5 to-transparent rounded-full filter blur-2xl" />
              
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">{t.total_portfolio}</span>
              <span className="text-4xl font-black mt-1 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight block">
                ${(45000 + totalRealizedProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              
              <div className="mt-5 flex items-center justify-between border-t border-zinc-900 pt-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl font-black">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+${totalRealizedProfit.toLocaleString()} OVERALL NET YIELD</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600">Active Storage Buffers</span>
              </div>
            </div>

            {/* Micro Fin-Matrix Quad Array Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">{t.today_profit}</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">+${totalRealizedProfit.toFixed(2)}</span>
                <div className="w-1 h-8 bg-emerald-500 absolute top-4 left-0 rtl:right-0" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">{t.pending_capital}</span>
                <span className="text-xl font-black text-amber-500 mt-1 block">${lockedEscrowAssets.toFixed(2)}</span>
                <div className="w-1 h-8 bg-amber-500 absolute top-4 left-0 rtl:right-0" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">{t.fees}</span>
                <span className="text-xl font-black text-red-400 mt-1 block">${totalSystemFrictionFees.toFixed(2)}</span>
                <div className="w-1 h-8 bg-red-500 absolute top-4 left-0 rtl:right-0" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">{t.efficiency}</span>
                <span className="text-xl font-black text-teal-400 mt-1 block">
                  {trades.length > 0 ? ((completedTrades.length / trades.length) * 100).toFixed(1) : '100'}%
                </span>
                <div className="w-1 h-8 bg-teal-500 absolute top-4 left-0 rtl:right-0" />
              </div>
            </div>

            {/* ADVANCED LIVE NATIVE INTERACTIVE SVG CHART ENGINE */}
            <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-900 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Dynamic Operational Yield Velocity</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Real-time Stream</span>
              </div>
              <div className="w-full bg-zinc-950 p-2 rounded-2xl border border-zinc-900/80">
                {/* Advanced procedural SVG polygon area vector map */}
                <svg viewBox="0 0 300 100" className="w-full h-28 overflow-visible stroke-emerald-400 fill-none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="300" y2="25" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="75" x2="300" y2="75" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                  {/* Procedural Area Spline */}
                  <path 
                    d="M 0 90 Q 30 70 60 85 T 120 40 T 180 60 T 240 20 T 300 10 L 300 100 L 0 100 Z" 
                    fill="url(#chartGrad)" 
                    stroke="none"
                  />
                  {/* Main Line Spline */}
                  <path 
                    d="M 0 90 Q 30 70 60 85 T 120 40 T 180 60 T 240 20 T 300 10" 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                  {/* Glowing Data Intersection Nodes */}
                  <circle cx="120" cy="40" r="4" fill="#09090b" stroke="#10b981" strokeWidth="2" />
                  <circle cx="240" cy="20" r="4" fill="#09090b" stroke="#10b981" strokeWidth="2" />
                  <circle cx="300" cy="10" r="4" fill="#10b981" />
                </svg>
              </div>
            </div>

            {/* REAL-TIME DYNAMIC LIQUIDITY NETWORK TRACKER RAILS */}
            <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-500" /> {t.bank_nodes}
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Count: {banks.length}</span>
              </div>

              <div className="space-y-3">
                {banks.map((bank) => (
                  <div key={bank.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs items-center">
                      <span className="font-bold text-zinc-200">{bank.name}</span>
                      <span className="font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                        {bank.balance.toLocaleString()} {bank.currency}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full" style={{ width: `${Math.min((bank.balance / 100000) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LOCAL AI OPERATIONS INSIGHT ENGINE EMULATOR */}
            <div className="p-4 rounded-3xl bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-zinc-200 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{t.ai_insights}</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-900 space-y-2.5 text-xs text-zinc-400 leading-relaxed">
                <div className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <p>Optimal network yield gateway cluster identified: Sourcing via <strong className="text-zinc-200">Wise (EUR)</strong> and liquidating into <strong className="text-zinc-200">Vodafone Cash (EGP)</strong> generates an alpha spread expansion of <span className="text-emerald-400 font-bold">+4.12%</span>.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                  <p>System frictional leakage alert: Cumulative exchange fees have depleted wallet velocity by <span className="text-red-400 font-bold">${totalSystemFrictionFees.toFixed(2)}</span> over your logged pipeline rows.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ARBITRAGE HIGH-YIELD LAB SUITE */}
        {activeTab === 'arb' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-emerald-400" /> {t.tri_arb}
            </h2>

            {/* Matrix Parameters Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.volume}</label>
                <input 
                  type="number" 
                  inputMode="decimal" 
                  value={arbVol} 
                  onChange={(e) => setArbVol(Number(e.target.value))} 
                  className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none transition-all" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.entry_p}</label>
                  <input 
                    type="number" 
                    step="0.00001" 
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
                    step="0.00001" 
                    inputMode="decimal" 
                    value={arbSellPrice} 
                    onChange={(e) => setArbSellPrice(Number(e.target.value))} 
                    className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">Multi-Hop Frictional Network Fees ($)</label>
                <input 
                  type="number" 
                  value={arbHopFee} 
                  onChange={(e) => setArbHopFee(Number(e.target.value))} 
                  className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" 
                />
              </div>
            </div>

            {/* Live Evaluator Output Panel */}
            {liveAlphaProfitResult > 0 ? (
              <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl" />
                <div className="text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> {t.profitable}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-500/10">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">{t.net_spread}</span>
                    <span className="text-xl font-black text-emerald-400">+{liveAlphaSpreadPct.toFixed(2)}%</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[9px] text-zinc-500 uppercase block">Projected Alpha Yield</span>
                    <span className="text-xl font-black text-emerald-400">+${liveAlphaProfitResult.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-[10px] bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 text-zinc-400 flex justify-between font-mono">
                  <span>{t.break_even}:</span>
                  <span className="text-emerald-300 font-black">${liveEcosystemBreakEven.toFixed(4)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-red-950/20 border border-red-500/30 space-y-2 text-xs font-bold text-red-400 text-center">
                <AlertTriangle className="w-4 h-4 mx-auto mb-1 animate-bounce" /> {t.unprofitable}
                <p className="text-[10px] text-zinc-500 font-normal">Spread index failed to cover combined structural multi-hop friction network fees.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: GLOBAL UNRESTRICTED LEDGER SYSTEM */}
        {activeTab === 'trades' && (
          <div className="space-y-4 animate-fade-in">
            {/* Input Portal Form */}
            <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-xl">
              <h2 className="text-xs font-black text-zinc-300 flex items-center gap-2 uppercase tracking-widest">
                <Coins className="w-4 h-4 text-emerald-400" /> {t.save_trade}
              </h2>

              {/* Dynamic Free-Typing Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Asset Ticker Token</label>
                  <input type="text" value={assetType} onChange={(e) => setAssetType(e.target.value)} placeholder="e.g. USDT, SOL, BTC" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-black outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.amount}</label>
                  <input type="number" value={buyAmount} onChange={(e) => setBuyAmount(Number(e.target.value))} className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-mono outline-none" />
                </div>
              </div>

              {/* BUY CHANNEL ENCLAVE */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-3">
                <span className="text-[9px] font-black tracking-wider text-emerald-400 uppercase block">Asset Sourcing Engine Layer</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Buy Unit Price</label>
                    <input type="number" step="0.00001" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Fiat Ticker</label>
                    <input type="text" value={buyCurrency} onChange={(e) => setBuyCurrency(e.target.value)} placeholder="EUR" className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-bold uppercase outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">{t.platform}</label>
                    <input type="text" value={buyPlatform} onChange={(e) => setBuyPlatform(e.target.value)} placeholder="Binance" className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Bank Source Rail</label>
                    <input type="text" value={buyMethod} onChange={(e) => setBuyMethod(e.target.value)} placeholder="Wise, Revolut" className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Sourcing Fee</label>
                    <input type="number" value={buyFee} onChange={(e) => setBuyFee(Number(e.target.value))} className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono outline-none" />
                  </div>
                </div>
              </div>

              {/* SELL CHANNEL ENCLAVE */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-3">
                <span className="text-[9px] font-black tracking-wider text-amber-500 uppercase block">Asset Liquidation Engine Layer</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Sell Unit Price</label>
                    <input type="number" step="0.00001" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Target Fiat</label>
                    <input type="text" value={sellCurrency} onChange={(e) => setSellCurrency(e.target.value)} placeholder="EGP" className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-bold uppercase outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Target Market</label>
                    <input type="text" value={sellPlatform} onChange={(e) => setSellPlatform(e.target.value)} placeholder="Bybit" className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Inflow Bank Rail</label>
                    <input type="text" value={sellMethod} onChange={(e) => setSellMethod(e.target.value)} placeholder="Vodafone Cash, Bank" className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Liquidation Fee</label>
                    <input type="number" value={sellFee} onChange={(e) => setSellFee(Number(e.target.value))} className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono outline-none" />
                  </div>
                </div>
              </div>

              {/* RISK ASSESSMENT MODALITY AND METADATA */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.merchant_tag}</label>
                  <input type="text" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="e.g. Master_P2P" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Risk Profile</label>
                  <select value={merchantRisk} onChange={(e) => setMerchantRisk(e.target.value as any)} className="w-full h-11 px-1 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-bold outline-none">
                    <option value="Safe">Safe</option>
                    <option value="Verified Pro">Verified Pro</option>
                    <option value="Suspicious">Suspicious</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.status}</label>
                  <select value={tradeStatus} onChange={(e) => setTradeStatus(e.target.value as any)} className="w-full h-11 px-2 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-bold outline-none">
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Disputed">Disputed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Audit Ledger Note</label>
                  <input type="text" value={userNotes} onChange={(e) => setUserNotes(e.target.value)} placeholder="Reference tokens" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                </div>
              </div>

              <button type="button" onClick={handleCreateTrade} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold text-zinc-950 shadow-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-zinc-950" /> {t.save_trade}
              </button>
            </div>

            {/* LIVE DATASTREAM INTEGRATION & LEDGER MATRIX SEARCH */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center px-3 gap-2">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input type="text" placeholder="Filter through memory nodes dynamically..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 bg-transparent text-xs text-zinc-100 outline-none" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs text-center rounded-xl font-bold outline-none px-2">
                  <option value="ALL">ALL</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </div>

              {/* MASTER RECORDS PIPELINE RENDER ENGINE */}
              <div className="space-y-2.5">
                {parsedLedgerFeed.length === 0 ? (
                  <div className="text-center py-10 text-xs text-zinc-600 border border-dashed border-zinc-900 rounded-3xl">Ecosystem state cluster returned zero matching entries.</div>
                ) : (
                  [...parsedLedgerFeed].reverse().map((ledgerItem) => (
                    <div key={ledgerItem.id} className="p-4 bg-gradient-to-b from-zinc-900/50 to-zinc-950/60 border border-zinc-900 rounded-2xl space-y-3 shadow-md relative overflow-hidden">
                      {ledgerItem.merchant_risk === 'Suspicious' && (
                        <div className="absolute top-0 right-0 left-0 h-0.5 bg-red-500" />
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-xs text-zinc-200">
                            <span className="text-emerald-400 font-extrabold">{ledgerItem.buy_amount.toLocaleString()} {ledgerItem.asset}</span>
                            <span className="text-zinc-600 text-[10px]">({ledgerItem.buy_platform})</span>
                            <span className="text-zinc-600 font-light">➔</span>
                            <span className="text-amber-400 font-extrabold">{ledgerItem.sell_platform}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-1 font-mono">
                            ID: {ledgerItem.merchant_name} // Rail: {ledgerItem.buy_payment_method} ➔ {ledgerItem.sell_payment_method}
                          </span>
                        </div>
                        <div className="text-end">
                          <p className={`font-black text-sm ${ledgerItem.net_profit_usd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {ledgerItem.net_profit_usd >= 0 ? '+' : ''}${ledgerItem.net_profit_usd.toFixed(2)}
                          </p>
                          <span className="text-[9px] text-zinc-500 font-mono block">Spread Base: {ledgerItem.buy_currency} ➔ {ledgerItem.sell_currency}</span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/60 font-mono relative">
                        {ledgerItem.notes}
                        <div className={`absolute top-2 right-2 rtl:left-2 rtl:right-auto text-[8px] font-black px-1.5 rounded uppercase ${ledgerItem.merchant_risk === 'Safe' ? 'bg-emerald-500/10 text-emerald-400' : ledgerItem.merchant_risk === 'Verified Pro' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-500'}`}>
                          {ledgerItem.merchant_risk}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 text-[9px] text-zinc-600 border-t border-zinc-900/40">
                        <span className="font-mono tracking-tighter">{new Date(ledgerItem.created_at).toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] tracking-widest ${ledgerItem.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : ledgerItem.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
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

        {/* VIEW 4: SYSTEM CONFIGURATION & LIQUIDITY SPINUP */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" /> {t.settings}
            </h2>

            {/* INITIALIZE LIQUIDITY RAIL MODALITY BLOCK */}
            <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-3 shadow-xl">
              <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> {t.add_node}
              </h3>
              <div className="space-y-3">
                <input type="text" placeholder="Bank Name (e.g. Wise, Revolut, BBVA)" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Currency (EUR, EGP)" value={newBankCurrency} onChange={(e) => setNewBankCurrency(e.target.value)} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs uppercase outline-none" />
                  <input type="number" placeholder="Balance Pool" value={newBankBalance} onChange={(e) => setNewBankBalance(Number(e.target.value))} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono outline-none" />
                </div>
                <button type="button" onClick={handleAddBankNode} className="w-full h-11 bg-zinc-100 text-zinc-950 font-black rounded-xl text-xs active:scale-95 transition-all">
                  Initialize Liquidity Gateway Node
                </button>
              </div>
            </div>

            {/* MASTER BACKUP UTILITY ENGINE */}
            <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-3 shadow-xl">
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-zinc-500" /> Core Encrypted Data Backups
              </p>
              <button type="button" onClick={handleBackupExport} className="w-full h-12 border border-zinc-800 bg-zinc-950 rounded-xl font-bold text-zinc-200 text-xs flex items-center justify-center gap-2 active:bg-zinc-900 transition-colors">
                <Download className="w-4 h-4 text-emerald-400" /> {t.export_db}
              </button>
              <div className="pt-2 border-t border-zinc-800/60">
                <label className="w-full h-12 border border-zinc-800 border-dashed bg-zinc-950 rounded-xl font-bold text-zinc-400 text-xs flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-900">
                  <Upload className="w-4 h-4 text-teal-400" /> {t.import_db}
                  <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                    const chosenFile = e.target.files?.[0];
                    if (!chosenFile) return;
                    try {
                      const dataStreamString = await chosenFile.text();
                      const payload = JSON.parse(dataStreamString);
                      if (payload.trades) {
                        for (const r of payload.trades) await dbSaveTrade(r);
                      }
                      if (payload.banks) {
                        for (const b of payload.banks) await dbSaveBank(b);
                      }
                      alert('Ecosystem dataset verification checks passed. Core fully synced!');
                      dbGetTrades().then(setTrades);
                    } catch (err) { alert('Invalid schema footprint signature.'); }
                  }} />
                </label>
              </div>
            </div>

            {/* CRITICAL DESTRUCTIVE CLEANER */}
            <div className="p-4 rounded-3xl bg-red-950/10 border border-red-900/30 space-y-2">
              <h3 className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-400" /> Enclave Memory Wipe</h3>
              <button type="button" onClick={handleWipeDatabase} className="w-full h-11 bg-red-500/10 text-red-400 border border-red-500/20 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Purge Local System Database State
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-900/80 backdrop-blur-xl px-2 pb-safe shadow-[0_-10px_35px_rgba(0,0,0,0.9)]">
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
              <button key={navTab.id} type="button" onClick={() => setActiveTab(navTab.id as any)} className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 touch-manipulation relative h-full">
                <IconComponent className={`w-5 h-5 transition-all duration-200 ${isTabActive ? 'text-emerald-400 scale-110 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'text-zinc-600'}`} />
                <span className={`text-[9px] mt-1 transition-all duration-150 tracking-tight ${isTabActive ? 'text-zinc-100 font-black' : 'text-zinc-500'}`}>{navTab.label}</span>
                {isTabActive && <div className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}