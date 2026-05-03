import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  Wallet,
  Search,
  Plus,
  Trash2,
  Filter,
  DollarSign,
  Coins,
  Wrench,
  Zap,
  Package,
  Receipt,
  TrendingDown,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

const expenseTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  repair: { icon: Wrench, label: 'ជួសជុល', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  maintenance: { icon: Wrench, label: 'ថែទាំ', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  utility: { icon: Zap, label: 'សេវាជីវិត', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  supplies: { icon: Package, label: 'ទំនិញ', color: 'bg-green-100 text-green-700 border-green-200' },
  tax: { icon: Receipt, label: 'ពន្ធ', color: 'bg-red-100 text-red-700 border-red-200' },
  salary: { icon: DollarSign, label: 'ប្រាក់ខែ', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  insurance: { icon: ShieldIcon, label: 'ធានារ៉ាប់រង', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  marketing: { icon: TrendingDown, label: ' marketing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  other: { icon: Wallet, label: 'ផ្សេងៗ', color: 'bg-slate-100 text-slate-700 border-slate-200' },
}

function ShieldIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>; }

export default function Expenses() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const utils = trpc.useUtils()
  const { data: expenses, isLoading } = trpc.expense.list.useQuery({ search: search || undefined, type: typeFilter })
  const { data: stats } = trpc.expense.stats.useQuery()
  const { data: rooms } = trpc.room.list.useQuery({})

  const createMutation = trpc.expense.create.useMutation({
    onSuccess: () => {
      utils.expense.list.invalidate()
      utils.expense.stats.invalidate()
      setIsCreateOpen(false)
      toast.success('បានបន្ថែមចំណាយដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = trpc.expense.delete.useMutation({
    onSuccess: () => {
      utils.expense.list.invalidate()
      utils.expense.stats.invalidate()
      setDeleteConfirmId(null)
      toast.success('បានលុបដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    createMutation.mutate({
      expenseType: (formData.get('expenseType') as string) as any || 'other',
      description: formData.get('description') as string,
      amountUSD: formData.get('amountUSD') as string || '0',
      amountRiel: formData.get('amountRiel') as string || '0',
      expenseDate: formData.get('expenseDate') as string,
      vendor: formData.get('vendor') as string || undefined,
      receiptNumber: formData.get('receiptNumber') as string || undefined,
      roomId: Number(formData.get('roomId')) || undefined,
      status: 'paid',
      notes: formData.get('notes') as string || undefined,
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
            <Wallet className="w-7 h-7 text-amber-500" />
            គ្រប់គ្រងចំណាយ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">តាមដាននិងគ្រប់គ្រងចំណាយប្រចាំថ្ងៃ</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <TrendingDown className="w-3 h-3 mr-1" />
            សរុប: ${(stats?.totalUSD ?? 0).toFixed(2)}
          </Badge>
          <Button onClick={() => setIsCreateOpen(true)} className="gradient-gold text-white">
            <Plus className="w-4 h-4 mr-2" />
            បន្ថែមចំណាយ
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ចំណាយសរុប (USD)</p>
              <p className="text-lg font-bold">${(stats?.totalUSD ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ចំណាយសរុប (៛)</p>
              <p className="text-lg font-bold">៛{(stats?.totalRiel ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ចំណាយខែនេះ</p>
              <p className="text-lg font-bold">${(stats?.monthlyUSD ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ស្វែងរកចំណាយ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="ប្រភេទ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ទាំងអស់</SelectItem>
            <SelectItem value="repair">ជួសជុល</SelectItem>
            <SelectItem value="maintenance">ថែទាំ</SelectItem>
            <SelectItem value="utility">សេវាជីវិត</SelectItem>
            <SelectItem value="supplies">ទំនិញ</SelectItem>
            <SelectItem value="tax">ពន្ធ</SelectItem>
            <SelectItem value="salary">ប្រាក់ខែ</SelectItem>
            <SelectItem value="other">ផ្សេងៗ</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {expenses?.map((expense: any) => {
              const config = expenseTypeConfig[expense.expenseType] || expenseTypeConfig.other
              const Icon = config.icon
              return (
                <motion.div key={expense.id} variants={itemVariants} layout exit={{ opacity: 0, x: -20 }}>
                  <Card className="premium-card hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900">{expense.description}</h3>
                            <Badge variant="outline" className={`${config.color} text-xs`}>{config.label}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span>{expense.vendor || 'មិនស្គាល់'}</span>
                            <span>{expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString('km-KH') : ''}</span>
                            {expense.room && <span>បន្ទប់ {expense.room.roomNumber}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-red-600">-${Number(expense.amountUSD).toFixed(2)}</p>
                          {Number(expense.amountRiel) > 0 && <p className="text-xs text-muted-foreground">-៛{Number(expense.amountRiel).toLocaleString()}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={() => setDeleteConfirmId(expense.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {!expenses?.length && (
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">មិនទាន់មានចំណាយ</h3>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="khmer-text flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              បន្ថែមចំណាយថ្មី
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="khmer-text">ប្រភេទចំណាយ</Label>
              <Select name="expenseType" defaultValue="other">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">ជួសជុល</SelectItem>
                  <SelectItem value="maintenance">ថែទាំ</SelectItem>
                  <SelectItem value="utility">សេវាជីវិត</SelectItem>
                  <SelectItem value="supplies">ទំនិញ</SelectItem>
                  <SelectItem value="tax">ពន្ធ</SelectItem>
                  <SelectItem value="salary">ប្រាក់ខែ</SelectItem>
                  <SelectItem value="insurance">ធានារ៉ាប់រង</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">ផ្សេងៗ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">ពិពណ៌នា *</Label>
              <Input name="description" required placeholder="ឧទាហរណ៍៖ ជួសជុលម៉ាស៊ីនត្រជាក់" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ចំនួន USD</Label>
                <Input name="amountUSD" type="number" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ចំនួន រៀល</Label>
                <Input name="amountRiel" type="number" step="1" defaultValue="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ថ្ងៃចំណាយ *</Label>
                <Input name="expenseDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">អ្នកលក់</Label>
                <Input name="vendor" placeholder="ឈ្មោះហាង/ក្រុមហ៊ុន" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">បន្ទប់ (ជាជម្រើស)</Label>
              <Select name="roomId">
                <SelectTrigger><SelectValue placeholder="ជ្រើសរើសបន្ទប់..." /></SelectTrigger>
                <SelectContent>
                  {rooms?.map((r: any) => (
                    <SelectItem key={r.id} value={String(r.id)}>បន្ទប់ {r.roomNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">កត់ចំណាំ</Label>
              <Input name="notes" placeholder="កត់ចំណាំ..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>បោះបង់</Button>
              <Button type="submit" className="gradient-gold text-white" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'កំពុងរក្សាទុក...' : 'បន្ថែមចំណាយ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="khmer-text text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              បញ្ជាក់ការលុប
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-center text-muted-foreground">តើអ្នកប្រាកដជាចង់លុបចំណាយនេះឬទេ?</p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>បោះបង់</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>លុប</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
