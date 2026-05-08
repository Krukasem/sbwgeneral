import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wrench, CalendarDays, Car, Users, Settings, 
  LogOut, Menu, X, Plus, CheckCircle, XCircle, Clock, 
  MapPin, AlertCircle, FileText, Check, ChevronRight, ChevronLeft,
  BarChart, Lock, Eye, Image as ImageIcon, Printer, DownloadCloud
} from 'lucide-react';

// --- Mock Data ---
const initialCategories = [
  { id: '1', name: 'ไฟฟ้า' },
  { id: '2', name: 'ประปา' },
  { id: '3', name: 'คอมพิวเตอร์/อุปกรณ์ ICT' },
  { id: '4', name: 'อินเทอร์เน็ต' },
  { id: '5', name: 'อาคารสถานที่' },
];

const initialRooms = [
  { id: 'r1', name: 'ห้องประชุม 1 (พิกุล)', capacity: 50, equipment: 'Projector, ไมค์, เครื่องเสียง', status: 'ready', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=300&q=80' },
  { id: 'r2', name: 'ห้องประชุม 2 (ราชพฤกษ์)', capacity: 120, equipment: 'Projector, Smart Board, เครื่องเสียงชุดใหญ่', status: 'ready', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=300&q=80' },
];

const initialCars = [
  { id: 'c1', plate: 'นข 1122 สระบุรี', type: 'รถตู้', capacity: 12, driver: 'นายสมชาย ใจดี', status: 'ready', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?auto=format&fit=crop&w=300&q=80' },
  { id: 'c2', plate: 'กท 9988 สระบุรี', type: 'รถกระบะ', capacity: 4, driver: 'นายสมหมาย มุ่งมั่น', status: 'ready', image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=300&q=80' },
];

const guestUser = { id: 'guest', name: 'ผู้ใช้งานทั่วไป', role: 'user' };
const adminUser = { id: 'a1', name: 'ผู้ดูแลระบบ', role: 'admin' };

// --- Google Sheets API Config ---
// นำ Web App URL ที่ได้จาก Google Apps Script มาใส่ที่นี่
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7aZEV_BwfsqVMLsL0P8zc9S7HpwdRmqJqLM1gzZsP94S-7rvgslpTzlUHhPmYFsgn/exec";

const syncToGoogleSheet = (action, data) => {
  if(!SCRIPT_URL || SCRIPT_URL.includes("ใส่_URL")) return;
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, data })
  }).catch(err => console.error("Sheet sync error:", err));
};

