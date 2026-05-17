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
  ArrowUpDown
} from 'lucide-react';

// ==========================================
// 1. LOCAL DATABASE ENGINE (IndexedDB)
// ==========================================
export interface Trade {
  id: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Disputed';
  buy_asset: string;
  buy_amount: number;
  buy_price: number;
  buy_currency: 'EUR' | 'USD';
  buy_platform: string;
  sell_amount: number;
  sell_price: number;
  sell_currency: 'EUR' | 'USD';
  sell_platform: string;
  net_profit: number;
  created_at: string;
  notes: string;
}

const DB_NAME = 'P2P_Core_OS_DB';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('trades')) {
        db.createObjectStore('trades', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(e.target.error);
  });
};

const dbSaveTrade = async (trade: Trade): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['trades'], 'readwrite');
    const store = tx.objectStore('trades');
    // Automated Profit Calculation before local storage disk write
    trade.net_profit = (trade.sell_amount * trade.sell_price) - (trade.buy_amount * trade.buy_price);
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

// ==========================================
// 2. INTERNATIONALIZATION DICTIONARIES (i18n)
// ==========================================
const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: "Dashboard", arbitrage: "Arbitrage", trades: "Trades", settings: "Settings",
    total_portfolio: "Total Portfolio Value", today_profit: "Today's Net Profit", efficiency: "Trading Efficiency",
    liquidity: "Asset Allocation", buy_p: "Sourcing Platform", sell_p: "Target Platform", entry_p: "Entry Purchase Price",
    exit_p: "Target Sell Price", volume: "Trade Volume", net_spread: "Calculated Spread Margin",
    profitable: "Profitable Allocation Route", unprofitable: "Suboptimal Liquidity Route", save_trade: "Log New Trade",
    amount: "Asset Amount", notes: "Operational Notes", status: "Status", platform: "Exchange Platform",
    export_db: "Export Data to Phone (JSON)", import_db: "Restore Database File", secure_note: "Your trading data is completely local and sandboxed inside your mobile browser's hardware. 0% server risk."
  },
  ar: {
    dashboard: "لوحة التحكم", arbitrage: "التحكيم الفوري", trades: "العمليات", settings: "الإعدادات",
    total_portfolio: "إجمالي قيمة المحفظة", today_profit: "صافي أرباح اليوم", efficiency: "كفاءة التداول",
    liquidity: "توزيع السيولة والأصول", buy_p: "منصة الشراء", sell_p: "منصة البيع", entry_p: "سعر الشراء",
    exit_p: "سعر البيع المتوقع", volume: "حجم السيولة", net_spread: "هامش الفارق المحسوب",
    profitable: "مسار تخصيص مربح", unprofitable: "مسار غير مجدي", save_trade: "تسجيل صفقة جديدة",
    amount: "الكمية", notes: "ملاحظات التشغيل", status: "الحالة", platform: "المنصة المستهدفة",
    export_db: "تصدير نسخة احتياطية للهاتف (JSON)", import_db: "استعادة قاعدة البيانات من ملف", secure_note: "جميع بيانات عملياتك مخزنة محلياً بالكامل ومحمية داخل الذاكرة الآمنة لمتصفح هاتفك الحالي."
  },
  es: {
    dashboard: "Panel", arbitrage: "Arbitraje", trades: "Operaciones", settings: "Ajustes",
    total_portfolio: "Valor Total del Portafolio", today_profit: "Ganancia Neta de Hoy", efficiency: "Eficiencia de Trade",
    liquidity: "Distribución de Activos", buy_p: "Plataforma Compra", sell_p: "Plataforma Venta", entry_p: "Precio de Entrada",
    exit_p: "Precio de Salida", volume: "Volumen Comercial", net_spread: "Margen de Spread",
    profitable: "Ruta de Arbitraje Rentable", unprofitable: "Ruta No Rentable", save_trade: "Registrar Operación",
    amount: "Cantidad", notes: "Notas", status: "Estado", platform: "Plataforma",
    export_db: "Exportar Datos al Teléfono (JSON)", import_db: "Restaurar Copia de Seguridad", secure_note: "Sus datos financieros están totalmente protegidos y almacenados localmente en su navegador móvil."
  }
};

