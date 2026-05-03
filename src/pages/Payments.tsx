import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  Receipt,
  Search,
  Plus,
  DollarSign,
  Coins,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Eye,
  Trash2,
  Filter,
  FileText,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
  paid: { color: 'bg-green-100 text-green-700 border-green-200', label: 'បានបង់', icon: CheckCircle2 },
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'រង់ចាំ', icon: Clock },
  overdue: { color: 'bg-red-100 text-red-700 border-red-200', label: 'ហួសកំណត់', icon: AlertTriangle },
  partial: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'បង់ខ្លះ', icon: DollarSign },
  cancelled: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'បានលុប', icon: X },
}

const paymentTypeLabels: Record<string, string> = {
  rent: 'ថ្លៃឈូឆ្នោត',
  deposit: 'ប្រាក់កក់',
  electricity: 'ថ្លៃភ្លើង',
  water: 'ថ្លៃទឹក',
  internet: 'អ៊ីនធឺណិត',
  trash: 'ថ្លៃសំរាម',
  maintenance: 'ជួសជុល',
  other: 'ផ្សេងៗ',
  penalty: 'ពិន័យ',
}

export default function Payments() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [currencyMode, setCurrencyMode] = useState<'usd' | 'riel' | 'both'>('usd')

  const utils = trpc.useUtils()
  const { data: payments, isLoading } = trpc.payment.list.useQuery({ search: search || undefined, status: statusFilter })
  const { data: stats } = trpc.payment.stats.useQuery()
  const { data: tenants } = trpc.tenant.list.useQuery({})
  const { data: rooms } = trpc.room.list.useQuery({})

  const createMutation = trpc.payment.create.useMutation({
    onSuccess: () => {
      utils.payment.list.invalidate()
      utils.payment.stats.invalidate()
      setIsCreateOpen(false)
      toast.success('បានបន្ថែមការទូទាត់ដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = trpc.payment.delete.useMutation({
    onSuccess: () => {
      utils.payment.list.invalidate()
      utils.payment.stats.invalidate()
      setDeleteConfirmId(null)
      toast.success('បានលុបដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const tenantId = Number(formData.get('tenantId'))
    const roomId = Number(formData.get('roomId'))
    
    createMutation.mutate({
      tenantId,
      roomId,
      paymentNumber: formData.get('paymentNumber') as string,
      paymentType: (formData.get('paymentType') as string) as any || 'rent',
      amountUSD: formData.get('amountUSD') as string || '0',
      amountRiel: formData.get('amountRiel') as string || '0',
      exchangeRate: formData.get('exchangeRate') as string || '4100',
      currency: (formData.get('currency') as string) as any || 'usd',
      paymentMethod: (formData.get('paymentMethod') as string) as any || 'cash',
      paymentDate: formData.get('paymentDate') as string,
      dueDate: formData.get('dueDate') as string || undefined,
      periodStart: formData.get('periodStart') as string || undefined,
      periodEnd: formData.get('periodEnd') as string || undefined,
      receiptNumber: formData.get('receiptNumber') as string || undefined,
      status: (formData.get('status') as string) as any || 'pending',
      notes: formData.get('notes') as string || undefined,
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
            <Receipt className="w-7 h-7 text-amber-500" />
            គ្រប់គ្រងការទូទាត់
          </h1>
          <p className="text-sm text-muted-foreground mt-1">តាមដានការទូទាត់ថ្លៃឈូឆ្នោត និងសេវាកម្មផ្សេងៗ</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            បានបង់: ${stats?.paid ?? 0}
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            រង់ចាំ: {stats?.pending ?? 0}
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            ហួស: {stats?.overdue ?? 0}
          </Badge>
          <Button onClick={() => setIsCreateOpen(true)} className="gradient-gold text-white">
            <Plus className="w-4 h-4 mr-2" />
            បន្ថែមការទូទាត់
          </Button>
        </div>
      </motion.div>

      {/* Revenue Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ចំណូលសរុប (USD)</p>
              <p className="text-lg font-bold">${(stats?.totalRevenueUSD ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ចំណូលសរុប (៛)</p>
              <p className="text-lg font-bold">៛{(stats?.totalRevenueRiel ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ចំណូលខែនេះ</p>
              <p className="text-lg font-bold">${(stats?.monthlyRevenueUSD ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ស្វែងរកលេខបង់ប្រាក់..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="ស្ថានភាព" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ទាំងអស់</SelectItem>
            <SelectItem value="paid">បានបង់</SelectItem>
            <SelectItem value="pending">រង់ចាំ</SelectItem>
            <SelectItem value="overdue">ហួសកំណត់</SelectItem>
            <SelectItem value="partial">បង់ខ្លះ</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Payments Table */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base khmer-text flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              បញ្ជីការទូទាត់
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground khmer-text">លេខបង់ប្រាក់</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground khmer-text">អ្នកជួល</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground khmer-text">ប្រភេទ</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground khmer-text">ចំនួន</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground khmer-text">ថ្ងៃបង់</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground khmer-text">ស្ថានភាព</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {payments?.map((payment: any) => {
                        const config = statusConfig[payment.status] || statusConfig.pending
                        const StatusIcon = config.icon
                        return (
                          <motion.tr
                            key={payment.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium">{payment.paymentNumber}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{payment.tenant?.fullNameKh ?? '-'}</p>
                                <p className="text-xs text-muted-foreground">បន្ទប់ {payment.room?.roomNumber ?? '-'}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="text-xs">
                                {paymentTypeLabels[payment.paymentType] || payment.paymentType}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                {Number(payment.amountUSD) > 0 && <p className="font-semibold">${Number(payment.amountUSD).toFixed(2)}</p>}
                                {Number(payment.amountRiel) > 0 && <p className="text-xs text-muted-foreground">៛{Number(payment.amountRiel).toLocaleString()}</p>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('km-KH') : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className={`${config.color} text-xs`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { setSelectedPayment(payment); setIsViewOpen(true) }}>
                                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setDeleteConfirmId(payment.id)}>
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
                {!payments?.length && (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">មិនទាន់មានការទូទាត់</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="khmer-text flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              បន្ថែមការទូទាត់ថ្មី
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">លេខបង់ប្រាក់ *</Label>
                <Input name="paymentNumber" required placeholder="PAY-2024-001" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ប្រភេទ *</Label>
                <Select name="paymentType" defaultValue="rent">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">ថ្លៃឈូឆ្នោត</SelectItem>
                    <SelectItem value="deposit">ប្រាក់កក់</SelectItem>
                    <SelectItem value="electricity">ថ្លៃភ្លើង</SelectItem>
                    <SelectItem value="water">ថ្លៃទឹក</SelectItem>
                    <SelectItem value="internet">អ៊ីនធឺណិត</SelectItem>
                    <SelectItem value="trash">ថ្លៃសំរាម</SelectItem>
                    <SelectItem value="maintenance">ជួសជុល</SelectItem>
                    <SelectItem value="other">ផ្សេងៗ</SelectItem>
                    <SelectItem value="penalty">ពិន័យ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">អ្នកជួល *</Label>
                <Select name="tenantId" required>
                  <SelectTrigger><SelectValue placeholder="ជ្រើសរើសអ្នកជួល" /></SelectTrigger>
                  <SelectContent>
                    {tenants?.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.fullNameKh}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">បន្ទប់ *</Label>
                <Select name="roomId" required>
                  <SelectTrigger><SelectValue placeholder="ជ្រើសរើសបន្ទប់" /></SelectTrigger>
                  <SelectContent>
                    {rooms?.map((r: any) => (
                      <SelectItem key={r.id} value={String(r.id)}>បន្ទប់ {r.roomNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">រូបិយប័ណ្ណ</Label>
              <Tabs value={currencyMode} onValueChange={(v) => setCurrencyMode(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="usd">USD ($)</TabsTrigger>
                  <TabsTrigger value="riel">រៀល (៛)</TabsTrigger>
                  <TabsTrigger value="both">ទាំងពីរ</TabsTrigger>
                </TabsList>
                <TabsContent value="usd" className="space-y-3 pt-3">
                  <div className="space-y-2">
                    <Label className="khmer-text">ចំនួន USD</Label>
                    <Input name="amountUSD" type="number" step="0.01" placeholder="0.00" />
                  </div>
                </TabsContent>
                <TabsContent value="riel" className="space-y-3 pt-3">
                  <div className="space-y-2">
                    <Label className="khmer-text">ចំនួន រៀល</Label>
                    <Input name="amountRiel" type="number" step="1" placeholder="0" />
                  </div>
                </TabsContent>
                <TabsContent value="both" className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="khmer-text">ចំនួន USD</Label>
                      <Input name="amountUSD" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label className="khmer-text">ចំនួន រៀល</Label>
                      <Input name="amountRiel" type="number" step="1" placeholder="0" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">អត្រាប្តូរប្រាក់ (៛/USD)</Label>
                <Input name="exchangeRate" type="number" defaultValue="4100" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">វិធីបង់ប្រាក់</Label>
                <Select name="paymentMethod" defaultValue="cash">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">សាច់ប្រាក់</SelectItem>
                    <SelectItem value="bank_transfer">ផ្ញើតាមធនាគារ</SelectItem>
                    <SelectItem value="aba">ABA</SelectItem>
                    <SelectItem value="wing">Wing</SelectItem>
                    <SelectItem value="acleda">ACLEDA</SelectItem>
                    <SelectItem value="qr_code">QR Code</SelectItem>
                    <SelectItem value="other">ផ្សេងៗ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ថ្ងៃបង់ប្រាក់ *</Label>
                <Input name="paymentDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ថ្ងៃកំណត់</Label>
                <Input name="dueDate" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">ស្ថានភាព</Label>
              <Select name="status" defaultValue="pending">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">បានបង់</SelectItem>
                  <SelectItem value="pending">រង់ចាំ</SelectItem>
                  <SelectItem value="overdue">ហួសកំណត់</SelectItem>
                  <SelectItem value="partial">បង់ខ្លះ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">កត់ចំណាំ</Label>
              <Input name="notes" placeholder="កត់ចំណាំពីការទូទាត់..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>បោះបង់</Button>
              <Button type="submit" className="gradient-gold text-white" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'កំពុងរក្សាទុក...' : 'បន្ថែមការទូទាត់'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="khmer-text">ព័ត៌មានការទូទាត់</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">លេខបង់ប្រាក់:</span>
                <span className="font-semibold">{selectedPayment.paymentNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ប្រភេទ:</span>
                <Badge variant="outline">{paymentTypeLabels[selectedPayment.paymentType]}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">អ្នកជួល:</span>
                <span>{selectedPayment.tenant?.fullNameKh ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">បន្ទប់:</span>
                <span>{selectedPayment.room?.roomNumber ?? '-'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ចំនួន USD:</span>
                <span className="font-semibold">${Number(selectedPayment.amountUSD).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ចំនួន រៀល:</span>
                <span className="font-semibold">៛{Number(selectedPayment.amountRiel).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">វិធីបង់:</span>
                <span>{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ថ្ងៃបង់:</span>
                <span>{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString('km-KH') : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ស្ថានភាព:</span>
                <Badge variant="outline" className={statusConfig[selectedPayment.status]?.color}>
                  {statusConfig[selectedPayment.status]?.label}
                </Badge>
              </div>
              {selectedPayment.notes && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">កត់ចំណាំ:</span>
                  <p className="text-sm mt-1">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="khmer-text text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              បញ្ជាក់ការលុប
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-center text-muted-foreground">តើអ្នកប្រាកដជាចង់លុបការទូទាត់នេះឬទេ?</p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>បោះបង់</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>លុប</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
