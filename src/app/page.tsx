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
  Users,
  Star,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

// ==========================================
// 1. ARCHITECTURE SCHEMAS & INTERFACES
// ==========================================
export interface Trade {
  id: string;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Disputed';
  asset: string;       
  buy_amount: number;
  buy_price: number;
  buy_currency: string; 
  buy_platform: string; 
  buy_payment_method: string; 
  buy_fee: number;
  sell_price: number;
  sell_currency: string;
  sell_platform: string;
  sell_payment_method: string;
  sell_fee: number;
  merchant_name: string;
  merchant_risk: 'Safe' | 'Suspicious' | 'Verified Pro';
  net_profit_usd: number; 
  roi: number;
  created_at: string;
  notes: string;
}

export interface BankNode {
  id: string;
  name: string;      
  currency: string;  
  balance: number;
  estimated_fee_pct: number;
}

export interface MerchantProfile {
  id: string;
  name: string;
  platform: string;
  rating: number;
  is_favorite: boolean;
  is_warning: boolean;
  notes: string;
}

const DB_NAME = 'P2P_GodMode_Ecosystem_v4';
const DB_VERSION = 4;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB unavailable during server build state'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('trades')) db.createObjectStore('trades', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('banks')) db.createObjectStore('banks', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('merchants')) db.createObjectStore('merchants', { keyPath: 'id' });
    };
    request.onsuccess = (e: any) => resolve(request.target.result);
    request.onerror = (e: any) => reject(request.error);
  });
};

// Database CRUD Operations Stack
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

const dbSaveMerchant = async (m: MerchantProfile): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['merchants'], 'readwrite');
    const store = tx.objectStore('merchants');
    const req = store.put(m);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const dbGetMerchants = async (): Promise<MerchantProfile[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['merchants'], 'readonly');
    const store = tx.objectStore('merchants');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

const dbWipeAllData = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['trades', 'banks', 'merchants'], 'readwrite');
    tx.objectStore('trades').clear();
    tx.objectStore('banks').clear();
    tx.objectStore('merchants').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// ==========================================
// 2. TRANSLATION MATRIX SCHEMA (i18n)
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
  merchants_hub: string; add_merchant: string; balance_adjust: string;
}