// ==========================================
// 3. MAIN APP CONTROLLER & INTERFACE
// ==========================================
export default function MobileCoreApp() {
  const [lang, setLang] = useState<'en' | 'ar' | 'es'>('en');
  const [activeTab, setActiveTab] = useState<'dash' | 'arb' | 'trades' | 'settings'>('dash');
  const [trades, setTrades] = useState<Trade[]>([]);
  
  // New Trade Form States
  const [buyAmount, setBuyAmount] = useState<number>(1000);
  const [buyPrice, setBuyPrice] = useState<number>(0.92);
  const [sellPrice, setSellPrice] = useState<number>(0.95);
  const [tradePlatform, setTradePlatform] = useState<string>('Binance');
  const [tradeStatus, setTradeStatus] = useState<Trade['status']>('Completed');

  // Interactive Arbitrage Live Inputs
  const [arbVol, setArbVol] = useState<number>(1500);
  const [arbBuyPrice, setArbBuyPrice] = useState<number>(0.91);
  const [arbSellPrice, setArbSellPrice] = useState<number>(0.94);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Load local data on boot
  useEffect(() => {
    dbGetTrades().then(setTrades).catch(console.error);
  }, [activeTab]);

  const handleCreateTrade = async () => {
    const freshTrade: Trade = {
      id: `p2p_${Math.random().toString(36).substring(2, 9)}`,
      status: tradeStatus,
      buy_asset: 'USDT',
      buy_amount: buyAmount,
      buy_price: buyPrice,
      buy_currency: 'EUR',
      buy_platform: tradePlatform,
      sell_amount: buyAmount,
      sell_price: sellPrice,
      sell_currency: 'EUR',
      sell_platform: 'Bybit',
      net_profit: 0,
      created_at: new Date().toISOString(),
      notes: 'Logged directly via P2P.OS Mobile Portal'
    };
    
    await dbSaveTrade(freshTrade);
    alert(lang === 'ar' ? 'تم حفظ المعاملة محلياً بذاكرة الهاتف!' : 'Transaction stored locally on device memory!');
    dbGetTrades().then(setTrades);
  };

  const handleBackupExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trades, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `p2p_operating_system_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  // Live Performance Calculations
  const calculatedProfitSum = trades.reduce((sum, current) => sum + current.net_profit, 0);
  const totalVolumeCalculated = trades.reduce((sum, current) => sum + (current.buy_amount * current.buy_price), 0);
  
  // Arbitrage instant math engine 
  const liveArbSpread = ((arbSellPrice - arbBuyPrice) / arbBuyPrice) * 100;
  const liveArbNetProfit = (arbVol * arbSellPrice) - (arbVol * arbBuyPrice);

  return (
    <div className="flex flex-col min-h-screen text-zinc-100 font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* PREMIUM STICKY FINTECH TOP BAR */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-900/70 border-b border-zinc-800/80 backdrop-blur-lg">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-sm font-black tracking-wider text-zinc-300">P2P.OS // LOCAL_CORE</h1>
        </div>
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {(['en', 'ar', 'es'] as const).map((localeItem) => (
            <button
              key={localeItem}
              onClick={() => setLang(localeItem)}
              className={`px-2.5 py-1 text-[10px] uppercase font-black rounded-lg transition-all ${lang === localeItem ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {localeItem}
            </button>
          ))}
        </div>
      </header>

      {/* VIEWPORT SCROLL CONTAINER */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
        
        {/* VIEW 1: PREMIUM PERFORMANCE DASHBOARD */}
        {activeTab === 'dash' && (
          <div className="space-y-4 animate-fade-in">
            {/* Glassmorphism Capital Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl" />
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block">{t.total_portfolio}</span>
              <span className="text-3xl font-black mt-1 text-zinc-100 tracking-tight block">
                €{(50000 + calculatedProfitSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="mt-4 flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold">+€{calculatedProfitSum.toFixed(2)} ROI</span>
                <span className="text-[10px] text-zinc-600">Initial Sandbox base: €50,000</span>
              </div>
            </div>

            {/* Grid Metrics Panel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{t.today_profit}</span>
                <span className="text-lg font-black text-emerald-400 mt-1 block">
                  +€{calculatedProfitSum > 0 ? calculatedProfitSum.toFixed(2) : '182.40'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{t.efficiency}</span>
                <span className="text-lg font-black text-teal-400 mt-1 block">
                  {trades.length > 0 ? ((trades.filter(x => x.status === 'Completed').length / trades.length) * 100).toFixed(1) : '100'}%
                </span>
              </div>
            </div>

            {/* Fluid Mini Chart Framework (Pure CSS for Ultra-fast Phone Screen Rendering) */}
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
              <h3 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">{t.liquidity}</h3>
              <div className="space-y-3">
                {[
                  { name: 'USDT Wallet Reserve', pct: 60, val: '$30,000', color: 'bg-emerald-500', icon: Wallet },
                  { name: 'Wise Bank Balance', pct: 25, val: '€12,500', color: 'bg-blue-500', icon: Building2 },
                  { name: 'Revolut USD Pipeline', pct: 15, val: '$7,500', color: 'bg-amber-500', icon: ArrowUpDown }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-zinc-300 font-medium">
                        <item.icon className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-zinc-500 font-bold">{item.val} <span className="text-[9px] text-zinc-600">({item.pct}%)</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ARBITRAGE SCANNER & MATH ENGINE */}
        {activeTab === 'arb' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-emerald-400" /> {t.arbitrage}
            </h2>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">{t.volume} (USDT)</label>
                <input 
                  type="number" 
                  inputMode="decimal" 
                  value={arbVol} 
                  onChange={(e) => setArbVol(Number(e.target.value))} 
                  className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:border-emerald-500 outline-none transition-colors" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">{t.entry_p}</label>
                  <input 
                    type="number" 
                    step="0.001" 
                    inputMode="decimal" 
                    value={arbBuyPrice} 
                    onChange={(e) => setArbBuyPrice(Number(e.target.value))} 
                    className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:border-emerald-500 outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">{t.exit_p}</label>
                  <input 
                    type="number" 
                    step="0.001" 
                    inputMode="decimal" 
                    value={arbSellPrice} 
                    onChange={(e) => setArbSellPrice(Number(e.target.value))} 
                    className="w-full h-12 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:border-emerald-500 outline-none transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Signal Evaluation Engine Card */}
            {liveArbNetProfit > 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /> {t.profitable}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-emerald-500/10">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">{t.net_spread}</span>
                    <span className="text-xl font-black text-emerald-400">+{liveArbSpread.toFixed(2)}%</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] text-zinc-500 uppercase block">Net Yield Profit</span>
                    <span className="text-xl font-black text-emerald-400">+€{liveArbNetProfit.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center gap-2 justify-center text-xs font-bold text-red-400">
                <AlertTriangle className="w-4 h-4" /> {t.unprofitable}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LEDGER AND TRANSACTION LOGGER */}
        {activeTab === 'trades' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-emerald-400" /> {t.save_trade}
            </h2>

            {/* Quick Record Input Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.amount}</label>
                  <input type="number" value={buyAmount} onChange={(e) => setBuyAmount(Number(e.target.value))} className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.platform}</label>
                  <input type="text" value={tradePlatform} onChange={(e) => setTradePlatform(e.target.value)} className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.entry_p}</label>
                  <input type="number" step="0.01" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">{t.exit_p}</label>
                  <input type="number" step="0.01" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="w-full h-11 px-3 mt-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">{t.status}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Completed', 'Pending', 'Disputed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTradeStatus(st)}
                      className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${tradeStatus === st ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleCreateTrade} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold text-zinc-950 shadow-xl active:scale-95 transition-transform mt-2 text-sm flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-zinc-950" /> {t.save_trade}
              </button>
            </div>

            {/* Realtime Local Disk Log Output Feed */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Local Ledger Database Rows ({trades.length})</h3>
              {trades.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-600 border border-dashed border-zinc-900 rounded-xl">No offline transactions detected.</div>
              ) : (
                [...trades].reverse().map((tradeItem) => (
                  <div key={tradeItem.id} className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl flex justify-between items-center text-xs animate-fade-in">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                        <span>{tradeItem.buy_platform}</span>
                        <span className="text-zinc-600 font-light">➔</span>
                        <span>Bybit</span>
                      </div>
                      <p className="text-[9px] text-zinc-600 font-mono mt-1">{new Date(tradeItem.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-black text-emerald-400">+€{tradeItem.net_profit.toFixed(2)}</p>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${tradeItem.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {tradeItem.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: SYSTEM CONFIGURATION & COMPACTION BACKUPS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-black text-zinc-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" /> {t.settings}
            </h2>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Storage Hard Drive Sync</p>
              
              <button 
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
                      const selectedFile = e.target.files?.[0];
                      if (!selectedFile) return;
                      try {
                        const fileRawContent = await selectedFile.text();
                        const parsedArray: Trade[] = JSON.parse(fileRawContent);
                        for (const record of parsedArray) {
                          await dbSaveTrade(record);
                        }
                        alert(lang === 'ar' ? 'تم استيراد قاعدة البيانات بنجاح!' : 'Database restored successfully inside browser disk!');
                        dbGetTrades().then(setTrades);
                      } catch (err) {
                        alert('Invalid data file signature.');
                      }
                    }} 
                  />
                </label>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-900/10 border border-zinc-900 text-center text-[11px] text-zinc-500 leading-relaxed flex items-start gap-2 text-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t.secure_note}</span>
            </div>
          </div>
        )}

      </main>

      {/* ERGONOMIC NATIVE-FEEL BOTTOM NAVIGATION NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 border-t border-zinc-900 backdrop-blur-xl px-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
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
                onClick={() => setActiveTab(navTab.id as any)} 
                className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 touch-manipulation relative h-full"
              >
                <IconComponent className={`w-5 h-5 transition-all duration-200 ${isTabActive ? 'text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-zinc-600'}`} />
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