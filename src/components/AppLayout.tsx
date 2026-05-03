import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Building2,
  Receipt,
  FileText,
  Wallet,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'ផ្ទាំងគ្រប់គ្រង', labelEn: 'Dashboard' },
  { path: '/tenants', icon: Users, label: 'អ្នកជួល', labelEn: 'Tenants' },
  { path: '/rooms', icon: Building2, label: 'បន្ទប់/ផ្ទះ', labelEn: 'Rooms' },
  { path: '/contracts', icon: FileText, label: 'កិច្ចសន្យា', labelEn: 'Contracts' },
  { path: '/payments', icon: Receipt, label: 'ការទូទាត់', labelEn: 'Payments' },
  { path: '/expenses', icon: Wallet, label: 'ចំណាយ', labelEn: 'Expenses' },
  { path: '/qr-codes', icon: QrCode, label: 'លេខកូដ QR', labelEn: 'QR Codes' },
  { path: '/reports', icon: BarChart3, label: 'របាយការណ៍', labelEn: 'Reports' },
  { path: '/settings', icon: Settings, label: 'ការកំណត់', labelEn: 'Settings' },
]

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 z-40 h-full w-[280px] bg-white border-r border-amber-100/50 shadow-xl"
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-amber-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gradient-gold leading-tight">សុខលីផ្ទះជួល</h1>
                  <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Sokli House Rent</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-600/70">
                <Crown className="w-3 h-3" />
                <span>Premium Edition</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`nav-item group ${isActive ? 'active' : 'text-slate-600'}`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-amber-600'}`} />
                    <div className="flex-1">
                      <span className="text-sm khmer-text">{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-amber-500"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-amber-100/50">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-9 h-9 border-2 border-amber-200">
                  <AvatarImage src={user?.avatar ?? undefined} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-sm">
                    {user?.name?.charAt(0) ?? 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name ?? 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                ចាកចេញ
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth()
  
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-100/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="w-5 h-5 text-amber-700" />
        </Button>
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-gradient-gold text-sm">សុខលីផ្ទះជួល</span>
        </div>
        <Avatar className="w-8 h-8 border border-amber-200">
          <AvatarImage src={user?.avatar ?? undefined} />
          <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
            {user?.name?.charAt(0) ?? 'A'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30">
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Desktop sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex fixed top-4 left-4 z-50 w-8 h-8 items-center justify-center rounded-lg bg-white shadow-md border border-amber-100 hover:bg-amber-50 transition-colors"
      >
        {sidebarOpen ? <X className="w-4 h-4 text-amber-700" /> : <Menu className="w-4 h-4 text-amber-700" />}
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-0'
        } pt-16 lg:pt-0 min-h-screen`}
      >
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