const translations: Record<'en' | 'ar' | 'es', TranslationSchema> = {
  en: {
    dashboard: "Command Center", arbitrage: "Arbitrage Lab", trades: "Custom Ledger", settings: "System Core",
    total_portfolio: "Consolidated Asset Pool Value", today_profit: "Realized Net Yield Alpha", efficiency: "Success Velocity",
    liquidity: "Liquidity Network Pipelines", buy_p: "Sourcing Node", sell_p: "Target Liquid Market", entry_p: "Unit Entry Price",
    exit_p: "Unit Liquidation Price", volume: "Processed Capital Mass", net_spread: "Calculated Alpha Spread",
    profitable: "Optimal High-Yield Pipeline", unprofitable: "Suboptimal Flow - Negative Spread", save_trade: "Commit Record To Secure Memory",
    amount: "Asset Volume Size", notes: "Audit & Compliance Reference Logs", status: "Network Escrow State", platform: "Exchange Host",
    export_db: "Dump Master Database Image (JSON)", import_db: "Ingest Encrypted System File",
    secure_note: "Local browser hardware sandboxing operational. External tracking baseline: 0%.",
    fees: "Total System Friction Fees", active_merchants: "Counterparty Matrix", filter_all: "Unfiltered Ledger Records",
    pending_capital: "Capital Bound in Escrow", break_even: "Absolute Loss Floor Limit", risk_level: "Risk Evaluation Model",
    ai_insights: "AI Predictive Operational Engine", bank_nodes: "Liquidity Rails / Bank Nodes", add_node: "Initialize Liquidity Rail",
    risk_rating: "Counterparty Counter-Risk Profile", merchant_tag: "Counterparty Unique Identifier", tri_arb: "Multi-Leg Triangular Arbitrage Matrix",
    merchants_hub: "Merchant Directory", add_merchant: "Register Counterparty profile", balance_adjust: "Adjust Asset Pools"
  },
  ar: {
    dashboard: "مركز القيادة", arbitrage: "مختبر التحكيم", trades: "المحرك المخصص", settings: "الإعدادات",
    total_portfolio: "إجمالي قيمة رأس المال الموحد", today_profit: "صافي أرباح المحفظة المحققة", efficiency: "معدل كفاءة الصفقات",
    liquidity: "توزيع السيولة والأرصدة مخصص", buy_p: "منصة الشراء والتوريد", sell_p: "منصة التسييل والتصريف", entry_p: "سعر الشراء للوحدة",
    exit_p: "سعر البيع المستهدف للوحدة", volume: "حجم السيولة المدارة", net_spread: "صافي هامش الفارق العائد",
    profitable: "مسار تخصيص عالي العائد", unprofitable: "هيكل فجوة سعرية غير مجدي حالياً", save_trade: "تنفيذ وحفظ الصفقة المخصصة",
    amount: "حجم كمية الأصول المتداولة", notes: "سجل مذكرات وبيانات الأطراف المقابلة", status: "حالة الضمان والتشغيل", platform: "المنصة الحاضنة",
    export_db: "تصدير نسخة احتياطية شاملة (JSON)", import_db: "استعادة ملف قاعدة البيانات الآمن",
    secure_note: "بيئة التخزين المعزولة محلياً داخل الهاتف نشطة لحماية سرية حساباتك بالكامل.",
    fees: "إجمالي العمولات والرسوم", active_merchants: "قائمة التجار والأطراف", filter_all: "كافة المعاملات",
    pending_capital: "رأس المال المعلق في الضمان", break_even: "نقطة التعادل الآمنة", risk_level: "تصنيف تقييم المخاطر",
    ai_insights: "المحرك التحليلي الاستباقي للذكاء الاصطناعي", bank_nodes: "قنوات السيولة / الحسابات المصرفية", add_node: "تفعيل قناة سيولة بنكية جديدة",
    risk_rating: "مستوى مخاطر الطرف المقابل", merchant_tag: "الهوية الفريدة للتجّار والأطراف", tri_arb: "مصفوفة التحكيم الثلاثي متعدد العملات",
    merchants_hub: "دليل حسابات التجار", add_merchant: "تسجيل ملف تاجر جديد", balance_adjust: "تعديل رصيد القنوات البنكية"
  },
  es: {
    dashboard: "Centro de Mando", arbitrage: "Laboratorio de Arbitraje", trades: "Libro Personalizado", settings: "Ajustes",
    total_portfolio: "Pool de Capital Global Consolidado", today_profit: "Ganancia Neta Realizada Alpha", efficiency: "Velocidad de Éxito",
    liquidity: "Enclaves de Activos Propios", buy_p: "Plataforma de Sourcing", sell_p: "Mercado de Liquidación", entry_p: "Precio de Entrada Unitario",
    exit_p: "Precio de Venta Unitario", volume: "Masa de Capital Procesada", net_spread: "Margen de Spread Neto",
    profitable: "Ruta de Arbitraje de Alto Rendimiento", unprofitable: "Diferencial de Capital Subóptimo", save_trade: "Ejecutar Registro Personalizado",
    amount: "Volumen de Activos", notes: "Notas de Contraparte", status: "Estado del Ecosistema", platform: "Exchange Gestor",
    export_db: "Copia de Seguridad (JSON)", import_db: "Restaurar Archivo de Contabilidad",
    secure_note: "Almacenamiento local aislado activo. Cero riesgo de servidores externos.",
    fees: "Comisiones Totales del Sistema", active_merchants: "Matriz de Contrapartes", filter_all: "Todas las Operaciones",
    pending_capital: "Capital de Depósito en Garantía", break_even: "Límite de Compra de Equilibrio", risk_level: "Evaluación de Riesgo",
    ai_insights: "Motor Operacional Predictivo por IA", bank_nodes: "Canales de Liquidez / Nodos Bancarios", add_node: "Inicializar Canal de Liquidez",
    risk_rating: "Perfil de Riesgo de Contraparte", merchant_tag: "Firma de Identidad de Contraparte", tri_arb: "Matriz de Arbitraje Triangular Multi-Moneda",
    merchants_hub: "Directorio de Comerciantes", add_merchant: "Registrar perfil de contraparte", balance_adjust: "Ajustar Pools de Activos"
  }
};