export default function App() {
  // --- States ---
  const [user, setUser] = useState(guestUser); // Default to guest
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Admin Credentials State
  const [adminCreds, setAdminCreds] = useState({ username: 'admin', password: 'password123' });

  // Data States
  const [tickets, setTickets] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [carBookings, setCarBookings] = useState([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  
  const [categories, setCategories] = useState(initialCategories);
  const [rooms, setRooms] = useState(initialRooms);
  const [cars, setCars] = useState(initialCars);

  // Load data from Google Sheets
  useEffect(() => {
    if (!SCRIPT_URL || SCRIPT_URL.includes("ใส่_URL")) {
      // โหลดข้อมูล Mock เมื่อยังไม่ได้ตั้งค่า Google Sheets
      setTickets([
        { id: 't1', title: 'แอร์ห้อง ม.4/1 ไม่เย็น', category: 'ไฟฟ้า', location: 'อาคาร 3 ห้อง 4/1', description: 'เปิดแล้วมีแต่ลมร้อนออกมาครับ', status: 'pending', createdBy: 'guest', requesterName: 'ครูสมศรี', requesterPhone: '0812345678', createdAt: new Date().toISOString(), image: null },
        { id: 't2', title: 'อินเทอร์เน็ตห้องพักครูหลุดบ่อย', category: 'อินเทอร์เน็ต', location: 'ห้องพักครูหมวดวิทย์', description: 'สัญญาณ Wifi หายไปเลยครับ', status: 'in_progress', createdBy: 'guest', requesterName: 'ครูสมปอง', requesterPhone: '0898765432', createdAt: new Date().toISOString(), image: null },
      ]);
      setRoomBookings([
        { id: 'rb1', roomId: 'r1', title: 'ประชุมหมวดวิชา', startTime: '2026-05-10T09:00', endTime: '2026-05-10T11:00', status: 'approved', createdBy: 'guest', requesterName: 'ครูสมศรี', requesterPhone: '0812345678' }
      ]);
      setIsLoadingDB(false);
      return;
    }

    fetch(`${SCRIPT_URL}?action=getAll`)
      .then(res => res.json())
      .then(data => {
        if(data.tickets) setTickets(data.tickets);
        if(data.roomBookings) setRoomBookings(data.roomBookings);
        if(data.carBookings) setCarBookings(data.carBookings);
        setIsLoadingDB(false);
      })
      .catch(err => {
        console.error("Fetch API error:", err);
        setIsLoadingDB(false);
      });
  }, []);

  // --- Auth Handlers ---
  const handleAdminLogin = (username, password) => {
    if (username === adminCreds.username && password === adminCreds.password) {
      setUser(adminUser);
      setShowAdminLogin(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(guestUser);
    setActiveTab('dashboard');
  };

  const navigate = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLoginModal 
          onClose={() => setShowAdminLogin(false)} 
          onLogin={handleAdminLogin} 
        />
      )}

      {/* Sidebar (Desktop) & Overlay (Mobile) */}
      <div className={`fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden print:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 text-center gap-3">
          <img src="https://img2.pic.in.th/SBW.png" alt="SBW Logo" className="h-16 w-auto hover:scale-105 transition-transform duration-300" />
          <div>
            <h1 className="font-black text-lg text-slate-800 tracking-tight">SBW General Portal</h1>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">ฝ่ายบริหารทั่วไป โรงเรียนสระบุรีวิทยาคม</p>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-2 flex-1 overflow-y-auto hide-scrollbar">
          <NavItem icon={<LayoutDashboard />} label="ภาพรวมระบบ" active={activeTab === 'dashboard'} onClick={() => navigate('dashboard')} />
          <NavItem icon={<Wrench />} label="ระบบแจ้งซ่อม" active={activeTab === 'helpdesk'} onClick={() => navigate('helpdesk')} />
          <NavItem icon={<CalendarDays />} label="จองห้องประชุม" active={activeTab === 'rooms'} onClick={() => navigate('rooms')} />
          <NavItem icon={<Car />} label="จองรถโรงเรียน" active={activeTab === 'cars'} onClick={() => navigate('cars')} />
          
          {user.role === 'admin' && (
            <div className="mt-6">
              <div className="px-4 mb-3 text-xs font-bold text-indigo-400/80 uppercase tracking-widest">ส่วนผู้ดูแลระบบ</div>
              <div className="space-y-2">
                <NavItem icon={<CheckCircle />} label="ระบบอนุมัติ" active={activeTab === 'approvals'} onClick={() => navigate('approvals')} />
                <NavItem icon={<BarChart />} label="รายงานสรุปผล" active={activeTab === 'reports'} onClick={() => navigate('reports')} />
                <NavItem icon={<Settings />} label="ตั้งค่าระบบ" active={activeTab === 'settings'} onClick={() => navigate('settings')} />
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-slate-100 bg-white/50">
          <div className="flex items-center gap-4 mb-5 px-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${user.role === 'admin' ? 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-red-200' : 'bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-blue-200'}`}>
              {user.role === 'admin' ? 'A' : 'G'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role === 'admin' ? 'สิทธิ์การจัดการระบบ' : 'ไม่ระบุตัวตน'}</p>
            </div>
          </div>
          {user.role === 'admin' ? (
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-rose-600 bg-rose-50 rounded-2xl hover:bg-rose-100 hover:text-rose-700 transition-all duration-200 active:scale-95">
              <LogOut size={18} /> ออกจากระบบ Admin
            </button>
          ) : (
            <button onClick={() => setShowAdminLogin(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 active:scale-95">
              <Lock size={18} /> เข้าสู่ระบบ Admin
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:overflow-visible print:h-auto">
        {/* Top Header (Mobile mainly) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between lg:hidden shadow-sm print:hidden sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img src="https://img2.pic.in.th/SBW.png" alt="SBW Logo" className="h-10 w-auto drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="font-black text-slate-800 tracking-tight leading-none">SBW General Portal</span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">ฝ่ายบริหารทั่วไป โรงเรียนสระบุรีวิทยาคม</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">
            <Menu size={22} />
          </button>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 hide-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 print:max-w-none">
            {isLoadingDB ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold">กำลังเชื่อมต่อฐานข้อมูล Google Sheets...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard user={user} tickets={tickets} roomBookings={roomBookings} carBookings={carBookings} />}
                {activeTab === 'helpdesk' && <Helpdesk user={user} tickets={tickets} setTickets={setTickets} categories={categories} />}
                {activeTab === 'rooms' && <RoomBooking user={user} rooms={rooms} roomBookings={roomBookings} setRoomBookings={setRoomBookings} />}
                {activeTab === 'cars' && <CarBooking user={user} cars={cars} carBookings={carBookings} setCarBookings={setCarBookings} />}
                {activeTab === 'approvals' && user.role === 'admin' && <Approvals roomBookings={roomBookings} setRoomBookings={setRoomBookings} carBookings={carBookings} setCarBookings={setCarBookings} rooms={rooms} cars={cars} />}
                {activeTab === 'reports' && user.role === 'admin' && <Reports tickets={tickets} roomBookings={roomBookings} carBookings={carBookings} rooms={rooms} cars={cars} categories={categories} />}
                {activeTab === 'settings' && user.role === 'admin' && <SettingsView categories={categories} setCategories={setCategories} rooms={rooms} setRooms={setRooms} cars={cars} setCars={setCars} adminCreds={adminCreds} setAdminCreds={setAdminCreds} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Components ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium text-sm
      ${active ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'}`}
  >
    {React.cloneElement(icon, { size: 20, className: active ? 'text-white' : '' })}
    <span className="tracking-wide">{label}</span>
  </button>
);

const AdminLoginModal = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onLogin(username, password)) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative animate-in fade-in zoom-in duration-300 border border-white/20">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors"><X size={20}/></button>
        <div className="text-center mb-8 mt-2">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-[1.5rem] rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-50">
            <Lock size={36} className="-rotate-3" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">ผู้ดูแลระบบ</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูล</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium rounded-2xl text-center animate-bounce">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 ml-1">ชื่อผู้ใช้</label>
            <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="Username" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 ml-1">รหัสผ่าน</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] transition-all mt-4 text-base tracking-wide">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Sub Views ---

const Dashboard = ({ user, tickets, roomBookings, carBookings }) => {
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const pendingRooms = roomBookings.filter(r => r.status === 'pending').length;
  const pendingCars = carBookings.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">ภาพรวมระบบ</h2>
        <p className="text-slate-500 mt-2 font-medium text-lg">ยินดีต้อนรับ, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="แจ้งซ่อมรอรับงาน" value={pendingTickets} icon={<AlertCircle size={28} />} color="from-rose-500 to-pink-500 text-white shadow-rose-200" />
        <StatCard title="แจ้งซ่อมกำลังดำเนินการ" value={inProgressTickets} icon={<Wrench size={28} />} color="from-amber-400 to-orange-500 text-white shadow-orange-200" />
        <StatCard title="รออนุมัติจองห้อง" value={pendingRooms} icon={<CalendarDays size={28} />} color="from-indigo-500 to-blue-500 text-white shadow-indigo-200" />
        <StatCard title="รออนุมัติจองรถ" value={pendingCars} icon={<Car size={28} />} color="from-emerald-400 to-teal-500 text-white shadow-teal-200" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500"><Wrench size={24}/></div>
            <h3 className="text-xl font-bold text-slate-800">รายการแจ้งซ่อมล่าสุด</h3>
          </div>
          <div className="space-y-4">
            {tickets.slice(0, 5).map(t => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all duration-300 group">
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.title}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">{t.location} <span className="mx-2 text-slate-300">•</span> {t.category}</p>
                </div>
                <StatusBadge status={t.status} type="ticket" />
              </div>
            ))}
            {tickets.length === 0 && <p className="text-slate-500 text-center py-6 font-medium">ยังไม่มีข้อมูล</p>}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><CalendarDays size={24}/></div>
            <h3 className="text-xl font-bold text-slate-800">การจองห้องประชุมเร็วๆ นี้</h3>
          </div>
          <div className="space-y-4">
            {roomBookings.filter(b => b.status === 'approved').slice(0, 5).map(b => (
              <div key={b.id} className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all duration-300 group">
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{b.title}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">{new Date(b.startTime).toLocaleString('th-TH')}</p>
                </div>
                <StatusBadge status={b.status} type="booking" />
              </div>
            ))}
            {roomBookings.filter(b => b.status === 'approved').length === 0 && <p className="text-slate-500 text-center py-6 font-medium">ยังไม่มีข้อมูล</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helpdesk System ---
const Helpdesk = ({ user, tickets, setTickets, categories }) => {
  const [view, setView] = useState('list'); // 'list' | 'form' | 'detail'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({ requesterName: '', requesterPhone: '', title: '', category: categories[0]?.name || '', location: '', description: '', image: null });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result }); // Save Base64 for mock
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicket = {
      id: 't' + Date.now(),
      ...formData,
      status: 'pending',
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };
    setTickets([newTicket, ...tickets]);
    syncToGoogleSheet('addTicket', newTicket);
    setView('list');
    setFormData({ requesterName: '', requesterPhone: '', title: '', category: categories[0]?.name || '', location: '', description: '', image: null });
  };

  const updateStatus = (id, newStatus) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    syncToGoogleSheet('updateTicketStatus', { id, status: newStatus });
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const viewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setView('detail');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">ระบบแจ้งซ่อม</h2>
        {view === 'list' ? (
           <button onClick={() => setView('form')} className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
             <Plus size={20} /> แจ้งซ่อมใหม่
           </button>
        ) : (
           <button onClick={() => setView('list')} className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
             กลับหน้ารายการ
           </button>
        )}
      </div>

      {view === 'form' && (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Wrench size={24}/></div>
              <h3 className="text-2xl font-bold text-slate-800">แบบฟอร์มแจ้งซ่อม</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">ชื่อ-นามสกุล ผู้แจ้ง</label>
                  <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" 
                    value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="ระบุชื่อของคุณ" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">เบอร์โทรศัพท์</label>
                  <input required type="tel" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" 
                    value={formData.requesterPhone} onChange={e => setFormData({...formData, requesterPhone: e.target.value})} placeholder="08X-XXX-XXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">หัวข้อปัญหา</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="เช่น แอร์ไม่เย็น, หลอดไฟเสีย" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">ประเภท</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">สถานที่/ห้อง</label>
                  <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="อาคาร/ชั้น/ห้อง" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">รายละเอียดเพิ่มเติม</label>
                <textarea rows="4" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="อธิบายลักษณะปัญหาเพิ่มเติม..."></textarea>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">แนบรูปภาพประกอบ</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-3xl p-6 text-center hover:bg-slate-50 transition-colors">
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   <ImageIcon size={32} className="mx-auto mb-3 text-indigo-400" />
                   <p className="text-sm font-medium text-slate-600">คลิก หรือ ลากไฟล์รูปภาพมาวางที่นี่</p>
                </div>
                {formData.image && (
                  <div className="mt-4 p-2 bg-slate-50 rounded-2xl inline-block border border-slate-200">
                    <img src={formData.image} alt="Preview" className="h-32 object-contain rounded-xl" />
                  </div>
                )}
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 active:scale-[0.98] transition-all">
                  ส่งข้อมูลแจ้งซ่อม
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {view === 'detail' && selectedTicket && (
        <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 border-b border-slate-100 pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg tracking-wider">TICKET #{selectedTicket.id.toUpperCase()}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 leading-tight">{selectedTicket.title}</h3>
                <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
                  <Clock size={16} /> แจ้งเมื่อ {new Date(selectedTicket.createdAt).toLocaleString('th-TH')}
                </p>
              </div>
              <div className="scale-110 origin-left md:origin-right"><StatusBadge status={selectedTicket.status} type="ticket" /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ข้อมูลผู้แจ้ง</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-200 shadow-sm">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{selectedTicket.requesterName}</p>
                      <p className="text-slate-500 font-medium text-sm">โทร. {selectedTicket.requesterPhone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">หมวดหมู่และสถานที่</h4>
                  <p className="font-bold text-slate-800 text-lg flex items-center flex-wrap gap-2">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-xl text-sm">{selectedTicket.category}</span> 
                    {selectedTicket.location}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">รายละเอียดปัญหา</h4>
                  <p className="bg-slate-50 p-5 rounded-3xl text-slate-700 font-medium leading-relaxed border border-slate-100">
                    {selectedTicket.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">รูปภาพประกอบ</h4>
                {selectedTicket.image && selectedTicket.image !== 'Error uploading image' ? (
                  <a 
                    href={selectedTicket.image} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 p-2 hover:opacity-90 transition-all cursor-pointer"
                    title="คลิกเพื่อดูรูปภาพขนาดเต็ม"
                  >
                    <img 
                      src={selectedTicket.image.includes('drive.google.com') 
                        ? `https://drive.google.com/thumbnail?id=${selectedTicket.image.match(/\/d\/(.+?)\//)?.[1]}&sz=w1000` 
                        : selectedTicket.image} 
                      alt="Ticket attachment" 
                      className="w-full h-auto max-h-80 object-contain rounded-2xl bg-white" 
                      onError={(e) => { 
                         e.target.onerror = null; 
                         // หากดึง Thumbnail ไม่ได้ ให้แสดงภาพ placeholder แจ้งเตือน
                         e.target.src = 'https://placehold.co/600x400/f8fafc/64748b?text=Preview+Unavailable\\nClick+to+view+full+image'; 
                      }}
                    />
                  </a>
                ) : (
                  <div className="w-full h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <ImageIcon size={28} className="text-slate-300" />
                    </div>
                    <p className="font-semibold">ไม่มีรูปภาพแนบ</p>
                  </div>
                )}
              </div>
            </div>

            {user.role === 'admin' && (
              <div className="border-t border-slate-100 pt-8 mt-4">
                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                  <label className="block text-sm font-bold text-indigo-900 mb-3 ml-1">จัดการอัปเดตสถานะงาน (Admin)</label>
                  <select 
                    className="w-full md:w-1/2 p-4 border border-indigo-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 bg-white font-bold text-slate-800 shadow-sm"
                    value={selectedTicket.status}
                    onChange={(e) => updateStatus(selectedTicket.id, e.target.value)}
                  >
                    <option value="pending">รอรับงาน (Pending)</option>
                    <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                    <option value="completed">เสร็จสิ้น (Completed)</option>
                    <option value="cancelled">ยกเลิก (Cancelled)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-6 font-bold uppercase tracking-wider w-1/3">รายละเอียดเรื่อง</th>
                  <th className="p-6 font-bold uppercase tracking-wider">สถานที่</th>
                  <th className="p-6 font-bold uppercase tracking-wider">ประเภท</th>
                  <th className="p-6 font-bold uppercase tracking-wider">สถานะ</th>
                  <th className="p-6 font-bold uppercase tracking-wider text-center">{user.role === 'admin' ? 'จัดการ' : 'การกระทำ'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6 cursor-pointer" onClick={() => viewDetails(t)}>
                      <div className="font-bold text-slate-800 text-lg flex items-center gap-3 group-hover:text-indigo-600 transition-colors">
                        {t.title} 
                        {t.image && t.image !== 'Error uploading image' && <span className="bg-indigo-50 p-1.5 rounded-lg text-indigo-500"><ImageIcon size={14} title="มีรูปภาพแนบ" /></span>}
                      </div>
                      <div className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                        <CalendarDays size={14}/> {new Date(t.createdAt).toLocaleDateString('th-TH')}
                        {t.requesterName && <><span className="text-slate-300">•</span> ผู้แจ้ง: <span className="text-slate-600">{t.requesterName}</span></>}
                      </div>
                    </td>
                    <td className="p-6 text-sm font-medium text-slate-600">{t.location}</td>
                    <td className="p-6 text-sm font-medium text-slate-600"><span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">{t.category}</span></td>
                    <td className="p-6"><StatusBadge status={t.status} type="ticket" /></td>
                    <td className="p-6 text-center">
                      {user.role === 'admin' ? (
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => viewDetails(t)} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="ดูรายละเอียด"><Eye size={18}/></button>
                          <select 
                            className="text-sm font-bold border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                            value={t.status}
                            onChange={(e) => updateStatus(t.id, e.target.value)}
                          >
                            <option value="pending">รอรับงาน</option>
                            <option value="in_progress">กำลังดำเนินการ</option>
                            <option value="completed">เสร็จสิ้น</option>
                            <option value="cancelled">ยกเลิก</option>
                          </select>
                        </div>
                      ) : (
                        <button onClick={() => viewDetails(t)} className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">ดูรายละเอียด</button>
                      )}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold text-lg">ยังไม่มีรายการแจ้งซ่อมในระบบ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Room Booking System ---
const RoomBooking = ({ user, rooms, roomBookings, setRoomBookings }) => {
  const [view, setView] = useState('calendar'); 
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ requesterName: '', requesterPhone: '', title: '', startTime: '', endTime: '', details: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const checkAvailability = (roomId, start, end) => {
    const sTime = new Date(start).getTime();
    const eTime = new Date(end).getTime();
    return !roomBookings.some(b => {
      if (b.roomId !== roomId || b.status === 'rejected' || b.status === 'cancelled') return false;
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return (sTime < bEnd && eTime > bStart); 
    });
  };

  const handleBook = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setErrorMsg('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น'); return;
    }
    if (!checkAvailability(selectedRoom.id, formData.startTime, formData.endTime)) {
      setErrorMsg('ห้องประชุมไม่ว่างในช่วงเวลาดังกล่าว (มีการจองซ้ำ)'); return;
    }
    const newBooking = { id: 'rb' + Date.now(), roomId: selectedRoom.id, ...formData, status: 'pending', createdBy: user.id };
    setRoomBookings([newBooking, ...roomBookings]);
    syncToGoogleSheet('addRoomBooking', newBooking);
    setView('my_bookings');
    setFormData({ requesterName: '', requesterPhone: '', title: '', startTime: '', endTime: '', details: '' });
  };

  const openBookForm = (room) => {
    setSelectedRoom(room); setView('book'); setErrorMsg('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">ระบบจองห้องประชุม</h2>
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl shadow-inner w-max">
          <button onClick={() => setView('calendar')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-blue-600 scale-100' : 'text-slate-500 hover:text-slate-800'}`}>ปฏิทิน</button>
          <button onClick={() => setView('list')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'list' || view === 'book' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>ดูห้องประชุม</button>
          <button onClick={() => setView('my_bookings')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'my_bookings' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>การจองทั้งหมด</button>
        </div>
      </div>

      {view === 'calendar' && <ScheduleCalendar bookings={roomBookings} items={rooms} itemKey="roomId" />}

      {view === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div key={room.id} className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden flex flex-col group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
              <div className="relative overflow-hidden h-56">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                <h3 className="absolute bottom-5 left-6 right-6 text-2xl font-black text-white leading-tight drop-shadow-md">{room.name}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 text-sm font-medium text-slate-600 mb-8 flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700"><div className="p-2 bg-white rounded-xl shadow-sm text-blue-500"><Users size={18}/></div> ความจุ: <span className="font-bold text-lg">{room.capacity}</span> ท่าน</div>
                  <div className="flex items-start gap-3"><div className="p-2 bg-white rounded-xl shadow-sm text-indigo-500 mt-1"><Wrench size={18}/></div> <span className="flex-1 text-slate-600 leading-relaxed pt-1">อุปกรณ์: {room.equipment}</span></div>
                </div>
                <button onClick={() => openBookForm(room)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-300">
                  ทำรายการจองห้องนี้
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'book' && selectedRoom && (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleBook} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
              <div>
                 <h3 className="text-2xl font-black text-slate-800">จอง {selectedRoom.name}</h3>
                 <p className="text-slate-500 font-medium mt-1">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อดำเนินการ</p>
              </div>
              <button onClick={() => setView('list')} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><X size={20}/></button>
            </div>
            
            {errorMsg && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-100 flex items-center gap-3 animate-bounce"><AlertCircle size={20}/> {errorMsg}</div>}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">ชื่อ-นามสกุล ผู้จอง</label>
                  <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="ระบุชื่อของคุณ" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">เบอร์โทรศัพท์</label>
                  <input required type="tel" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.requesterPhone} onChange={e => setFormData({...formData, requesterPhone: e.target.value})} placeholder="08X-XXX-XXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">หัวข้อการประชุม</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="เช่น ประชุมสรุปผลงานประจำเดือน" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">เวลาเริ่มต้น</label>
                  <input required type="datetime-local" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">เวลาสิ้นสุด</label>
                  <input required type="datetime-local" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">รายละเอียดความต้องการเพิ่มเติม</label>
                <textarea rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
                  value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="(ไม่บังคับ)"></textarea>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl active:scale-[0.98] transition-all">ยืนยันการจอง</button>
                <button type="button" onClick={() => setView('list')} className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 active:scale-[0.98] transition-all">ยกเลิก</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {view === 'my_bookings' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-6 font-bold uppercase tracking-wider">หัวข้อ / ห้อง</th>
                  <th className="p-6 font-bold uppercase tracking-wider">เวลา</th>
                  <th className="p-6 font-bold uppercase tracking-wider">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {roomBookings.map(b => {
                  const room = rooms.find(r => r.id === b.roomId);
                  return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-slate-800 text-lg mb-1">{b.title}</div>
                      <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                         <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg">{room?.name}</span> 
                         <span className="text-slate-300">•</span> ผู้จอง: {b.requesterName}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-base font-bold text-slate-700">{new Date(b.startTime).toLocaleString('th-TH')}</div>
                      <div className="text-sm font-medium text-slate-400 mt-1">ถึง {new Date(b.endTime).toLocaleString('th-TH')}</div>
                    </td>
                    <td className="p-6"><StatusBadge status={b.status} type="booking" /></td>
                  </tr>
                )})}
                {roomBookings.length === 0 && (
                  <tr><td colSpan="3" className="p-12 text-center text-slate-400 font-bold text-lg">ยังไม่มีประวัติการจอง</td></tr>
                )}
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Car Booking System ---
const CarBooking = ({ user, cars, carBookings, setCarBookings }) => {
  const [view, setView] = useState('calendar');
  const [selectedCar, setSelectedCar] = useState(null);
  const [formData, setFormData] = useState({ requesterName: '', requesterPhone: '', title: '', destination: '', passengers: 1, startTime: '', endTime: '' });

  const handleBook = (e) => {
    e.preventDefault();
    const newBooking = { id: 'cb' + Date.now(), carId: selectedCar.id, ...formData, status: 'pending', createdBy: user.id };
    setCarBookings([newBooking, ...carBookings]);
    syncToGoogleSheet('addCarBooking', newBooking);
    setView('my_bookings');
    setFormData({ requesterName: '', requesterPhone: '', title: '', destination: '', passengers: 1, startTime: '', endTime: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">ระบบจองรถโรงเรียน</h2>
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl shadow-inner w-max">
          <button onClick={() => setView('calendar')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-teal-600 scale-100' : 'text-slate-500 hover:text-slate-800'}`}>ปฏิทิน</button>
          <button onClick={() => setView('list')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'list' || view === 'book' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}>ดูรถที่ให้บริการ</button>
          <button onClick={() => setView('my_bookings')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'my_bookings' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}>การจองทั้งหมด</button>
        </div>
      </div>

      {view === 'calendar' && <ScheduleCalendar bookings={carBookings} items={cars} itemKey="carId" />}

      {view === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cars.map(car => (
            <div key={car.id} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col sm:flex-row items-center sm:items-start gap-8 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-50 to-emerald-100 rounded-[2rem] flex items-center justify-center text-teal-600 shadow-inner flex-shrink-0 overflow-hidden relative">
                {car.image ? (
                  <img src={car.image} alt={car.plate} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Car size={56} />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 mb-4">
                  <h3 className="text-2xl font-black text-slate-800">{car.plate}</h3>
                  <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 rounded-xl text-slate-600 tracking-wider uppercase">{car.type}</span>
                </div>
                <div className="text-sm font-medium text-slate-500 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <p className="flex justify-between"><span>พนักงานขับรถ:</span> <span className="font-bold text-slate-700">{car.driver}</span></p>
                  <p className="flex justify-between"><span>ความจุ:</span> <span className="font-bold text-slate-700">{car.capacity} ที่นั่ง</span></p>
                </div>
                <button 
                  onClick={() => { setSelectedCar(car); setView('book'); }}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-teal-600 shadow-md hover:shadow-teal-200 active:scale-95 transition-all duration-300"
                >
                  จองรถคันนี้
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'book' && selectedCar && (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleBook} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">จองรถทะเบียน {selectedCar.plate}</h3>
                <p className="text-slate-500 font-medium mt-1">กรุณากรอกข้อมูลการเดินทางให้ครบถ้วน</p>
              </div>
              <button onClick={() => setView('list')} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">ชื่อ-นามสกุล ผู้จอง</label>
                  <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                    value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="ระบุชื่อของคุณ" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">เบอร์โทรศัพท์</label>
                  <input required type="tel" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                    value={formData.requesterPhone} onChange={e => setFormData({...formData, requesterPhone: e.target.value})} placeholder="08X-XXX-XXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">จุดประสงค์การเดินทาง</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="เช่น ไปราชการ, แข่งขันทักษะ" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">สถานที่ปลายทาง</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                  value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="ระบุสถานที่ให้ชัดเจน" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">เวลาไป</label>
                  <input required type="datetime-local" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                    value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">เวลากลับ</label>
                  <input required type="datetime-local" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                    value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">จำนวนผู้โดยสาร (สูงสุด {selectedCar.capacity})</label>
                  <input required type="number" min="1" max={selectedCar.capacity} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                    value={formData.passengers} onChange={e => setFormData({...formData, passengers: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">แนบเอกสารอ้างอิง (ถ้ามี)</label>
                  <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-3.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer pt-1" />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-teal-200 hover:shadow-2xl hover:shadow-teal-300 active:scale-[0.98] transition-all">ส่งคำขอจองรถ</button>
                <button type="button" onClick={() => setView('list')} className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 active:scale-[0.98] transition-all">ยกเลิก</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {view === 'my_bookings' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-6 font-bold uppercase tracking-wider">เรื่อง / ปลายทาง</th>
                  <th className="p-6 font-bold uppercase tracking-wider">รถ</th>
                  <th className="p-6 font-bold uppercase tracking-wider">เวลาเดินทาง</th>
                  <th className="p-6 font-bold uppercase tracking-wider">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {carBookings.map(b => {
                  const car = cars.find(c => c.id === b.carId);
                  return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-slate-800 text-lg mb-1">{b.title}</div>
                      <div className="text-sm font-medium text-slate-500 flex items-center gap-2"><MapPin size={14} className="text-rose-400"/> {b.destination} <span className="text-slate-300">•</span> ผู้จอง: {b.requesterName}</div>
                    </td>
                    <td className="p-6 text-base font-bold text-teal-700">{car?.plate}</td>
                    <td className="p-6">
                      <div className="text-base font-bold text-slate-700">{new Date(b.startTime).toLocaleString('th-TH')}</div>
                      <div className="text-sm font-medium text-slate-400 mt-1">ถึง {new Date(b.endTime).toLocaleString('th-TH')}</div>
                    </td>
                    <td className="p-6"><StatusBadge status={b.status} type="booking" /></td>
                  </tr>
                )})}
                {carBookings.length === 0 && (
                  <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-bold text-lg">ยังไม่มีประวัติการจอง</td></tr>
                )}
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Approvals System (Admin Only) ---
const Approvals = ({ roomBookings, setRoomBookings, carBookings, setCarBookings, rooms, cars }) => {
  const [tab, setTab] = useState('rooms'); 

  const updateStatus = (list, setList, id, newStatus) => {
    setList(list.map(item => item.id === id ? { ...item, status: newStatus } : item));
    if (tab === 'rooms') syncToGoogleSheet('updateRoomStatus', { id, status: newStatus });
    if (tab === 'cars') syncToGoogleSheet('updateCarStatus', { id, status: newStatus });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">ระบบอนุมัติการจอง</h2>
      
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button onClick={() => setTab('rooms')} className={`pb-4 px-2 font-bold text-base transition-all border-b-4 ${tab === 'rooms' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
          การจองห้องประชุม <span className="ml-2 bg-indigo-100 text-indigo-700 py-0.5 px-2.5 rounded-full text-xs">{roomBookings.filter(b=>b.status==='pending').length}</span>
        </button>
        <button onClick={() => setTab('cars')} className={`pb-4 px-2 font-bold text-base transition-all border-b-4 ${tab === 'cars' ? 'text-teal-600 border-teal-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
          การจองรถโรงเรียน <span className="ml-2 bg-teal-100 text-teal-700 py-0.5 px-2.5 rounded-full text-xs">{carBookings.filter(b=>b.status==='pending').length}</span>
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-6 font-bold uppercase tracking-wider">รายการขออนุมัติ</th>
              <th className="p-6 font-bold uppercase tracking-wider">รายละเอียดสิ่งอำนวยความสะดวก</th>
              <th className="p-6 font-bold uppercase tracking-wider">วัน-เวลาที่ขอใช้</th>
              <th className="p-6 font-bold uppercase tracking-wider text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {tab === 'rooms' && roomBookings.map(b => {
               const room = rooms.find(r => r.id === b.roomId);
               return (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-slate-800 text-lg mb-1">{b.title}</div>
                    <div className="text-sm font-medium text-slate-500">โดย: {b.requesterName} {b.requesterPhone && <span className="text-slate-400 ml-1">({b.requesterPhone})</span>}</div>
                  </td>
                  <td className="p-6 text-base font-bold text-indigo-700">{room?.name}</td>
                  <td className="p-6">
                    <div className="text-base font-bold text-slate-700">{new Date(b.startTime).toLocaleString('th-TH')}</div>
                    <div className="text-sm font-medium text-slate-400 mt-1">ถึง {new Date(b.endTime).toLocaleString('th-TH')}</div>
                  </td>
                  <td className="p-6 text-center">
                    {b.status === 'pending' ? (
                      <div className="flex justify-center gap-3">
                        <button onClick={() => updateStatus(roomBookings, setRoomBookings, b.id, 'approved')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center gap-2"><Check size={18}/> อนุมัติ</button>
                        <button onClick={() => updateStatus(roomBookings, setRoomBookings, b.id, 'rejected')} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-2"><X size={18}/> ไม่อนุมัติ</button>
                      </div>
                    ) : (
                      <StatusBadge status={b.status} type="booking" />
                    )}
                  </td>
                </tr>
              )
            })}
            
            {tab === 'cars' && carBookings.map(b => {
               const car = cars.find(c => c.id === b.carId);
               return (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-slate-800 text-lg mb-1">{b.title}</div>
                    <div className="text-sm font-medium text-slate-500 flex flex-col gap-1">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-rose-400"/> ไป: {b.destination}</span>
                      <span>โดย: {b.requesterName} {b.requesterPhone && <span className="text-slate-400 ml-1">({b.requesterPhone})</span>}</span>
                    </div>
                  </td>
                  <td className="p-6 text-base font-bold text-teal-700">{car?.plate}</td>
                  <td className="p-6">
                    <div className="text-base font-bold text-slate-700">{new Date(b.startTime).toLocaleString('th-TH')}</div>
                    <div className="text-sm font-medium text-slate-400 mt-1">ถึง {new Date(b.endTime).toLocaleString('th-TH')}</div>
                  </td>
                  <td className="p-6 text-center">
                    {b.status === 'pending' ? (
                      <div className="flex justify-center gap-3">
                        <button onClick={() => updateStatus(carBookings, setCarBookings, b.id, 'approved')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center gap-2"><Check size={18}/> อนุมัติ</button>
                        <button onClick={() => updateStatus(carBookings, setCarBookings, b.id, 'rejected')} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-2"><X size={18}/> ไม่อนุมัติ</button>
                      </div>
                    ) : (
                      <StatusBadge status={b.status} type="booking" />
                    )}
                  </td>
                </tr>
              )
            })}

            {((tab === 'rooms' && roomBookings.length === 0) || (tab === 'cars' && carBookings.length === 0)) && (
               <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-bold text-lg">ยังไม่มีรายการขออนุมัติ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Reports System (Admin Only) ---
const Reports = ({ tickets, roomBookings, carBookings, rooms, cars, categories }) => {
  const [tab, setTab] = useState('helpdesk');

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;

  const totalRoomBookings = roomBookings.length;
  const approvedRooms = roomBookings.filter(b => b.status === 'approved').length;

  const totalCarBookings = carBookings.length;
  const approvedCars = carBookings.filter(b => b.status === 'approved').length;

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let dataToExport = [];
    let filename = 'report.csv';

    if (tab === 'helpdesk') {
      filename = 'helpdesk_report.csv';
      dataToExport = tickets.map(t => ({
        'รหัสงาน': t.id,
        'วันที่แจ้ง': new Date(t.createdAt).toLocaleString('th-TH'),
        'ผู้แจ้ง': t.requesterName,
        'เบอร์โทร': t.requesterPhone,
        'หัวข้อ': t.title,
        'สถานที่': t.location,
        'ประเภท': t.category,
        'สถานะ': t.status === 'pending' ? 'รอรับงาน' : t.status === 'in_progress' ? 'กำลังดำเนินการ' : t.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'
      }));
    } else if (tab === 'rooms') {
      filename = 'room_bookings_report.csv';
      dataToExport = roomBookings.map(b => ({
        'เรื่อง': b.title,
        'ห้อง': rooms.find(r => r.id === b.roomId)?.name || 'N/A',
        'ผู้จอง': b.requesterName,
        'เวลาเริ่ม': new Date(b.startTime).toLocaleString('th-TH'),
        'เวลาสิ้นสุด': new Date(b.endTime).toLocaleString('th-TH'),
        'สถานะ': b.status === 'approved' ? 'อนุมัติแล้ว' : b.status === 'pending' ? 'รออนุมัติ' : b.status === 'rejected' ? 'ไม่อนุมัติ' : 'ยกเลิก'
      }));
    } else if (tab === 'cars') {
      filename = 'car_bookings_report.csv';
      dataToExport = carBookings.map(b => ({
        'ปลายทาง': b.destination,
        'รถ': cars.find(c => c.id === b.carId)?.plate || 'N/A',
        'ผู้จอง': b.requesterName,
        'เวลาไป': new Date(b.startTime).toLocaleString('th-TH'),
        'เวลากลับ': new Date(b.endTime).toLocaleString('th-TH'),
        'จำนวนผู้โดยสาร': b.passengers,
        'สถานะ': b.status === 'approved' ? 'อนุมัติแล้ว' : b.status === 'pending' ? 'รออนุมัติ' : b.status === 'rejected' ? 'ไม่อนุมัติ' : 'ยกเลิก'
      }));
    }

    if(dataToExport.length === 0) {
      alert('ไม่มีข้อมูลให้ส่งออก');
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(obj => Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const csvContent = "\uFEFF" + headers + '\n' + rows; // Add BOM for Excel Thai support
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 print:p-0 print:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">รายงานสรุปผล</h2>
        <div className="flex gap-3 print:hidden">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-95">
            <Printer size={18} /> ส่งออก PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold hover:bg-emerald-500 hover:text-white shadow-sm transition-all active:scale-95">
            <DownloadCloud size={18} /> ส่งออก Excel
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 border-b border-slate-200 mb-6 print:hidden">
        <button onClick={() => setTab('helpdesk')} className={`pb-4 px-2 font-bold text-base transition-all border-b-4 ${tab === 'helpdesk' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>รายงานแจ้งซ่อม</button>
        <button onClick={() => setTab('rooms')} className={`pb-4 px-2 font-bold text-base transition-all border-b-4 ${tab === 'rooms' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>รายงานจองห้องประชุม</button>
        <button onClick={() => setTab('cars')} className={`pb-4 px-2 font-bold text-base transition-all border-b-4 ${tab === 'cars' ? 'text-teal-600 border-teal-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>รายงานจองรถโรงเรียน</button>
      </div>

      <div className="hidden print:block mb-6">
        <h3 className="text-xl font-bold border-b border-black pb-2">
          {tab === 'helpdesk' ? 'สรุปรายงานระบบแจ้งซ่อม' : tab === 'rooms' ? 'สรุปรายงานการใช้งานห้องประชุม' : 'สรุปรายงานการใช้งานรถโรงเรียน'}
        </h3>
        <p className="text-sm mt-2">พิมพ์เมื่อ: {new Date().toLocaleString('th-TH')}</p>
      </div>

      {tab === 'helpdesk' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4">
            <StatCard title="แจ้งซ่อมทั้งหมด" value={totalTickets} icon={<FileText size={28} />} color="from-slate-700 to-slate-900 text-white shadow-slate-200" />
            <StatCard title="เสร็จสิ้น" value={completedTickets} icon={<CheckCircle size={28} />} color="from-emerald-400 to-green-500 text-white shadow-green-200" />
            <StatCard title="กำลังดำเนินการ" value={inProgressTickets} icon={<Wrench size={28} />} color="from-amber-400 to-orange-500 text-white shadow-orange-200" />
            <StatCard title="รอรับงาน" value={pendingTickets} icon={<Clock size={28} />} color="from-rose-500 to-red-500 text-white shadow-red-200" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white print:shadow-none print:border-slate-200 print:rounded-lg">
              <h3 className="text-xl font-black text-slate-800 mb-6">สัดส่วนสถานะงาน</h3>
              <div className="space-y-6">
                <ProgressBar label="เสร็จสิ้น" count={completedTickets} total={totalTickets} color="bg-emerald-500" />
                <ProgressBar label="กำลังดำเนินการ" count={inProgressTickets} total={totalTickets} color="bg-amber-500" />
                <ProgressBar label="รอรับงาน" count={pendingTickets} total={totalTickets} color="bg-rose-500" />
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white print:shadow-none print:border-slate-200 print:rounded-lg">
              <h3 className="text-xl font-black text-slate-800 mb-6">แยกตามหมวดหมู่ปัญหา</h3>
              <div className="space-y-6">
                {categories.map(c => {
                  const count = tickets.filter(t => t.category === c.name).length;
                  return <ProgressBar key={c.id} label={c.name} count={count} total={totalTickets} color="bg-indigo-500" />;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'rooms' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
            <StatCard title="รายการจองทั้งหมด" value={totalRoomBookings} icon={<FileText size={28} />} color="from-blue-500 to-indigo-600 text-white shadow-blue-200" />
            <StatCard title="อนุมัติแล้ว" value={approvedRooms} icon={<CheckCircle size={28} />} color="from-emerald-400 to-green-500 text-white shadow-green-200" />
            <StatCard title="รออนุมัติ" value={roomBookings.filter(b => b.status === 'pending').length} icon={<Clock size={28} />} color="from-amber-400 to-orange-500 text-white shadow-orange-200" />
          </div>
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white print:shadow-none print:border-slate-200 print:rounded-lg">
            <h3 className="text-xl font-black text-slate-800 mb-6">ความถี่ในการใช้งานห้องประชุม</h3>
            <div className="space-y-6">
              {rooms.map(r => {
                const count = roomBookings.filter(b => b.roomId === r.id).length;
                return <ProgressBar key={r.id} label={r.name} count={count} total={totalRoomBookings} color="bg-blue-500" />;
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'cars' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
            <StatCard title="รายการจองทั้งหมด" value={totalCarBookings} icon={<FileText size={28} />} color="from-teal-500 to-emerald-600 text-white shadow-teal-200" />
            <StatCard title="อนุมัติแล้ว" value={approvedCars} icon={<CheckCircle size={28} />} color="from-emerald-400 to-green-500 text-white shadow-green-200" />
            <StatCard title="รออนุมัติ" value={carBookings.filter(b => b.status === 'pending').length} icon={<Clock size={28} />} color="from-amber-400 to-orange-500 text-white shadow-orange-200" />
          </div>
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white print:shadow-none print:border-slate-200 print:rounded-lg">
            <h3 className="text-xl font-black text-slate-800 mb-6">สถิติการใช้งานรถโรงเรียน</h3>
            <div className="space-y-6">
              {cars.map(c => {
                const count = carBookings.filter(b => b.carId === c.id).length;
                return <ProgressBar key={c.id} label={`${c.plate} (${c.type})`} count={count} total={totalCarBookings} color="bg-teal-500" />;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Settings (Admin Only) ---
const SettingsView = ({ categories, setCategories, rooms, setRooms, cars, setCars, adminCreds, setAdminCreds }) => {
  const [newCategory, setNewCategory] = useState('');
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', equipment: '', image: '' });
  const [newCar, setNewCar] = useState({ plate: '', type: 'รถตู้', capacity: '', driver: '', image: '' });
  
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');

  const handleAddCategory = () => {
    if (!newCategory) return;
    setCategories([...categories, { id: 'cat' + Date.now(), name: newCategory }]);
    setNewCategory('');
  };

  const handleAddRoom = () => {
    if (!newRoom.name) return;
    setRooms([...rooms, { 
      id: 'r' + Date.now(), 
      ...newRoom, 
      status: 'ready', 
      image: newRoom.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80' 
    }]);
    setNewRoom({ name: '', capacity: '', equipment: '', image: '' });
  };

  const handleAddCar = () => {
    if (!newCar.plate) return;
    setCars([...cars, { 
      id: 'c' + Date.now(), 
      ...newCar, 
      status: 'ready',
      image: newCar.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?auto=format&fit=crop&w=300&q=80'
    }]);
    setNewCar({ plate: '', type: 'รถตู้', capacity: '', driver: '', image: '' });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (pwdForm.old !== adminCreds.password) {
      setPwdMsg('รหัสผ่านเดิมไม่ถูกต้อง'); return;
    }
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdMsg('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน'); return;
    }
    setAdminCreds({ ...adminCreds, password: pwdForm.new });
    setPwdMsg('เปลี่ยนรหัสผ่านสำเร็จ!');
    setPwdForm({ old: '', new: '', confirm: '' });
    setTimeout(() => setPwdMsg(''), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">ตั้งค่าระบบ</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Change Admin Password */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white xl:col-span-2">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
             <div className="p-2 bg-slate-100 text-slate-600 rounded-xl"><Lock size={20}/></div>
             <h3 className="text-xl font-bold text-slate-800">เปลี่ยนรหัสผ่านผู้ดูแลระบบ</h3>
          </div>
          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            {pwdMsg && <div className={`p-4 text-sm font-bold rounded-2xl ${pwdMsg.includes('สำเร็จ') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>{pwdMsg}</div>}
            <input type="password" required value={pwdForm.old} onChange={e=>setPwdForm({...pwdForm, old: e.target.value})} placeholder="รหัสผ่านเดิม" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium" />
            <input type="password" required value={pwdForm.new} onChange={e=>setPwdForm({...pwdForm, new: e.target.value})} placeholder="รหัสผ่านใหม่" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium" />
            <input type="password" required value={pwdForm.confirm} onChange={e=>setPwdForm({...pwdForm, confirm: e.target.value})} placeholder="ยืนยันรหัสผ่านใหม่" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium" />
            <button type="submit" className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black hover:shadow-lg shadow-slate-900/20 active:scale-95 transition-all w-full mt-2">อัปเดตรหัสผ่าน</button>
          </form>
        </div>
        
        {/* จัดการหมวดหมู่แจ้งซ่อม */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-max">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Wrench size={20}/></div>
             <h3 className="text-xl font-bold text-slate-800">หมวดหมู่แจ้งซ่อม</h3>
          </div>
          <ul className="space-y-3 mb-6">
            {categories.map(c => (
              <li key={c.id} className="flex justify-between items-center p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors group">
                <span className="text-sm font-bold text-slate-700">{c.name}</span>
                <button onClick={() => setCategories(categories.filter(cat => cat.id !== c.id))} className="text-rose-400 hover:text-rose-600 bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow transition-all"><X size={16}/></button>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="เพิ่มหมวดหมู่ใหม่..." className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm transition-all" />
            <button onClick={handleAddCategory} className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-md active:scale-95 transition-all">เพิ่ม</button>
          </div>
        </div>

        {/* จัดการข้อมูลห้องประชุม */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><CalendarDays size={20}/></div>
             <h3 className="text-xl font-bold text-slate-800">ข้อมูลห้องประชุม</h3>
          </div>
          <ul className="space-y-3 mb-8 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
            {rooms.map(r => (
              <li key={r.id} className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors group">
                <div>
                  <span className="text-sm font-bold text-slate-800 block mb-1">{r.name}</span>
                  <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100">ความจุ: {r.capacity} ท่าน | อุปกรณ์: {r.equipment}</span>
                </div>
                <button onClick={() => setRooms(rooms.filter(room => room.id !== r.id))} className="text-rose-400 hover:text-rose-600 bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow transition-all ml-2"><X size={16}/></button>
              </li>
            ))}
          </ul>
          <div className="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <p className="text-sm font-black text-slate-700 uppercase tracking-widest">เพิ่มห้องประชุมใหม่</p>
            <input type="text" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} placeholder="ชื่อห้องประชุม" className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-sm transition-all" />
            <div className="flex gap-3">
              <input type="number" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} placeholder="ความจุ (ท่าน)" className="w-1/3 p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-sm transition-all" />
              <input type="text" value={newRoom.equipment} onChange={e => setNewRoom({...newRoom, equipment: e.target.value})} placeholder="อุปกรณ์ (เช่น Projector)" className="flex-1 p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-sm transition-all" />
            </div>
            <input type="text" value={newRoom.image} onChange={e => setNewRoom({...newRoom, image: e.target.value})} placeholder="URL รูปภาพห้อง (ถ้ามี)" className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-sm transition-all" />
            <button onClick={handleAddRoom} className="w-full mt-2 px-4 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 shadow-md active:scale-95 transition-all">บันทึกข้อมูลห้อง</button>
          </div>
        </div>

        {/* จัดการข้อมูลรถโรงเรียน */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white xl:col-span-2">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
             <div className="p-2 bg-teal-50 text-teal-600 rounded-xl"><Car size={20}/></div>
             <h3 className="text-xl font-bold text-slate-800">ข้อมูลรถโรงเรียน</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
            {cars.map(c => (
              <div key={c.id} className="flex justify-between items-start p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors group">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-base font-bold text-slate-800 block">{c.plate}</span>
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{c.type}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100 block w-max mt-2">คนขับ: {c.driver} | จุ: {c.capacity}</span>
                </div>
                <button onClick={() => setCars(cars.filter(car => car.id !== c.id))} className="text-rose-400 hover:text-rose-600 bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow transition-all ml-3"><X size={16}/></button>
              </div>
            ))}
          </div>
          <div className="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <p className="text-sm font-black text-slate-700 uppercase tracking-widest">เพิ่มรถโรงเรียนคันใหม่</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" value={newCar.plate} onChange={e => setNewCar({...newCar, plate: e.target.value})} placeholder="ทะเบียนรถ" className="p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 outline-none font-medium text-sm transition-all" />
              <select value={newCar.type} onChange={e => setNewCar({...newCar, type: e.target.value})} className="p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 outline-none font-bold text-sm transition-all">
                <option value="รถตู้">รถตู้</option>
                <option value="รถกระบะ">รถกระบะ</option>
                <option value="รถบัส">รถบัส</option>
                <option value="รถเก๋ง">รถเก๋ง</option>
              </select>
              <input type="number" value={newCar.capacity} onChange={e => setNewCar({...newCar, capacity: e.target.value})} placeholder="ความจุ (ที่นั่ง)" className="p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 outline-none font-medium text-sm transition-all" />
              <input type="text" value={newCar.driver} onChange={e => setNewCar({...newCar, driver: e.target.value})} placeholder="ชื่อพนักงานขับรถ" className="p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 outline-none font-medium text-sm transition-all" />
              <input type="text" value={newCar.image} onChange={e => setNewCar({...newCar, image: e.target.value})} placeholder="URL รูปภาพรถ (ถ้ามี)" className="p-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 outline-none font-medium text-sm transition-all sm:col-span-2" />
            </div>
            <button onClick={handleAddCar} className="w-full mt-2 px-4 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-teal-600 shadow-md active:scale-95 transition-all">บันทึกข้อมูลรถโรงเรียน</button>
          </div>
        </div>

      </div>
    </div>
  );
};


// --- Shared Components ---

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 print:shadow-none print:border-slate-200 print:rounded-xl print:p-4">
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-gradient-to-br ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-bold tracking-wide uppercase">{title}</p>
      <p className="text-3xl font-black text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ label, count, total, color }) => {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm font-bold mb-2">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{count} รายการ ({percentage}%)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
        <div className={`${color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const ScheduleCalendar = ({ bookings, items, itemKey }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-6 md:p-8 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
         <button onClick={prevMonth} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors"><ChevronLeft size={24}/></button>
         <h3 className="text-2xl font-black text-slate-800">
           {currentMonth.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
         </h3>
         <button onClick={nextMonth} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors"><ChevronRight size={24}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 min-w-[500px] overflow-x-auto hide-scrollbar">
         {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d, idx) => (
           <div key={d} className={`text-center font-black py-3 rounded-2xl text-sm ${idx === 0 || idx === 6 ? 'text-rose-400 bg-rose-50/50' : 'text-slate-500 bg-slate-50'}`}>{d}</div>
         ))}
         {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="p-2 border border-transparent bg-slate-50/30 rounded-2xl"></div>;
            
            const isToday = day.toDateString() === new Date().toDateString();
            const dayBookings = bookings.filter(b => {
               const bDate = new Date(b.startTime);
               return bDate.getDate() === day.getDate() && 
                      bDate.getMonth() === day.getMonth() && 
                      bDate.getFullYear() === day.getFullYear() && 
                      b.status !== 'rejected' && 
                      b.status !== 'cancelled';
            });

            return (
               <div key={i} className={`min-h-[120px] p-2.5 sm:p-3 border-2 rounded-[1.5rem] transition-colors ${isToday ? 'border-indigo-400 bg-indigo-50/30 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                  <div className={`text-right text-sm font-black mb-2 ${isToday ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-2 mt-1">
                     {dayBookings.map(b => {
                        const item = items.find(itm => itm.id === b[itemKey]);
                        const isApproved = b.status === 'approved';
                        return (
                           <div key={b.id} 
                             className={`text-[10px] sm:text-xs p-2 rounded-xl border-l-4 truncate cursor-default transition-all shadow-sm
                               ${isApproved ? 'bg-emerald-50/80 text-emerald-700 border-emerald-500 border-t-transparent border-r-transparent border-b-transparent hover:bg-emerald-100' 
                                            : 'bg-amber-50/80 text-amber-700 border-amber-500 border-t-transparent border-r-transparent border-b-transparent hover:bg-amber-100'}`} 
                             title={`[${isApproved ? 'อนุมัติแล้ว' : 'รออนุมัติ'}] ${b.title} - ${item?.name || item?.plate}`}
                           >
                              <div className="font-bold">{new Date(b.startTime).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}</div>
                              <div className="truncate font-medium opacity-90 mt-0.5">{item?.name || item?.plate}</div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );
};

const StatusBadge = ({ status, type }) => {
  let style = "px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 w-max tracking-wide";
  let text = "";
  let icon = null;

  if (type === 'ticket') {
    switch(status) {
      case 'pending': style += " bg-rose-50 text-rose-600 border border-rose-100"; text = "รอรับงาน"; icon = <Clock size={14}/>; break;
      case 'in_progress': style += " bg-amber-50 text-amber-600 border border-amber-100"; text = "กำลังดำเนินการ"; icon = <Wrench size={14}/>; break;
      case 'completed': style += " bg-emerald-50 text-emerald-600 border border-emerald-100"; text = "เสร็จสิ้น"; icon = <CheckCircle size={14}/>; break;
      case 'cancelled': style += " bg-slate-100 text-slate-500 border border-slate-200"; text = "ยกเลิก"; icon = <XCircle size={14}/>; break;
      default: text = status;
    }
  } else if (type === 'booking') {
    switch(status) {
      case 'pending': style += " bg-amber-50 text-amber-600 border border-amber-100"; text = "รออนุมัติ"; icon = <Clock size={14}/>; break;
      case 'approved': style += " bg-emerald-50 text-emerald-600 border border-emerald-100"; text = "อนุมัติแล้ว"; icon = <CheckCircle size={14}/>; break;
      case 'rejected': style += " bg-rose-50 text-rose-600 border border-rose-100"; text = "ไม่อนุมัติ"; icon = <XCircle size={14}/>; break;
      case 'cancelled': style += " bg-slate-100 text-slate-500 border border-slate-200"; text = "ยกเลิก"; icon = <XCircle size={14}/>; break;
      default: text = status;
    }
  }

  return <span className={style}>{icon} {text}</span>;
};