import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'
import Tenants from './pages/Tenants'
import Rooms from './pages/Rooms'
import Payments from './pages/Payments'
import Contracts from './pages/Contracts'
import Expenses from './pages/Expenses'
import QRCodePage from './pages/QRCodePage'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AppLayout from './components/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth({ redirectOnUnauthenticated: true })
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-amber-700 font-medium">កំពុងផ្ទុក...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="payments" element={<Payments />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="qr-codes" element={<QRCodePage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