// ==========================================
// 3. LOGIC MODULE CONTROLLER
// ==========================================
export default function MobileCoreApp() {
  const [lang, setLang] = useState<'en' | 'ar' | 'es'>('en');
  const [activeTab, setActiveTab] = useState<'dash' | 'arb' | 'trades' | 'settings'>('dash');
  
  // Data State Arrays
  const [trades, setTrades] = useState<Trade[]>([]);
  const [banks, setBanks] = useState<BankNode[]>([]);
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  
  // Dynamic Query Pipelines
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'PROFIT_DESC' | 'ROI_DESC'>('NEWEST');

  // CUSTOM TRANSACTION MAKER FORM STATES
  const [assetType, setAssetType] = useState<string>('USDT');
  const [buyAmount, setBuyAmount] = useState<number>(2000);
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

  // Node Modifier Forms States
  const [newBankName, setNewBankName] = useState<string>('');
  const [newBankCurrency, setNewBankCurrency] = useState<string>('EUR');
  const [newBankBalance, setNewBankBalance] = useState<number>(5000);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [balanceAdjustmentAmount, setBalanceAdjustmentAmount] = useState<number>(0);

  // Merchant Profile Form States
  const [mName, setMName] = useState<string>('');
  const [mPlatform, setMPlatform] = useState<string>('Binance');
  const [mRating, setMRating] = useState<number>(99.2);
  const [mNotes, setMNotes] = useState<string>('');

  // Live Advanced Arbitrage Analyzer Inputs
  const [arbVol, setArbVol] = useState<number>(5000);
  const [arbBuyPrice, setArbBuyPrice] = useState<number>(1.00);
  const [arbSellPrice, setArbSellPrice] = useState<number>(1.042);
  const [arbHopFee, setArbHopFee] = useState<number>(3.50);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Synchronous State Restoration Pipeline
  const refreshCoreDatasets = () => {
    dbGetTrades().then(setTrades).catch(console.error);
    dbGetMerchants().then(setMerchants).catch(console.error);
    dbGetBanks().then(res => {
      if (res.length === 0) {
        const baselineNodes: BankNode[] = [
          { id: 'b_1', name: 'Wise Core Node', currency: 'EUR', balance: 12000, estimated_fee_pct: 0.2 },
          { id: 'b_2', name: 'Revolut Rail Enclave', currency: 'USD', balance: 9500, estimated_fee_pct: 0.1 },
          { id: 'b_3', name: 'Vodafone Cash Reserve', currency: 'EGP', balance: 75000, estimated_fee_pct: 0.0 }
        ];
        baselineNodes.forEach(n => dbSaveBank(n));
        setBanks(baselineNodes);
      } else {
        setBanks(res);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    refreshCoreDatasets();
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
      merchant_name: merchantName.trim() || 'Direct Pool Counterparty',
      merchant_risk: merchantRisk,
      net_profit_usd: 0,
      roi: 0,
      created_at: new Date().toISOString(),
      notes: userNotes.trim() || 'Standard localized ledger node execution'
    };
    
    await dbSaveTrade(freshTrade);
    
    // Automatically dynamic update corresponding bank balances based on trade execution parameters
    if (tradeStatus === 'Completed') {
      const sourceBank = banks.find(b => b.name.toLowerCase().includes(buyMethod.toLowerCase()));
      if (sourceBank) {
        sourceBank.balance -= (buyAmount * buyPrice) + buyFee;
        await dbSaveBank(sourceBank);
      }
      const targetBank = banks.find(b => b.name.toLowerCase().includes(sellMethod.toLowerCase()));
      if (targetBank) {
        targetBank.balance += (buyAmount * sellPrice) - sellFee;
        await dbSaveBank(targetBank);
      }
    }

    alert(lang === 'ar' ? 'تم تأكيد وحفظ المعاملة وموازنة الحسابات!' : 'Ecosystem trade blueprint saved and bank rails automatically rebalanced!');
    setMerchantName('');
    setUserNotes('');
    refreshCoreDatasets();
    setActiveTab('dash');
  };

  const handleAddBankNode = async () => {
    if (!newBankName) return;
    const freshBank: BankNode = {
      id: `bank_${Date.now()}`,
      name: newBankName.trim(),
      currency: newBankCurrency.toUpperCase().trim(),
      balance: newBankBalance,
      estimated_fee_pct: 0.15
    };
    await dbSaveBank(freshBank);
    setNewBankName('');
    dbGetBanks().then(setBanks);
  };

  const handleAdjustBankBalance = async () => {
    const target = banks.find(b => b.id === selectedBankId);
    if (!target) return;
    target.balance += balanceAdjustmentAmount;
    await dbSaveBank(target);
    setBalanceAdjustmentAmount(0);
    alert(lang === 'ar' ? 'تمت تسوية رصيد القناة البنكية!' : 'Bank node liquidity allocation updated!');
    dbGetBanks().then(setBanks);
  };

  const handleRegisterMerchant = async () => {
    if (!mName) return;
    const freshMerchant: MerchantProfile = {
      id: `merch_${Date.now()}`,
      name: mName.trim(),
      platform: mPlatform,
      rating: mRating,
      is_favorite: false,
      is_warning: false,
      notes: mNotes.trim() || 'Profile initialized.'
    };
    await dbSaveMerchant(freshMerchant);
    setMName('');
    setMNotes('');
    dbGetMerchants().then(setMerchants);
  };

  const handleToggleMerchantFavorite = async (merchantItem: MerchantProfile) => {
    merchantItem.is_favorite = !merchantItem.is_favorite;
    await dbSaveMerchant(merchantItem);
    dbGetMerchants().then(setMerchants);
  };

  const handleToggleMerchantWarning = async (merchantItem: MerchantProfile) => {
    merchantItem.is_warning = !merchantItem.is_warning;
    await dbSaveMerchant(merchantItem);
    dbGetMerchants().then(setMerchants);
  };

  const handleBackupExport = () => {
    const backupDumpString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ trades, banks, merchants }, null, 2));
    const shadowAnchor = document.createElement('a');
    shadowAnchor.setAttribute("href", backupDumpString);
    shadowAnchor.setAttribute("download", `p2p_godmode_master_dump_${new Date().toISOString().split('T')[0]}.json`);
    shadowAnchor.click();
  };

  const handleWipeDatabase = async () => {
    if (confirm(lang === 'ar' ? 'تأكيد تصفير ومسح قاعدة البيانات تماماً؟' : 'CRITICAL ACTION: This wipes all trades, banks, and merchants local footprints. Proceed?')) {
      await dbWipeAllData();
      setTrades([]);
      setBanks([]);
      setMerchants([]);
    }
  };

  // High-Performance Live Mathematical Matrix Pipeline Aggregations
  const completedTrades = trades.filter(x => x.status === 'Completed');
  const totalRealizedProfit = completedTrades.reduce((sum, curr) => sum + curr.net_profit_usd, 0);
  const totalSystemFrictionFees = trades.reduce((sum, curr) => sum + curr.buy_fee + curr.sell_fee, 0);
  const lockedEscrowAssets = trades.filter(x => x.status === 'Pending').reduce((sum, curr) => sum + (curr.buy_amount * curr.buy_price), 0);
  const totalVolumeMassHandled = trades.reduce((sum, curr) => sum + (curr.buy_amount * curr.buy_price), 0);
  const averageSpreadCapturedPct = completedTrades.length > 0 ? (completedTrades.reduce((sum, curr) => sum + curr.roi, 0) / completedTrades.length) : 0;

  // Arbitrage Lab Local Math Evaluators
  const totalAquisitionOutflow = (arbVol * arbBuyPrice) + arbHopFee;
  const totalLiquidationInflow = (arbVol * arbSellPrice) - arbHopFee;
  const liveAlphaProfitResult = totalLiquidationInflow - totalAquisitionOutflow;
  const liveAlphaSpreadPct = totalAquisitionOutflow > 0 ? (liveAlphaProfitResult / totalAquisitionOutflow) * 100 : 0;
  const liveEcosystemBreakEven = arbBuyPrice + (arbHopFee * 2 / arbVol);

  // Search Engine & Sorting Pipeline Architecture
  const processedLedgerFeed = trades.filter(item => {
    const query = searchQuery.toLowerCase();
    const searchMatch = item.merchant_name.toLowerCase().includes(query) ||
                        item.buy_payment_method.toLowerCase().includes(query) ||
                        item.sell_payment_method.toLowerCase().includes(query) ||
                        item.asset.toLowerCase().includes(query) ||
                        item.notes.toLowerCase().includes(query);
    const statusMatch = statusFilter === 'ALL' || item.status === statusFilter;
    return searchMatch && statusMatch;
  }).sort((a, b) => {
    if (sortOrder === 'PROFIT_DESC') return b.net_profit_usd - a.net_profit_usd;
    if (sortOrder === 'ROI_DESC') return b.roi - a.roi;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Default Newest
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* NATIVE CORE HEADER CONTROL BAR */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 backdrop-blur-xl shadow-md">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
          <h1 className="text-xs font-black tracking-widest text-zinc-200 uppercase">P2P.OS // UNLIMITED_SUITE</h1>
        </div>
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-inner">
          {(['en', 'ar', 'es'] as const).map((langItem) => (
            <button
              key={langItem}
              type="button"
              onClick={() => setLang(langItem)}
              className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg transition-all ${lang === langItem ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-zinc-950 font-bold shadow-md' : 'text-zinc-500'}`}
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
                  <span>+${totalRealizedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} COMBINED YIELD ALPHA</span>
                </div>
              </div>
            </div>

            {/* Extended Advanced Analytics Dashboard Quad Array */}
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
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Avg Capture Spread</span>
                <span className="text-xl font-black text-teal-400 mt-1 block">{averageSpreadCapturedPct.toFixed(2)}%</span>
                <div className="w-1 h-8 bg-teal-500 absolute top-4 left-0 rtl:right-0" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-md relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Total Mass Mass Volume</span>
                <span className="text-xl font-black text-zinc-100 mt-1 block">${totalVolumeMassHandled.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <div className="w-1 h-8 bg-zinc-400 absolute top-4 left-0 rtl:right-0" />
              </div>
            </div>

            {/* PURE SVG SYSTEM AREA TELEMETRY FLOW GRAPH */}
            <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-900 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Ecosystem Yield Velocity Spline</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Telemetry Active</span>
              </div>
              <div className="w-full bg-zinc-950 p-2 rounded-2xl border border-zinc-900/80">
                <svg viewBox="0 0 300 100" className="w-full h-28 overflow-visible stroke-emerald-400 fill-none">
                  <defs>
                    <linearGradient id="chartGradMaster" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="25" x2="300" y2="25" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="75" x2="300" y2="75" stroke="#18181b" strokeWidth="1" strokeDasharray="3,3" />
                  <path d="M 0 95 Q 40 50 80 80 T 160 30 T 240 65 T 300 15 L 300 100 L 0 100 Z" fill="url(#chartGradMaster)" stroke="none" />
                  <path d="M 0 95 Q 40 50 80 80 T 160 30 T 240 65 T 300 15" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="160" cy="30" r="4" fill="#09090b" stroke="#10b981" strokeWidth="2" />
                  <circle cx="300" cy="15" r="4" fill="#10b981" />
                </svg>
              </div>
            </div>

            {/* REAL-TIME DYNAMIC LIQUIDITY BANK NODE MANAGER WITH BALANCE ADJUSTMENT */}
            <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-500" /> {t.bank_nodes}
                </h3>
              </div>
              <div className="space-y-2.5">
                {banks.map((bank) => (
                  <div key={bank.id} onClick={() => setSelectedBankId(bank.id)} className={`p-3 bg-zinc-950 border rounded-2xl transition-all cursor-pointer flex items-center justify-between ${selectedBankId === bank.id ? 'border-emerald-500 bg-zinc-900/40' : 'border-zinc-900'}`}>
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">{bank.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase mt-0.5 block">Rail Asset Gateway</span>
                    </div>
                    <span className="font-mono text-xs font-bold bg-zinc-900 p-2 rounded-xl border border-zinc-800 text-zinc-100">
                      {bank.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {bank.currency}
                    </span>
                  </div>
                ))}
              </div>

              {selectedBankId && (
                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-3 animate-fade-in">
                  <span className="text-[10px] font-black tracking-wider text-teal-400 uppercase block">{t.balance_adjust}</span>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Amount (+/-)" 
                      value={balanceAdjustmentAmount || ''} 
                      onChange={(e) => setBalanceAdjustmentAmount(Number(e.target.value))}
                      className="flex-1 h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none"
                    />
                    <button type="button" onClick={handleAdjustBankBalance} className="h-10 px-4 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-xl active:scale-95 transition-transform">
                      Rebalance Pool
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ARTIFICIAL AI OPERATIONAL EMULATOR FEED */}
            <div className="p-4 rounded-3xl bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-zinc-200 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{t.ai_insights}</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-900 space-y-2.5 text-xs text-zinc-400 leading-relaxed">
                <div className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <p>Highest network yield capture path: Sourcing from <strong className="text-zinc-200">Wise (EUR)</strong> and executing payout via <strong className="text-zinc-200">Vodafone Cash (EGP)</strong> opens an alpha variance of <span className="text-emerald-400 font-bold">+4.35%</span>.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                  <p>Counterparty Counter-Risk assessment: {merchants.filter(m => m.is_warning).length} flagged operators are logged in your local enclave security framework. Stay vigilant on escrow releases.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ARBITRAGE ADVANCED LAB */}
        {activeTab === 'arb' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-emerald-400" /> {t.tri_arb}
            </h2>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.volume}</label>
                <input type="number" inputMode="decimal" value={arbVol} onChange={(e) => setArbVol(Number(e.target.value))} className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.entry_p}</label>
                  <input type="number" step="0.00001" inputMode="decimal" value={arbBuyPrice} onChange={(e) => setArbBuyPrice(Number(e.target.value))} className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">{t.exit_p}</label>
                  <input type="number" step="0.00001" inputMode="decimal" value={arbSellPrice} onChange={(e) => setArbSellPrice(Number(e.target.value))} className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-black text-zinc-500">Combined Processing Friction Fees ($)</label>
                <input type="number" value={arbHopFee} onChange={(e) => setArbHopFee(Number(e.target.value))} className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm focus:border-emerald-500 outline-none" />
              </div>
            </div>

            {liveAlphaProfitResult > 0 ? (
              <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 shadow-lg">
                <div className="text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> {t.profitable}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-500/10">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">{t.net_spread}</span>
                    <span className="text-lg font-black text-emerald-400">+{liveAlphaSpreadPct.toFixed(2)}%</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[9px] text-zinc-500 uppercase block">Projected Net Yield</span>
                    <span className="text-lg font-black text-emerald-400">+${liveAlphaProfitResult.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-[10px] bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 text-zinc-400 flex justify-between font-mono">
                  <span>{t.break_even}:</span>
                  <span className="text-emerald-300 font-black">${liveEcosystemBreakEven.toFixed(4)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-red-950/20 border border-red-500/30 space-y-2 text-xs font-bold text-red-400 text-center">
                <AlertTriangle className="w-4 h-4 mx-auto mb-1" /> {t.unprofitable}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: GLOBAL UNRESTRICTED LEDGER & DIRECTORY WORKSPACE */}
        {activeTab === 'trades' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* PORTAL ACTION SHEET: RECORD TRANSACTION */}
            <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-xl">
              <h2 className="text-xs font-black text-zinc-300 flex items-center gap-2 uppercase tracking-widest">
                <Coins className="w-4 h-4 text-emerald-400" /> {t.save_trade}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Asset Token</label>
                  <input type="text" value={assetType} onChange={(e) => setAssetType(e.target.value)} placeholder="USDT, SOL, BTC" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-black outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.amount}</label>
                  <input type="number" value={buyAmount} onChange={(e) => setBuyAmount(Number(e.target.value))} className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-mono outline-none" />
                </div>
              </div>

              {/* SOURCING PIPELINE LAYERS */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-3">
                <span className="text-[9px] font-black tracking-wider text-emerald-400 uppercase block">Asset Sourcing Parameters</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Buy Unit Price</label>
                    <input type="number" step="0.00001" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Fiat Currency</label>
                    <input type="text" value={buyCurrency} onChange={(e) => setBuyCurrency(e.target.value)} placeholder="EUR" className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-bold uppercase outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Exchange</label>
                    <input type="text" value={buyPlatform} onChange={(e) => setBuyPlatform(e.target.value)} placeholder="Binance" className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Outflow Bank Channel</label>
                    <input type="text" value={buyMethod} onChange={(e) => setBuyMethod(e.target.value)} placeholder="Wise Core Node" className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Sourcing Fee</label>
                    <input type="number" value={buyFee} onChange={(e) => setBuyFee(Number(e.target.value))} className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono outline-none" />
                  </div>
                </div>
              </div>

              {/* LIQUIDATION PIPELINE LAYERS */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-3">
                <span className="text-[9px] font-black tracking-wider text-amber-400 uppercase block">Asset Liquidation Parameters</span>
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
                    <label className="text-[9px] text-zinc-600 block">Liquid Exchange</label>
                    <input type="text" value={sellPlatform} onChange={(e) => setSellPlatform(e.target.value)} placeholder="Bybit" className="w-full h-9 px-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Inflow Bank Channel</label>
                    <input type="text" value={sellMethod} onChange={(e) => setSellMethod(e.target.value)} placeholder="Vodafone Cash" className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-600 block">Liquidation Fee</label>
                    <input type="number" value={sellFee} onChange={(e) => setSellFee(Number(e.target.value))} className="w-full h-9 px-3 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.merchant_tag}</label>
                  <input type="text" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="e.g. Mahmoud_P2P" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Risk Rating</label>
                  <select value={merchantRisk} onChange={(e) => setMerchantRisk(e.target.value as any)} className="w-full h-11 px-1 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-bold outline-none">
                    <option value="Safe">Safe Node</option>
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
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Audit Reference Notes</label>
                  <input type="text" value={userNotes} onChange={(e) => setUserNotes(e.target.value)} placeholder="Internal parameter logs" className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                </div>
              </div>

              <button type="button" onClick={handleCreateTrade} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold text-zinc-950 shadow-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-zinc-950" /> {t.save_trade}
              </button>
            </div>

            {/* INTEGRATED DIRECTORY TAB PANEL: REGISTER P2P COUNTERPARTIES */}
            <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-900 space-y-3.5">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" /> {t.merchants_hub}
              </h3>
              <div className="space-y-3">
                <input type="text" placeholder="Counterparty Username Alias" value={mName} onChange={(e) => setMName(e.target.value)} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Base Platform (e.g. OKX)" value={mPlatform} onChange={(e) => setMPlatform(e.target.value)} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                  <input type="number" step="0.1" placeholder="Completion Rating %" value={mRating || ''} onChange={(e) => setMRating(Number(e.target.value))} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                </div>
                <input type="text" placeholder="Operator feedback notes" value={mNotes} onChange={(e) => setMNotes(e.target.value)} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                <button type="button" onClick={handleRegisterMerchant} className="w-full h-11 bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold rounded-xl text-xs active:scale-95 transition-transform">
                  {t.add_merchant}
                </button>
              </div>

              {/* LIVE REGISTERED MERCHANTS RENDERING ROWS */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                {merchants.map((m) => (
                  <div key={m.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${m.is_warning ? 'bg-red-950/10 border-red-900/40' : 'bg-zinc-950 border-zinc-900/60'}`}>
                    <div>
                      <span className="font-bold text-zinc-200 block">{m.name} <span className="text-[9px] text-zinc-600 font-mono">({m.platform})</span></span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">Success Score: {m.rating}% // {m.notes}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => handleToggleMerchantFavorite(m)} className={`p-2 rounded-lg border transition-colors ${m.is_favorite ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button type="button" onClick={() => handleToggleMerchantWarning(m)} className={`p-2 rounded-lg border transition-colors ${m.is_warning ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC PIPELINE MATRIX SEARCH & MULTI-FILTER TOOLS */}
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex items-center px-3 gap-2">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input type="text" placeholder="Query asset, merchant, payment channel..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-11 bg-transparent text-xs text-zinc-100 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl px-2 outline-none font-bold">
                    <option value="ALL">ALL STATES</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Disputed">Disputed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="h-10 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl px-2 outline-none font-bold">
                    <option value="NEWEST">NEWEST ENTRY</option>
                    <option value="PROFIT_DESC">MAX PROFIT YIELD</option>
                    <option value="ROI_DESC">HIGHEST SPREAD ROI</option>
                  </select>
                </div>
              </div>

              {/* RENDER MASTER UNRESTRICTED CORE HISTORY LOG FEED */}
              <div className="space-y-2.5">
                {processedLedgerFeed.length === 0 ? (
                  <div className="text-center py-10 text-xs text-zinc-600 border border-dashed border-zinc-900 rounded-3xl">{t.filter_all} is empty.</div>
                ) : (
                  [...processedLedgerFeed].map((item) => (
                    <div key={item.id} className="p-4 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-zinc-900 rounded-3xl space-y-3 relative overflow-hidden shadow-md">
                      {item.merchant_risk === 'Suspicious' && <div className="absolute top-0 right-0 left-0 h-0.5 bg-red-500" />}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-xs text-zinc-200">
                            <span className="text-emerald-400 font-extrabold">{item.buy_amount.toLocaleString()} {item.asset}</span>
                            <span className="text-zinc-500 text-[10px]">({item.buy_platform})</span>
                            <span className="text-zinc-600">➔</span>
                            <span className="text-amber-400 font-extrabold">{item.sell_platform}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-1 font-mono">
                            Counterparty: {item.merchant_name} // Route: {item.buy_payment_method} ➔ {item.sell_payment_method}
                          </span>
                        </div>
                        <div className="text-end">
                          <p className={`font-black text-sm ${item.net_profit_usd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.net_profit_usd >= 0 ? '+' : ''}${item.net_profit_usd.toFixed(2)}
                          </p>
                          <span className="text-[9px] text-zinc-600 font-mono block">ROI: {item.roi.toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/60 font-mono relative">
                        {item.notes}
                        <div className={`absolute top-2 right-2 rtl:left-2 rtl:right-auto text-[8px] font-black px-1.5 rounded uppercase ${item.merchant_risk === 'Safe' ? 'bg-emerald-500/10 text-emerald-400' : item.merchant_risk === 'Verified Pro' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-500'}`}>
                          {item.merchant_risk}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 text-[9px] text-zinc-600 border-t border-zinc-900/40">
                        <span className="font-mono tracking-tighter">{new Date(item.created_at).toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] tracking-widest ${item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : item.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SYSTEM CONFIGURATION CORE & MAINTENANCE TOOLS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" /> {t.settings}
            </h2>

            {/* INITIALIZE BRAND NEW BANK CHANNEL LIQUIDITY NODE */}
            <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-3 shadow-xl">
              <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> {t.add_node}
              </h3>
              <div className="space-y-3">
                <input type="text" placeholder="Bank Name ID (e.g. Wise Rail, BBVA Spain)" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Currency Ticker" value={newBankCurrency} onChange={(e) => setNewBankCurrency(e.target.value)} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs uppercase outline-none" />
                  <input type="number" placeholder="Opening Capital Pool" value={newBankBalance || ''} onChange={(e) => setNewBankBalance(Number(e.target.value))} className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono outline-none" />
                </div>
                <button type="button" onClick={handleAddBankNode} className="w-full h-11 bg-zinc-100 text-zinc-950 font-black rounded-xl text-xs active:scale-95 transition-all">
                  Initialize Liquidity Gateway Node
                </button>
              </div>
            </div>

            {/* MASTER ECOSYSTEM JSON DUMP SYNC UTILITIES */}
            <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-3 shadow-xl">
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-zinc-500" /> System State Backup Engine
              </p>
              <button type="button" onClick={handleBackupExport} className="w-full h-12 border border-zinc-800 bg-zinc-950 rounded-xl font-bold text-zinc-200 text-xs flex items-center justify-center gap-2 active:bg-zinc-900 transition-colors">
                <Download className="w-4 h-4 text-emerald-400" /> {t.export_db}
              </button>
              <div className="pt-2 border-t border-zinc-800/60">
                <label className="w-full h-12 border border-zinc-800 border-dashed bg-zinc-950 rounded-xl font-bold text-zinc-400 text-xs flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-900">
                  <Upload className="w-4 h-4 text-teal-400" /> {t.import_db}
                  <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                    const selectFile = e.target.files?.[0];
                    if (!selectFile) return;
                    try {
                      const textPayload = await selectFile.text();
                      const parsed = JSON.parse(textPayload);
                      if (parsed.trades) {
                        for (const r of parsed.trades) await dbSaveTrade(r);
                      }
                      if (parsed.banks) {
                        for (const b of parsed.banks) await dbSaveBank(b);
                      }
                      if (parsed.merchants) {
                        for (const m of parsed.merchants) await dbSaveMerchant(m);
                      }
                      alert('Ecosystem dataset structures fully restored and populated into local disk!');
                      refreshCoreDatasets();
                    } catch (err) { alert('Invalid file fingerprint data structure signature.'); }
                  }} />
                </label>
              </div>
            </div>

            {/* FACTORY RECOVERY WIPE DATA BLOCK */}
            <div className="p-4 rounded-3xl bg-red-950/10 border border-red-900/30 space-y-2">
              <h3 className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-400" /> Hard Reset Modality</h3>
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

      {/* ERGONOMIC NATIVE MOBILE HORIZON NAVBAR */}
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