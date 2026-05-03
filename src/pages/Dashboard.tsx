import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  Building2,
  Users,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  Home,
  Zap,
  Droplets,
  Calendar,
  BarChart3,
  FileText
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
}

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
]

function StatCard({ title, titleEn, value, subtitle, icon: Icon, trend, trendValue, color }: any) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="premium-card hover-lift overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{titleEn}</p>
              <h3 className="text-sm font-semibold text-slate-700 mt-0.5 khmer-text">{title}</h3>
              <div className="mt-3">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {trend && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trendValue}
              </Badge>
              <span className="text-xs text-muted-foreground">ធៀបនឹងខែមុន</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RecentActivity() {
  const { data: activity, isLoading } = trpc.dashboard.recentActivity.useQuery()

  if (isLoading) return <Skeleton className="h-64 w-full" />

  return (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base khmer-text flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          សកម្មភាពថ្មីៗ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[360px] overflow-y-auto">
        {activity?.payments?.map((payment: any) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100"
          >
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{payment.tenant?.fullNameKh ?? 'មិនស្គាល់'}</p>
              <p className="text-xs text-muted-foreground">
                បង់{payment.paymentType === 'rent' ? 'ថ្លៃឈូឆ្នោត' : payment.paymentType} - បន្ទប់ {payment.room?.roomNumber ?? 'N/A'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-green-600">
                ${Number(payment.amountUSD).toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('km-KH') : ''}
              </p>
            </div>
          </motion.div>
        ))}
        {(!activity?.payments?.length) && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            មិនទាន់មានសកម្មភាព
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery()
  const { data: monthlyData } = trpc.dashboard.monthlyRevenue.useQuery({ year: new Date().getFullYear() })
  const { data: roomsStats } = trpc.room.stats.useQuery()

  const chartData = monthlyData?.map((d: any) => ({
    name: KHMER_MONTHS[d.month - 1],
    រៀល: Number(d.riel) / 1000,
    USD: Number(d.usd),
  })) ?? []

  const roomStatusData = [
    { name: 'គ្រប់គ្រង', value: roomsStats?.occupied ?? 0, color: '#d4a843' },
    { name: 'នៅទំនេរ', value: roomsStats?.available ?? 0, color: '#10b981' },
    { name: 'ជួសជុល', value: roomsStats?.maintenance ?? 0, color: '#ef4444' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 khmer-text">ផ្ទាំងគ្រប់គ្រង</h1>
          <p className="text-sm text-muted-foreground mt-1">សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងផ្ទះជួលសុខលី</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date().toLocaleDateString('km-KH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
            <Home className="w-3 h-3 mr-1" />
            Domnak Thom 5
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)
        ) : (
          <>
            <StatCard
              title="បន្ទប់សរុប"
              titleEn="Total Rooms"
              value={stats?.rooms?.total ?? 0}
              subtitle={`${stats?.rooms?.occupied ?? 0} កំពុងជួល`}
              icon={Building2}
              color="bg-gradient-to-br from-amber-500 to-amber-600"
            />
            <StatCard
              title="អតិថិជន"
              titleEn="Active Tenants"
              value={stats?.tenants?.active ?? 0}
              subtitle={`សរុប ${stats?.tenants?.total ?? 0}`}
              icon={Users}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              title="ចំណូលខែនេះ"
              titleEn="Monthly Revenue"
              value={`$${(stats?.payments?.monthlyRevenueUSD ?? 0).toFixed(2)}`}
              subtitle={`៛${(stats?.payments?.monthlyRevenueRiel ?? 0).toLocaleString()}`}
              icon={Receipt}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend="up"
              trendValue="12%"
            />
            <StatCard
              title="ចំណាយខែនេះ"
              titleEn="Monthly Expenses"
              value={`$${(stats?.expenses?.monthlyUSD ?? 0).toFixed(2)}`}
              subtitle="គិតត្រឹមខែនេះ"
              icon={Wallet}
              color="bg-gradient-to-br from-red-500 to-red-600"
            />
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">អត្រាជួល</p>
                <p className="text-lg font-bold">{stats?.rooms?.occupancyRate ?? 0}%</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">កិច្ចសន្យា</p>
                <p className="text-lg font-bold">{stats?.contracts?.active ?? 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">រង់ចាំបង់</p>
                <p className="text-lg font-bold">{stats?.payments?.pendingCount ?? 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="premium-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ហួសកំណត់</p>
                <p className="text-lg font-bold">{stats?.payments?.overdueCount ?? 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base khmer-text flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                តារាងចំណូលប្រចាំខែ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d4a843" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="USD" stroke="#d4a843" fillOpacity={1} fill="url(#colorUsd)" strokeWidth={2} />
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
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={roomStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roomStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {roomStatusData.map((item) => (
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

      {/* Activity + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        <motion.div variants={itemVariants}>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base khmer-text flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                ការជូនដំណឹងសំខាន់ៗ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">ថ្លៃទឹកប្រចាំខែ</p>
                  <p className="text-xs text-red-600/70">សូមបង់ថ្លៃទឹកមុនថ្ងៃទី ៥ នៃខែ</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700">ការអានភ្លើង</p>
                  <p className="text-xs text-amber-600/70">ដល់ពេលអានភ្លើងប្រចាំខែហើយ</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700">ចំណូលខ្ពស់</p>
                  <p className="text-xs text-blue-600/70">ចំណូលខែនេះខ្ពស់ជាងខែមុន ១៥%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
