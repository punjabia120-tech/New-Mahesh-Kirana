import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ReceiptText, 
  ShoppingCart, 
  Users, 
  Building2, 
  Wallet, 
  Bell, 
  Menu, 
  Search, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  LogOut,
  UserCircle,
  Settings,
  X,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
  ArrowRightLeft,
  IndianRupee,
  Lock,
  CreditCard,
  History,
  ShieldCheck,
  Calendar,
  QrCode,
  Maximize,
  Zap,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { format, isAfter, subDays, addDays, parseISO } from 'date-fns';
import { cn, formatCurrency } from './lib/utils';
import { 
  Product, 
  Vendor, 
  Client, 
  Transaction, 
  Role, 
  Notification 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_VENDORS, 
  INITIAL_CLIENTS, 
  INITIAL_TRANSACTIONS, 
  GST_SLABS 
} from './constants';

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("bg-white rounded-2xl p-6 shadow-sm border border-slate-100", className)} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warning' | 'error' | 'success' }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-700",
    success: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant])}>
      {children}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shopName, setShopName] = useState('New Mahesh Kirana');
  const [shopDetails, setShopDetails] = useState({
    address: '123 Market Street, Mumbai, Maharashtra',
    contact: '+91 98765 43210',
    gstin: '27AAAAA0000A1Z5',
    email: 'contact@newmaheshkirana.com'
  });
  const [adminPassword, setAdminPassword] = useState('Dinesh9413');
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 1, bank: 'HDFC Bank', accountNo: '**** 4521', balance: 125400, type: 'Savings' },
    { id: 2, bank: 'SBI Bank', accountNo: '**** 8890', balance: 45200, type: 'Current' },
  ]);
  const [featureFlags, setFeatureFlags] = useState({
    billing: true,
    inventory: true,
    purchase: true,
    vendors: true,
    clients: true,
    bank: true,
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerType, setScannerType] = useState<'SALE' | 'PURCHASE' | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // --- Logic ---

  useEffect(() => {
    // Generate notifications
    const newNotifications: Notification[] = [];
    
    // Low stock
    products.forEach(p => {
      if (p.stock <= p.minQuantity) {
        newNotifications.push({
          id: `low-${p.id}`,
          type: 'LOW_STOCK',
          message: `${p.name} is low on stock (${p.stock} left)`,
          date: new Date().toISOString(),
          read: false,
        });
      }
    });

    // Vendor payments
    vendors.forEach(v => {
      if (v.dueDate && isAfter(addDays(new Date(), 3), parseISO(v.dueDate)) && v.balance > 0) {
        newNotifications.push({
          id: `vendor-${v.id}`,
          type: 'PAYMENT_DUE',
          message: `Payment of ${formatCurrency(v.balance)} due for ${v.name} on ${v.dueDate}`,
          date: new Date().toISOString(),
          read: false,
        });
      }
    });

    // Client receivables
    clients.forEach(c => {
      if (c.dueDate && isAfter(addDays(new Date(), 3), parseISO(c.dueDate)) && c.balance > 0) {
        newNotifications.push({
          id: `client-${c.id}`,
          type: 'RECEIVABLE_DUE',
          message: `Receivable of ${formatCurrency(c.balance)} due from ${c.name} on ${c.dueDate}`,
          date: new Date().toISOString(),
          read: false,
          amount: c.balance,
          clientId: c.id,
        });
      }
    });

    setNotifications(newNotifications);
  }, [products, vendors, clients]);

  const handleMarkAsCollected = (notification: Notification) => {
    if (!notification.clientId || !notification.amount) return;

    // Update client balance
    setClients((prev: Client[]) => prev.map(c => 
      c.id === notification.clientId ? { ...c, balance: 0 } : c
    ));

    // Add transaction
    const newTransaction: Transaction = {
      id: `t-coll-${Date.now()}`,
      type: 'INCOME',
      amount: notification.amount,
      date: new Date().toISOString(),
      description: `Collected receivable from client`,
      paymentMethod: 'CASH',
    };
    setTransactions((prev: Transaction[]) => [newTransaction, ...prev]);

    // Mark notification as read
    setNotifications((prev: Notification[]) => prev.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    
    alert(`Collected ${formatCurrency(notification.amount)} successfully!`);
  };

  const handleFactoryReset = () => {
    if (window.confirm('Are you absolutely sure? This will delete ALL data and reset everything to initial state.')) {
      setProducts(INITIAL_PRODUCTS);
      setVendors(INITIAL_VENDORS);
      setClients(INITIAL_CLIENTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setShopName('Mahesh Kirana');
      setShopDetails({
        address: '123 Market Street, Mumbai, Maharashtra',
        contact: '+91 98765 43210',
        gstin: '27AAAAA0000A1Z5',
        email: 'contact@maheshkirana.com'
      });
      setAdminPassword('Dinesh9413');
      setConnectedAccounts([
        { id: 1, bank: 'HDFC Bank', accountNo: '**** 4521', balance: 125400, type: 'Savings' },
        { id: 2, bank: 'SBI Bank', accountNo: '**** 8890', balance: 45200, type: 'Current' },
      ]);
      setFeatureFlags({
        billing: true,
        inventory: true,
        purchase: true,
        vendors: true,
        clients: true,
        bank: true,
      });
      setActiveTab('dashboard');
      setRole(null);
      alert('System has been reset to factory settings.');
    }
  };

  const totalSales = useMemo(() => 
    transactions.filter(t => t.type === 'SALE').reduce((acc, t) => acc + t.amount, 0), 
  [transactions]);

  const stockValue = useMemo(() => 
    products.reduce((acc, p) => acc + (p.price * p.stock), 0), 
  [products]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{shopName}</h1>
          <p className="text-slate-500 mb-8">Select your access level to continue</p>
          
          <div className="space-y-4">
            {!showPasswordPrompt ? (
              <>
                <button 
                  onClick={() => setShowPasswordPrompt(true)}
                  className="w-full p-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-between hover:bg-emerald-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span>Administrative Access</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setRole('GENERAL')}
                  className="w-full p-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-between hover:bg-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-5 h-5" />
                    <span>General Access</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-left">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
                  <input 
                    type="password"
                    autoFocus
                    className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1"
                    placeholder="Enter password..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (passwordInput === adminPassword) {
                          setRole('ADMIN');
                          setPasswordInput('');
                        } else {
                          alert('Incorrect password');
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setPasswordInput('');
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => {
                      if (passwordInput === adminPassword) {
                        setRole('ADMIN');
                        setPasswordInput('');
                      } else {
                        alert('Incorrect password');
                      }
                    }}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 md:pb-0 md:pl-64">
      {/* Sidebar (Desktop & Mobile) */}
      <AnimatePresence>
        {(showMobileSidebar || window.innerWidth >= 768) && (
          <>
            {showMobileSidebar && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSidebar(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
              />
            )}
            <motion.aside 
              initial={showMobileSidebar ? { x: '-100%' } : false}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex-col z-[70] md:flex",
                showMobileSidebar ? "flex" : "hidden md:flex"
              )}
            >
              <div className="p-6 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">{shopName}</h1>
                </div>
                {showMobileSidebar && (
                  <button onClick={() => setShowMobileSidebar(false)} className="p-2 text-slate-400 md:hidden">
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar custom-scrollbar">
                <NavItem 
                  icon={<LayoutDashboard />} 
                  label="Dashboard" 
                  active={activeTab === 'dashboard'} 
                  onClick={() => { setActiveTab('dashboard'); setShowMobileSidebar(false); }} 
                />
                {featureFlags.inventory && (
                  <NavItem 
                    icon={<Package />} 
                    label="Inventory" 
                    active={activeTab === 'inventory'} 
                    onClick={() => { setActiveTab('inventory'); setShowMobileSidebar(false); }} 
                  />
                )}
                {featureFlags.billing && (
                  <NavItem 
                    icon={<ReceiptText />} 
                    label="Billing" 
                    active={activeTab === 'billing'} 
                    onClick={() => { setActiveTab('billing'); setShowMobileSidebar(false); }} 
                  />
                )}
                {featureFlags.purchase && (
                  <NavItem 
                    icon={<ShoppingCart />} 
                    label="Purchase" 
                    active={activeTab === 'purchase'} 
                    onClick={() => { setActiveTab('purchase'); setShowMobileSidebar(false); }} 
                  />
                )}
                
                {role === 'ADMIN' && (
                  <>
                    <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</div>
                    {featureFlags.vendors && (
                      <NavItem 
                        icon={<Users />} 
                        label="Vendors" 
                        active={activeTab === 'vendors'} 
                        onClick={() => { setActiveTab('vendors'); setShowMobileSidebar(false); }} 
                      />
                    )}
                    {featureFlags.clients && (
                      <NavItem 
                        icon={<Users />} 
                        label="Clients" 
                        active={activeTab === 'clients'} 
                        onClick={() => { setActiveTab('clients'); setShowMobileSidebar(false); }} 
                      />
                    )}
                    {featureFlags.bank && (
                      <NavItem 
                        icon={<Wallet />} 
                        label="Bank & Accounts" 
                        active={activeTab === 'bank'} 
                        onClick={() => { setActiveTab('bank'); setShowMobileSidebar(false); }} 
                      />
                    )}
                    <NavItem 
                      icon={<Settings />} 
                      label="Setup" 
                      active={activeTab === 'setup'} 
                      onClick={() => { setActiveTab('setup'); setShowMobileSidebar(false); }} 
                    />
                  </>
                )}
              </nav>

              <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                    {role[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{role === 'ADMIN' ? 'Mahesh' : 'Staff'}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{role}</p>
                  </div>
                  <button onClick={() => setRole(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMobileSidebar(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {activeTab !== 'dashboard' && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-bold">Back</span>
            </button>
          )}
          
          <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              // Simulate refresh
              const btn = document.getElementById('refresh-btn');
              if (btn) btn.classList.add('animate-spin');
              setTimeout(() => {
                if (btn) btn.classList.remove('animate-spin');
                alert('Data refreshed successfully!');
              }, 1000);
            }}
            id="refresh-btn"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <DashboardView 
              shopName={shopName}
              products={products} 
              transactions={transactions} 
              totalSales={totalSales} 
              stockValue={stockValue} 
              onScan={(type: 'SALE' | 'PURCHASE') => {
                setScannerType(type);
                setShowScanner(true);
              }}
            />
          )}
          {activeTab === 'inventory' && featureFlags.inventory && (
            <InventoryView 
              products={products} 
              setProducts={setProducts} 
              role={role}
            />
          )}
          {activeTab === 'billing' && featureFlags.billing && (
            <BillingView 
              products={products} 
              setProducts={setProducts}
              clients={clients}
              setTransactions={setTransactions}
            />
          )}
          {activeTab === 'purchase' && featureFlags.purchase && (
            <PurchaseView 
              products={products} 
              setProducts={setProducts}
              vendors={vendors}
              setTransactions={setTransactions}
            />
          )}
          {activeTab === 'vendors' && role === 'ADMIN' && featureFlags.vendors && (
            <VendorsView vendors={vendors} setVendors={setVendors} />
          )}
          {activeTab === 'clients' && role === 'ADMIN' && featureFlags.clients && (
            <ClientsView clients={clients} setClients={setClients} />
          )}
          {activeTab === 'bank' && role === 'ADMIN' && featureFlags.bank && (
            <BankView 
              transactions={transactions} 
              connectedAccounts={connectedAccounts}
              setConnectedAccounts={setConnectedAccounts}
            />
          )}
          {activeTab === 'setup' && role === 'ADMIN' && (
            <SetupView 
              shopName={shopName} 
              setShopName={setShopName} 
              shopDetails={shopDetails}
              setShopDetails={setShopDetails}
              adminPassword={adminPassword} 
              setAdminPassword={setAdminPassword} 
              featureFlags={featureFlags} 
              setFeatureFlags={setFeatureFlags} 
              onFactoryReset={handleFactoryReset}
              connectedAccounts={connectedAccounts}
              setConnectedAccounts={setConnectedAccounts}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-around overflow-x-auto no-scrollbar z-50">
        <MobileNavItem icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Package />} active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
        <MobileNavItem icon={<ReceiptText />} active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
        <MobileNavItem icon={<ShoppingCart />} active={activeTab === 'purchase'} onClick={() => setActiveTab('purchase')} />
        <MobileNavItem icon={<Menu />} active={['vendors', 'clients', 'bank', 'setup'].includes(activeTab)} onClick={() => setShowMobileSidebar(true)} />
      </nav>

      {/* Notifications Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          n.type === 'LOW_STOCK' ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                        )}>
                          {n.type === 'LOW_STOCK' ? <AlertTriangle className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{format(parseISO(n.date), 'PPp')}</p>
                          {n.type === 'RECEIVABLE_DUE' && !n.read && (
                            <button 
                              onClick={() => handleMarkAsCollected(n)}
                              className="mt-3 w-full py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-all"
                            >
                              Mark as Collected
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-8 text-center space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <QrCode className="w-6 h-6" />
                    <span className="font-bold uppercase tracking-widest text-xs">Smart Scanner</span>
                  </div>
                  <button onClick={() => setShowScanner(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="relative aspect-square bg-slate-900 rounded-3xl overflow-hidden group">
                  {/* Simulated Camera View */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-3xl relative">
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
                      
                      {/* Scanning Line Animation */}
                      <motion.div 
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
                      />
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-6">
                    <p className="text-white font-bold text-sm mb-1">Align QR Code within frame</p>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Scanning for {scannerType === 'SALE' ? 'Billing' : 'Purchase'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Auto-Detect Enabled</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Point at any product QR to add to {scannerType?.toLowerCase()}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      alert(`Simulated: Product scanned and added to ${scannerType === 'SALE' ? 'Billing' : 'Purchase'}!`);
                      setShowScanner(false);
                      setActiveTab(scannerType === 'SALE' ? 'billing' : 'purchase');
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Maximize className="w-5 h-5" />
                    Simulate Scan Success
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Views ---

function DashboardView({ shopName, products, transactions, totalSales, stockValue, onScan }: any) {
  const chartData = [
    { name: 'Mon', sales: 210 },
    { name: 'Tue', sales: 340 },
    { name: 'Wed', sales: 180 },
    { name: 'Thu', sales: 450 },
    { name: 'Fri', sales: 310 },
    { name: 'Sat', sales: 380 },
    { name: 'Sun', sales: 409 },
  ];

  const lowStockItems = products.filter((p: any) => p.stock <= p.minQuantity);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Namaste!</h1>
          <p className="text-slate-500 font-medium text-lg">Managing <span className="text-emerald-600 font-bold decoration-emerald-200 decoration-4 underline-offset-4 underline">{shopName}</span> with precision.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Date</p>
              <p className="text-base font-bold text-slate-700">{format(new Date(), 'PP')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Scanners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onScan('SALE')}
          className="relative overflow-hidden group p-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200 flex items-center justify-between"
        >
          <div className="relative z-10 text-left">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-1">Scan for Sale</h3>
            <p className="text-emerald-100 text-sm font-medium">Quick billing via QR scanner</p>
          </div>
          <div className="relative z-10 opacity-40 group-hover:opacity-100 transition-opacity">
            <Maximize className="w-16 h-16" />
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onScan('PURCHASE')}
          className="relative overflow-hidden group p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 flex items-center justify-between"
        >
          <div className="relative z-10 text-left">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-1">Scan Purchase</h3>
            <p className="text-slate-400 text-sm font-medium">Update stock via QR scan</p>
          </div>
          <div className="relative z-10 opacity-20 group-hover:opacity-60 transition-opacity">
            <QrCode className="w-16 h-16" />
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-slate-700/20 rounded-full blur-3xl" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-xl shadow-emerald-50 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Today's Sales</p>
            <div className="text-4xl font-black text-slate-900 mb-4">{formatCurrency(totalSales)}</div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 w-fit px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <IndianRupee className="w-24 h-24" />
          </div>
        </Card>
        <Card className="bg-white border-none shadow-xl shadow-slate-50 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Stock Value</p>
            <div className="text-4xl font-black text-slate-900 mb-4">{formatCurrency(stockValue)}</div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 w-fit px-3 py-1.5 rounded-full">
              <Package className="w-3.5 h-3.5" />
              <span>{products.length} Items</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Package className="w-24 h-24" />
          </div>
        </Card>
        <Card className="bg-white border-none shadow-xl shadow-rose-50 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Low Stock</p>
            <div className="text-4xl font-black text-rose-600 mb-4">{lowStockItems.length}</div>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 w-fit px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Restock Soon</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <AlertTriangle className="w-24 h-24" />
          </div>
        </Card>
        <Card className="bg-white border-none shadow-xl shadow-blue-50 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Active Clients</p>
            <div className="text-4xl font-black text-blue-600 mb-4">42</div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold bg-blue-50 w-fit px-3 py-1.5 rounded-full">
              <Users className="w-3.5 h-3.5" />
              <span>Loyal Base</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Users className="w-24 h-24" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Sales Trend</h3>
              <p className="text-sm text-slate-400">Performance over last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Revenue
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#059669' : '#d1fae5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Sales</h3>
            <button className="text-emerald-600 text-sm font-bold">View All</button>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {t.description[8]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.description.replace('Sale to ', '')}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.paymentMethod}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(t.amount)}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {format(parseISO(t.date), 'p')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold">Low Stock Alerts</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {lowStockItems.map((p: any) => (
            <div key={p.id} className="min-w-[240px] bg-white p-5 rounded-2xl border border-rose-100 flex flex-col gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>{p.stock}/{p.minQuantity * 2} left</span>
                  <span className="text-rose-500">{Math.round((p.stock / (p.minQuantity * 2)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    style={{ width: `${(p.stock / (p.minQuantity * 2)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function InventoryView({ products, setProducts, role }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'Essentials',
    price: 0,
    stock: 0,
    minQuantity: 0,
    gstSlab: 18,
    unit: '1kg Pack',
    customFields: {}
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Essentials',
      price: 0,
      stock: 0,
      minQuantity: 0,
      gstSlab: 18,
      unit: '1kg Pack',
      customFields: {}
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;
    
    if (editingProduct) {
      setProducts((prev: any) => prev.map((p: any) => p.id === editingProduct.id ? { ...p, ...formData } : p));
    } else {
      setProducts((prev: any) => [...prev, { ...formData, id: `p-${Date.now()}` }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts((prev: any) => prev.filter((p: any) => p.id !== id));
    }
  };

  const filtered = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'Low Stock') return matchesSearch && p.stock <= p.minQuantity;
    if (filter === 'Out of Stock') return matchesSearch && p.stock === 0;
    return matchesSearch && p.category === filter;
  });

  const categories = ['All', 'Low Stock', 'Out of Stock', ...Array.from(new Set(products.map((p: any) => p.category))) as string[]];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search product name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="hidden md:flex px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
          {categories.map(c => (
            <button 
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                filter === c ? "bg-emerald-600 text-white" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((p: any) => (
          <Card key={p.id} className="group hover:shadow-md transition-all">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden">
                {p.image ? <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Package className="w-8 h-8" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sku}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{p.category}</span>
                </div>
                <h4 className="font-bold text-slate-900 truncate">{p.name}</h4>
                <p className="text-xs text-slate-500">{p.unit}</p>
                {p.customFields && Object.entries(p.customFields).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(p.customFields).map(([k, v]) => (
                      <span key={k} className="px-1.5 py-0.5 bg-slate-50 text-[8px] font-bold text-slate-500 rounded border border-slate-100">
                        {k}: {v as string}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{formatCurrency(p.price)}</p>
                <Badge variant={p.stock === 0 ? 'error' : p.stock <= p.minQuantity ? 'warning' : 'success'}>
                  {p.stock === 0 ? 'Out of Stock' : `${p.stock} In Stock`}
                </Badge>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const newPrice = window.prompt(`Update price for ${p.name}:`, p.price.toString());
                    if (newPrice !== null && !isNaN(Number(newPrice))) {
                      setProducts((prev: any) => prev.map((item: any) => item.id === p.id ? { ...item, price: Number(newPrice) } : item));
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all font-bold text-xs"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  Price
                </button>
                <button 
                  onClick={() => handleOpenEdit(p)}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all font-bold text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                {role === 'ADMIN' && (
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>GST Slab: {p.gstSlab}%</span>
              <span>Min Qty: {p.minQuantity}</span>
            </div>
          </Card>
        ))}
      </div>

      <button 
        onClick={handleOpenAdd}
        className="fixed bottom-28 right-8 md:bottom-8 md:right-8 w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Name *</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SKU / Code *</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit (e.g. 1kg Pack)</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GST Slab (%)</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.gstSlab}
                      onChange={e => setFormData({...formData, gstSlab: Number(e.target.value)})}
                    >
                      {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min. Quantity Alert</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.minQuantity}
                      onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <CustomFieldsEditor 
                  fields={formData.customFields || {}} 
                  onChange={fields => setFormData({...formData, customFields: fields})} 
                />

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BillingView({ products, setProducts, clients, setTransactions }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalGst = cart.reduce((acc, item) => acc + (item.price * item.quantity * (item.gstSlab / 100)), 0);
  const total = subtotal + totalGst;

  const addToCart = (p: Product) => {
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...p, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const completeSale = (method: 'CASH' | 'UPI' | 'CARD') => {
    if (cart.length === 0) return;

    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      type: 'SALE',
      amount: total,
      date: new Date().toISOString(),
      description: `Sale to ${selectedClient?.name || 'Walk-in Customer'}`,
      paymentMethod: method,
    };

    setTransactions((prev: any) => [newTransaction, ...prev]);
    
    // Update stock
    setProducts((prev: any) => prev.map((p: any) => {
      const cartItem = cart.find(item => item.id === p.id);
      return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.quantity) } : p;
    }));

    if (selectedClient?.email) {
      // Simulate email sending
      const notificationId = `email-${Date.now()}`;
      alert(`Processing... Sending invoice to ${selectedClient.email}`);
      setTimeout(() => {
        alert(`Invoice successfully sent to ${selectedClient.email}`);
      }, 2000);
    } else {
      alert('Sale completed successfully!');
    }

    setCart([]);
    setSelectedClient(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-8 space-y-8">
        <section className="bg-white p-2 rounded-2xl flex items-center shadow-sm border border-slate-100">
          <div className="flex-1 flex items-center px-4">
            <Search className="text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search items to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none focus:ring-0 w-full py-4 px-3 text-lg"
            />
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6).map((p: any) => (
            <button 
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-4 rounded-2xl text-left border border-slate-100 hover:border-emerald-500 transition-all active:scale-95 group relative overflow-hidden h-32 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                <Plus className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.price)}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{p.stock} left</p>
              </div>
            </button>
          ))}
        </div>

        <section className="bg-slate-100 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold">Customer Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              className="w-full bg-white border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/20"
              onChange={(e) => setSelectedClient(clients.find((c: any) => c.id === e.target.value) || null)}
            >
              <option value="">Walk-in Customer</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input 
              type="tel" 
              placeholder="Mobile Number"
              className="w-full bg-white border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </section>
      </div>

      <div className="lg:col-span-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col h-[calc(100vh-200px)] sticky top-24">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Bill</h2>
            <Badge variant="success">{cart.length} Items</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-start group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center font-bold text-emerald-600">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(item.price)} per {item.unit || 'unit'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-rose-500 text-[10px] font-bold uppercase tracking-wider hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST Total</span>
                <span>{formatCurrency(totalGst)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-700">{formatCurrency(total)}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => completeSale('CASH')} className="flex flex-col items-center py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition-all">
                <Wallet className="w-4 h-4 text-slate-600" />
                <span className="text-[10px] font-bold uppercase mt-1">Cash</span>
              </button>
              <button onClick={() => completeSale('UPI')} className="flex flex-col items-center py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition-all">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <span className="text-[10px] font-bold uppercase mt-1">UPI</span>
              </button>
              <button onClick={() => completeSale('CARD')} className="flex flex-col items-center py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition-all">
                <IndianRupee className="w-4 h-4 text-slate-600" />
                <span className="text-[10px] font-bold uppercase mt-1">Card</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PurchaseView({ products, setProducts, vendors, setTransactions }: any) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(0);
  const [rate, setRate] = useState(0);
  const [gst, setGst] = useState(18);
  const [purchaseCart, setPurchaseCart] = useState<any[]>([]);

  const subtotal = purchaseCart.reduce((acc, item) => acc + (item.rate * item.qty), 0);
  const totalGst = purchaseCart.reduce((acc, item) => acc + (item.rate * item.qty * (item.gst / 100)), 0);
  const total = subtotal + totalGst;

  const handleAddToCart = () => {
    if (!selectedProduct || qty <= 0) return;
    
    const existing = purchaseCart.find(item => item.id === selectedProduct.id);
    if (existing) {
      setPurchaseCart(purchaseCart.map(item => item.id === selectedProduct.id ? { ...item, qty: item.qty + qty, rate } : item));
    } else {
      setPurchaseCart([...purchaseCart, { ...selectedProduct, qty, rate, gst }]);
    }
    
    setQty(0);
    setRate(0);
    setSelectedProduct(null);
  };

  const removeFromCart = (id: string) => {
    setPurchaseCart(purchaseCart.filter(item => item.id !== id));
  };

  const completePurchase = () => {
    if (purchaseCart.length === 0) return;

    const newTransaction: Transaction = {
      id: `p-${Date.now()}`,
      type: 'PURCHASE',
      amount: total,
      date: new Date().toISOString(),
      description: `Purchase from ${selectedVendor?.name || 'Unknown Vendor'}`,
      paymentMethod: 'CASH',
    };

    setTransactions((prev: any) => [newTransaction, ...prev]);
    
    // Update stock and price
    setProducts((prev: any) => prev.map((p: any) => {
      const cartItem = purchaseCart.find(item => item.id === p.id);
      return cartItem ? { ...p, stock: p.stock + cartItem.qty, price: cartItem.rate } : p;
    }));

    if (selectedVendor?.email) {
      alert(`Processing... Sending purchase order to ${selectedVendor.email}`);
      setTimeout(() => {
        alert(`Purchase order successfully sent to ${selectedVendor.email}`);
      }, 2000);
    } else {
      alert('Purchase recorded and stock updated successfully!');
    }

    setPurchaseCart([]);
    setSelectedVendor(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-7 space-y-6">
        <Card className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ReceiptText className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold">New Purchase</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Vendor</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500/20"
                value={selectedVendor?.id || ''}
                onChange={(e) => setSelectedVendor(vendors.find((v: any) => v.id === e.target.value) || null)}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bill Number</label>
              <input className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. PUR/2023/882" />
            </div>
          </div>

          <div className="p-6 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-100 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</label>
                <select 
                  className="w-full bg-white border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20"
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const p = products.find((p: any) => p.id === e.target.value);
                    setSelectedProduct(p || null);
                    if (p) setRate(p.price);
                  }}
                >
                  <option value="">Select Product</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty ({selectedProduct?.unit || 'Units'})</label>
                  <input 
                    type="number" 
                    value={qty || ''}
                    onChange={(e) => setQty(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-white border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purchase Rate</label>
                  <input 
                    type="number" 
                    value={rate || ''}
                    onChange={(e) => setRate(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-white border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GST %</label>
                  <select 
                    value={gst}
                    onChange={(e) => setGst(Number(e.target.value))}
                    className="w-full bg-white border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={!selectedProduct || qty <= 0}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add to Purchase List
            </button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col h-[calc(100vh-200px)] sticky top-24">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-bold">Purchase Bill</h2>
            <Badge variant="warning">{purchaseCart.length} Items</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {purchaseCart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No items added yet</p>
              </div>
            ) : (
              purchaseCart.map(item => (
                <div key={item.id} className="flex justify-between items-start group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center font-bold text-amber-600">
                      {item.qty}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(item.rate)} per {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(item.rate * item.qty)}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-rose-500 text-[10px] font-bold uppercase tracking-wider hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST Total</span>
                <span>{formatCurrency(totalGst)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-lg font-bold">Total Payable</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
            </div>
            
            <button 
              onClick={completePurchase}
              disabled={purchaseCart.length === 0}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Complete Purchase & Update Stock
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}function VendorsView({ vendors, setVendors }: any) {
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({ name: '', mobile: '', email: '', gstNo: '', gstSlab: 18, balance: 0, dueDate: '', customFields: {} });
  const [notifying, setNotifying] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({ name: '', mobile: '', email: '', gstNo: '', gstSlab: 18, balance: 0, dueDate: '', customFields: {} });
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setFormData({ ...v });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;
    
    if (editingVendor) {
      setVendors((prev: any) => prev.map((v: any) => v.id === editingVendor.id ? { ...v, ...formData } : v));
    } else {
      setVendors((prev: any) => [...prev, { ...formData, id: `v-${Date.now()}` }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      setVendors((prev: any) => prev.filter((v: any) => v.id !== id));
    }
  };

  const handleNotify = (vendor: any) => {
    if (!vendor.email) {
      alert("Please add an email address for this vendor first.");
      return;
    }
    setNotifying(vendor.id);
    setTimeout(() => {
      setNotifying(null);
      alert(`Payment notification sent to ${vendor.email}`);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Vendor Management</h3>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((v: any) => (
          <Card key={v.id}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                  {v.name[0]}
                </div>
                <div>
                  <h4 className="font-bold">{v.name}</h4>
                  <p className="text-xs text-slate-500">{v.mobile} {v.email && `• ${v.email}`}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {v.gstNo && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GST: {v.gstNo}</p>}
                    {v.gstSlab !== undefined && (
                      <>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Slab: {v.gstSlab}%</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={v.balance > 0 ? 'error' : 'success'}>
                  {v.balance > 0 ? 'Payment Due' : 'Clear'}
                </Badge>
                {v.customFields && Object.entries(v.customFields).length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {Object.entries(v.customFields).map(([k, val]) => (
                      <span key={k} className="px-1.5 py-0.5 bg-slate-50 text-[8px] font-bold text-slate-500 rounded border border-slate-100">
                        {k}: {val as string}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(v)}
                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {v.balance > 0 && (
                  <button 
                    onClick={() => handleNotify(v)}
                    disabled={notifying === v.id}
                    className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline disabled:opacity-50"
                  >
                    {notifying === v.id ? 'Sending...' : 'Notify via Email'}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
                <p className="text-lg font-bold text-rose-600">{formatCurrency(v.balance)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                <p className="text-sm font-bold">{v.dueDate || 'N/A'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vendor Name *</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number *</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GST Number</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.gstNo}
                      onChange={e => setFormData({...formData, gstNo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GST Slab (%)</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.gstSlab}
                      onChange={e => setFormData({...formData, gstSlab: Number(e.target.value)})}
                    >
                      {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Balance</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.balance}
                      onChange={e => setFormData({...formData, balance: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <CustomFieldsEditor 
                  fields={formData.customFields || {}} 
                  onChange={fields => setFormData({...formData, customFields: fields})} 
                />

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ClientsView({ clients, setClients }: any) {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<any>({ name: '', mobile: '', email: '', balance: 0, dueDate: '', customFields: {} });
  const [notifying, setNotifying] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({ name: '', mobile: '', email: '', balance: 0, dueDate: '', customFields: {} });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({ ...c } as any);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;
    
    if (editingClient) {
      setClients((prev: any) => prev.map((c: any) => c.id === editingClient.id ? { ...c, ...formData } : c));
    } else {
      setClients((prev: any) => [...prev, { ...formData, id: `c-${Date.now()}` }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients((prev: any) => prev.filter((c: any) => c.id !== id));
    }
  };

  const handleNotify = (client: any) => {
    if (!client.email) {
      alert("Please add an email address for this client first.");
      return;
    }
    setNotifying(client.id);
    setTimeout(() => {
      setNotifying(null);
      alert(`Receipt notification sent to ${client.email}`);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Client Management</h3>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((c: any) => (
          <Card key={c.id}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                  {c.name[0]}
                </div>
                <div>
                  <h4 className="font-bold">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.mobile} {c.email && `• ${c.email}`}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={c.balance > 0 ? 'warning' : 'success'}>
                  {c.balance > 0 ? 'Receivable' : 'Clear'}
                </Badge>
                {c.customFields && Object.entries(c.customFields).length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {Object.entries(c.customFields).map(([k, val]) => (
                      <span key={k} className="px-1.5 py-0.5 bg-slate-50 text-[8px] font-bold text-slate-500 rounded border border-slate-100">
                        {k}: {val as string}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {c.balance > 0 && (
                  <button 
                    onClick={() => handleNotify(c)}
                    disabled={notifying === c.id}
                    className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline disabled:opacity-50"
                  >
                    {notifying === c.id ? 'Sending...' : 'Notify via Email'}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(c.balance)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                <p className="text-sm font-bold">{c.dueDate || 'N/A'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Client Name *</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number *</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Balance</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.balance}
                      onChange={e => setFormData({...formData, balance: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <CustomFieldsEditor 
                  fields={formData.customFields || {}} 
                  onChange={fields => setFormData({...formData, customFields: fields})} 
                />

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    {editingClient ? 'Update Client' : 'Save Client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BankView({ transactions, connectedAccounts, setConnectedAccounts }: any) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState<'list' | 'login' | 'connecting'>('list');
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [bankCredentials, setBankCredentials] = useState({ username: '', password: '' });

  const balance = transactions.reduce((acc: number, t: any) => 
    t.type === 'SALE' || t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 
  0);

  const popularBanks = [
    { name: 'ICICI Bank', icon: <Building2 />, color: 'bg-orange-600', website: 'https://www.icicibank.com' },
    { name: 'Axis Bank', icon: <Building2 />, color: 'bg-rose-900', website: 'https://www.axisbank.com' },
    { name: 'Kotak Mahindra', icon: <Building2 />, color: 'bg-red-600', website: 'https://www.kotak.com' },
    { name: 'Punjab National Bank', icon: <Building2 />, color: 'bg-amber-600', website: 'https://www.pnbindia.in' },
    { name: 'Bank of Baroda', icon: <Building2 />, color: 'bg-orange-500', website: 'https://www.bankofbaroda.in' },
    { name: 'Canara Bank', icon: <Building2 />, color: 'bg-blue-600', website: 'https://canarabank.com' },
    { name: 'Yes Bank', icon: <Building2 />, color: 'bg-sky-600', website: 'https://www.yesbank.in' },
    { name: 'IndusInd Bank', icon: <Building2 />, color: 'bg-red-800', website: 'https://www.indusind.com' },
  ];

  const handleBankSelect = (bank: any) => {
    setSelectedBank(bank);
    setConnectStep('login');
  };

  const handleBankLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectStep('connecting');
    // Simulate connection delay
    setTimeout(() => {
      const newAccount = {
        id: Date.now(),
        bank: selectedBank.name,
        accountNo: `**** ${Math.floor(1000 + Math.random() * 9000)}`,
        balance: Math.floor(10000 + Math.random() * 100000),
        type: 'Savings'
      };
      setConnectedAccounts([...connectedAccounts, newAccount]);
      setConnectStep('list');
      setSelectedBank(null);
      setBankCredentials({ username: '', password: '' });
      setShowConnectModal(false);
    }, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveSubTab('overview')}
          className={cn(
            "px-6 py-2 rounded-xl font-bold text-sm transition-all",
            activeSubTab === 'overview' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveSubTab('online')}
          className={cn(
            "px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
            activeSubTab === 'online' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <CreditCard className="w-4 h-4" />
          Online Banking
        </button>
      </div>

      {activeSubTab === 'overview' ? (
        <>
          <Card className="bg-slate-900 text-white border-none">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold">{formatCurrency(balance)}</h2>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">Add Income</button>
              <button className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">Add Expense</button>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <div className="space-y-3">
              {transactions.map((t: any) => (
                <div key={t.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      t.type === 'SALE' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {t.type === 'SALE' ? <TrendingUp className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {format(parseISO(t.date), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      t.type === 'SALE' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {t.type === 'SALE' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connectedAccounts.map(account => (
              <Card key={account.id} className="bg-white border-slate-100 overflow-hidden group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{account.bank}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{account.type} Account</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Connected</div>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Available Balance</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(account.balance)}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500 font-bold">
                    <span>{account.accountNo}</span>
                    <button className="text-emerald-600 hover:underline flex items-center gap-1">
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
                  <button className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">Statement</button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Disconnect this bank account?')) {
                        setConnectedAccounts(connectedAccounts.filter((acc: any) => acc.id !== account.id));
                      }
                    }}
                    className="flex-1 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </Card>
            ))}
            
            <button 
              onClick={() => setShowConnectModal(true)}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold">Connect New Bank</span>
            </button>
          </div>

          <AnimatePresence>
            {showConnectModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                >
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {connectStep !== 'list' && (
                        <button 
                          onClick={() => setConnectStep('list')}
                          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                      )}
                      <h3 className="text-xl font-bold">
                        {connectStep === 'list' ? 'Connect Your Bank' : 
                         connectStep === 'login' ? `Login to ${selectedBank?.name}` : 
                         'Verifying Connection'}
                      </h3>
                    </div>
                    <button onClick={() => {
                      setShowConnectModal(false);
                      setConnectStep('list');
                    }} className="p-2 text-slate-400 hover:text-slate-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    {connectStep === 'connecting' ? (
                      <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                        <p className="font-bold text-slate-600">Securely connecting to {selectedBank?.name}...</p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Establishing encrypted tunnel</p>
                        <div className="pt-8 flex justify-center gap-2">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    ) : connectStep === 'login' ? (
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 mb-6">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", selectedBank?.color)}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Redirecting to</p>
                            <p className="font-bold text-slate-900">{selectedBank?.name} Secure Portal</p>
                          </div>
                        </div>

                        <form onSubmit={handleBankLogin} className="space-y-4">
                          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-slate-900">NetBanking Login</h4>
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-3 h-3" />
                                Secure
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">User ID / Customer ID</label>
                                <input 
                                  required
                                  type="text" 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 mt-1"
                                  value={bankCredentials.username}
                                  onChange={(e) => setBankCredentials({...bankCredentials, username: e.target.value})}
                                  placeholder="Enter your bank user ID"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password / IPIN</label>
                                <input 
                                  required
                                  type="password" 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 mt-1"
                                  value={bankCredentials.password}
                                  onChange={(e) => setBankCredentials({...bankCredentials, password: e.target.value})}
                                  placeholder="••••••••"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 py-2">
                              <input type="checkbox" id="terms" required className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                              <label htmlFor="terms" className="text-[10px] text-slate-500 font-medium">
                                I agree to the <span className="text-emerald-600 underline cursor-pointer">Terms of Service</span> and authorize linking.
                              </label>
                            </div>

                            <button 
                              type="submit"
                              className={cn(
                                "w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg",
                                selectedBank?.color || "bg-emerald-600"
                              )}
                            >
                              Login & Link Account
                            </button>
                          </div>
                          
                          <div className="text-center">
                            <button 
                              type="button"
                              onClick={() => setConnectStep('list')}
                              className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                            >
                              Cancel and choose another bank
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <>
                        <div className="relative mb-6">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search your bank..." 
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {popularBanks.map(bank => (
                            <button 
                              key={bank.name}
                              onClick={() => handleBankSelect(bank)}
                              className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left flex items-center gap-3 group"
                            >
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 shadow-sm">
                                {bank.icon}
                              </div>
                              <span className="text-sm font-bold text-slate-700">{bank.name}</span>
                            </button>
                          ))}
                        </div>
                        
                        <div className="mt-8 p-4 bg-emerald-50 rounded-2xl flex items-start gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-emerald-900 mb-1">Bank-Grade Security</p>
                            <p className="text-[10px] text-emerald-700 leading-relaxed">
                              We use 256-bit encryption to ensure your data is safe. We never store your login credentials.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-emerald-600" />
              Quick Transfer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">From Account</label>
                <select className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1">
                  {connectedAccounts.map(account => (
                    <option key={account.id}>{account.bank} ({account.accountNo})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">To Account / UPI</label>
                <input type="text" placeholder="Enter UPI ID or Acc No" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                <div className="relative mt-1">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" placeholder="0.00" className="w-full bg-slate-50 border-none rounded-xl p-4 pl-10 focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
              Initiate Transfer
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SetupView({ shopName, setShopName, shopDetails, setShopDetails, adminPassword, setAdminPassword, featureFlags, setFeatureFlags, onFactoryReset, connectedAccounts, setConnectedAccounts }: any) {
  const handleDeleteBank = (id: number) => {
    if (window.confirm('Are you sure you want to disconnect this bank account?')) {
      setConnectedAccounts(connectedAccounts.filter((acc: any) => acc.id !== id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-600" />
          General Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Security Settings
              </h4>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
                <div className="relative mt-1">
                  <input 
                    type="password"
                    className="w-full bg-white border-none rounded-xl p-4 pr-12 focus:ring-2 focus:ring-emerald-500/20"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">This password is required for Administrative Access.</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">GSTIN Number</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1"
                value={shopDetails.gstin}
                onChange={(e) => setShopDetails({...shopDetails, gstin: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1"
                value={shopDetails.contact}
                onChange={(e) => setShopDetails({...shopDetails, contact: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email"
                className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1"
                value={shopDetails.email}
                onChange={(e) => setShopDetails({...shopDetails, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Shop Address</label>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/20 mt-1 h-[108px] resize-none"
                value={shopDetails.address}
                onChange={(e) => setShopDetails({...shopDetails, address: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-600" />
          Connected Bank Accounts
        </h3>
        <div className="space-y-4">
          {connectedAccounts.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No bank accounts connected.</p>
          ) : (
            connectedAccounts.map((account: any) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{account.bank}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{account.accountNo} • {account.type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteBank(account.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Disconnect Bank"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Feature Access Control
        </h3>
        <p className="text-slate-500 text-sm mb-6">Enable or disable features for General Access users.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(featureFlags).map(([key, value]: [string, any]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="font-bold capitalize">{key}</span>
              <button 
                onClick={() => setFeatureFlags({...featureFlags, [key]: !value})}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  value ? "bg-emerald-600" : "bg-slate-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  value ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 shadow-sm">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-rose-900">
          <AlertTriangle className="w-6 h-6" />
          Danger Zone
        </h3>
        <p className="text-rose-700 text-sm mb-6">These actions are irreversible. Please proceed with caution.</p>
        <button 
          onClick={onFactoryReset}
          className="px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Factory Reset System
        </button>
      </div>
    </motion.div>
  );
}

// --- Helper Components ---

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all",
        active ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-50"
      )}
    >
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      <span>{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 rounded-2xl transition-all",
        active ? "bg-emerald-100 text-emerald-600" : "text-slate-400"
      )}
    >
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </button>
  );
}

function CustomFieldsEditor({ fields, onChange }: { fields: Record<string, string>, onChange: (fields: Record<string, string>) => void }) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addField = () => {
    if (newKey.trim()) {
      onChange({ ...fields, [newKey.trim()]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  const removeField = (key: string) => {
    const newFields = { ...fields };
    delete newFields[key];
    onChange(newFields);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Plus className="w-3 h-3" /> Custom Fields
      </h4>
      
      <div className="space-y-2">
        {Object.entries(fields || {}).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 group">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <span className="text-xs font-bold text-slate-600 truncate">{key}</span>
              <span className="text-xs text-slate-500 truncate">{value}</span>
            </div>
            <button 
              type="button"
              onClick={() => removeField(key)}
              className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Field Name</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-emerald-500/20"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            placeholder="e.g. Color"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Value</label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-emerald-500/20"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            placeholder="e.g. Red"
          />
        </div>
        <button 
          type="button"
          onClick={addField}
          className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
