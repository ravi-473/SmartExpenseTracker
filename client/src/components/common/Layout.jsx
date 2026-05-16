// src/components/common/Layout.jsx — Premium modern sidebar
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CreditCard, BarChart3, Brain, ScanLine,
  MessageSquare, User, LogOut, Moon, Sun, Menu, X,
  Wallet, ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',   color: 'text-blue-500' },
  { path: '/expenses',     icon: CreditCard,       label: 'Expenses',    color: 'text-violet-500' },
  { path: '/analytics',   icon: BarChart3,         label: 'Analytics',   color: 'text-emerald-500' },
  { path: '/ai-insights', icon: Brain,             label: 'AI Insights', color: 'text-pink-500' },
  { path: '/ocr-scanner', icon: ScanLine,          label: 'Bill Scanner',color: 'text-orange-500' },
  { path: '/sms-parser',  icon: MessageSquare,     label: 'SMS Parser',  color: 'text-cyan-500' },
  { path: '/profile',     icon: User,              label: 'Profile',     color: 'text-gray-500' },
];

function NavItem({ path, icon: Icon, label, color, onClick }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? 'text-blue-500' : color + ' opacity-70 group-hover:opacity-100'} />
          <span className="flex-1">{label}</span>
          {isActive && <ChevronRight size={13} className="text-blue-400 opacity-60" />}
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
          <Wallet size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900 dark:text-white leading-none">Smart Expense</p>
          <p className="text-xs text-gray-400 mt-0.5">AI Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2 mt-1">Main</p>
        {navItems.slice(0, 4).map((item) => (
          <NavItem key={item.path} {...item} onClick={() => setSidebarOpen(false)} />
        ))}

        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2 mt-4">Tools</p>
        {navItems.slice(4).map((item) => (
          <NavItem key={item.path} {...item} onClick={() => setSidebarOpen(false)} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 space-y-0.5">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all"
        >
          {darkMode
            ? <Sun size={17} className="text-yellow-400" />
            : <Moon size={17} className="text-gray-400" />
          }
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={17} /> Logout
        </button>

        {/* User pill */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0f] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-white dark:bg-gray-900/80 border-r border-gray-100 dark:border-gray-800/50 flex-shrink-0 backdrop-blur">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800/50 backdrop-blur">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Wallet size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">Smart Expense Tracker</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 lg:pl-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
