import { useState } from 'react'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Coins,
  Users,
  Building2,
  Receipt,
  Home,
  Calendar,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
]

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data: monthlyData } = trpc.dashboard.monthlyRevenue.useQuery({ year })
  const { data: paymentStats } = trpc.payment.stats.useQuery()
  const { data: roomStats } = trpc.room.stats.useQuery()
  const { data: tenantStats } = trpc.tenant.stats.useQuery()

  const chartData = monthlyData?.map((d: any) => ({
    name: KHMER_MONTHS[d.month - 1],
    incomeUSD: Number(d.usd),
    incomeRiel: Number(d.riel) / 1000,
  })) ?? []

  const occupancyData = [
    { name: 'មានអ្នកជួល', value: roomStats?.occupied ?? 0, color: '#d4a843' },
    { name: 'ទំនេរ', value: roomStats?.available ?? 0, color: '#10b981' },
    { name: 'ជួសជុល', value: roomStats?.maintenance ?? 0, color: '#ef4444' },
  ]

  const revenueBreakdown = [
    { name: 'ថ្លៃឈូឆ្នោត', value: (paymentStats?.totalRevenueUSD ?? 0) * 0.7 },
    { name: 'ថ្លៃភ្លើង', value: (paymentStats?.totalRevenueUSD ?? 0) * 0.15 },
    { name: 'ថ្លៃទឹក', value: (paymentStats?.totalRevenueUSD ?? 0) * 0.08 },
    { name: 'ផ្សេងៗ', value: (paymentStats?.totalRevenueUSD ?? 0) * 0.07 },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-amber-500" />
            របាយការណ៍
          </h1>
          <p className="text-sm text-muted-foreground mt-1">វិភាគទិន្នន័យនិងរបាយការណ៍ហិរញ្ញវត្ថុ</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[140px] bg-white">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-amber-200 text-amber-700">
            <Download className="w-4 h-4 mr-2" />
            ទាញយក
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ចំណូលសរុប USD</p>
                <p className="text-lg font-bold">${(paymentStats?.totalRevenueUSD ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ចំណូលសរុប ៛</p>
                <p className="text-lg font-bold">៛{(paymentStats?.totalRevenueRiel ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">អ្នកជួលសកម្ម</p>
                <p className="text-lg font-bold">{tenantStats?.active ?? 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">បន្ទប់សរុប</p>
                <p className="text-lg font-bold">{roomStats?.total ?? 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base khmer-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                តារាងចំណូលប្រចាំខែ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revUsd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d4a843" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Area type="monotone" dataKey="incomeUSD" stroke="#d4a843" fill="url(#revUsd)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base khmer-text flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-500" />
                ស្ថានភាពបន្ទប់
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {occupancyData.map((item) => (
                  <div key={item.name} className="text-center">
                    <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Breakdown */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base khmer-text flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              ការវិភាគចំណូល
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" fill="#d4a843" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm khmer-text">ស្ថិតិការទូទាត់</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">បានបង់</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">{paymentStats?.paid ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">រង់ចាំ</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">{paymentStats?.pending ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ហួសកំណត់</span>
                <Badge variant="outline" className="bg-red-50 text-red-700">{paymentStats?.overdue ?? 0}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ចំនួនសរុប</span>
                <span className="font-bold">{paymentStats?.total ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm khmer-text">ស្ថិតិអ្នកជួល</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">សកម្ម</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">{tenantStats?.active ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">មិនសកម្ម</span>
                <Badge variant="outline" className="bg-slate-50 text-slate-700">{tenantStats?.inactive ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">បញ្ជាក់បិទ</span>
                <Badge variant="outline" className="bg-red-50 text-red-700">{tenantStats?.blacklisted ?? 0}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">សរុប</span>
                <span className="font-bold">{tenantStats?.total ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm khmer-text">ស្ថិតិបន្ទប់</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">មានអ្នកជួល</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">{roomStats?.occupied ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ទំនេរ</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">{roomStats?.available ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ជួសជុល</span>
                <Badge variant="outline" className="bg-red-50 text-red-700">{roomStats?.maintenance ?? 0}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">អត្រាជួល</span>
                <span className="font-bold text-amber-600">
                  {roomStats?.total ? Math.round((roomStats.occupied / roomStats.total) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
