import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Users,
  Home,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
  active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'សកម្ម', icon: CheckCircle2 },
  expired: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'ផុតកំណត់', icon: Clock },
  terminated: { color: 'bg-red-100 text-red-700 border-red-200', label: 'បានបញ្ចប់', icon: XCircle },
  renewed: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'បានបន្ត', icon: RefreshCw },
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'សាច់ប្រាក់',
  bank_transfer: 'ផ្ញើតាមធនាគារ',
  aba: 'ABA',
  wing: 'Wing',
  acleda: 'ACLEDA',
  qr_code: 'QR Code',
}

export default function Contracts() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const utils = trpc.useUtils()
  const { data: contracts, isLoading } = trpc.contract.list.useQuery({ status: statusFilter })
  const { data: stats } = trpc.contract.stats.useQuery()
  const { data: tenants } = trpc.tenant.list.useQuery({ status: 'active' })
  const { data: rooms } = trpc.room.list.useQuery({ status: 'available' })

  const createMutation = trpc.contract.create.useMutation({
    onSuccess: () => {
      utils.contract.list.invalidate()
      utils.contract.stats.invalidate()
      setIsCreateOpen(false)
      toast.success('បានបន្ថែមកិច្ចសន្យាដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = trpc.contract.delete.useMutation({
    onSuccess: () => {
      utils.contract.list.invalidate()
      utils.contract.stats.invalidate()
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
      tenantId: Number(formData.get('tenantId')),
      roomId: Number(formData.get('roomId')),
      contractNumber: formData.get('contractNumber') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      monthlyRentUSD: formData.get('monthlyRentUSD') as string || '0',
      monthlyRentRiel: formData.get('monthlyRentRiel') as string || '0',
      depositUSD: formData.get('depositUSD') as string || '0',
      depositRiel: formData.get('depositRiel') as string || '0',
      paymentDay: Number(formData.get('paymentDay')) || 1,
      paymentMethod: (formData.get('paymentMethod') as string) as any || 'cash',
      electricityIncluded: formData.get('electricityIncluded') === 'on',
      waterIncluded: formData.get('waterIncluded') === 'on',
      internetIncluded: formData.get('internetIncluded') === 'on',
      trashIncluded: formData.get('trashIncluded') === 'on',
      otherTerms: formData.get('otherTerms') as string || undefined,
      status: 'active',
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-500" />
            កិច្ចសន្យា
          </h1>
          <p className="text-sm text-muted-foreground mt-1">គ្រប់គ្រងកិច្ចសន្យាជួលទាំងអស់</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            សកម្ម: {stats?.active ?? 0}
          </Badge>
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            <Clock className="w-3 h-3 mr-1" />
            ផុត: {stats?.expired ?? 0}
          </Badge>
          <Button onClick={() => setIsCreateOpen(true)} className="gradient-gold text-white">
            <Plus className="w-4 h-4 mr-2" />
            បន្ថែមកិច្ចសន្យា
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ស្វែងរកលេខកិច្ចសន្យា..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="ស្ថានភាព" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ទាំងអស់</SelectItem>
            <SelectItem value="active">សកម្ម</SelectItem>
            <SelectItem value="expired">ផុតកំណត់</SelectItem>
            <SelectItem value="terminated">បានបញ្ចប់</SelectItem>
            <SelectItem value="renewed">បានបន្ត</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {contracts?.map((contract: any) => {
              const config = statusConfig[contract.status] || statusConfig.active
              const StatusIcon = config.icon
              return (
                <motion.div key={contract.id} variants={itemVariants} layout exit={{ opacity: 0, x: -20 }}>
                  <Card className="premium-card hover-lift">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900">{contract.contractNumber}</h3>
                              <Badge variant="outline" className={`${config.color} text-xs`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {contract.tenant?.fullNameKh ?? 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                បន្ទប់ {contract.room?.roomNumber ?? 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 lg:border-l lg:border-slate-100 lg:pl-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold">${Number(contract.monthlyRentUSD).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">ថ្លៃឈូឆ្នោត/ខែ</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-amber-600">
                              {contract.startDate ? new Date(contract.startDate).toLocaleDateString('km-KH') : '-'} -
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contract.endDate ? new Date(contract.endDate).toLocaleDateString('km-KH') : '-'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setSelectedContract(contract); setIsViewOpen(true) }}>
                              <Eye className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setDeleteConfirmId(contract.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {!contracts?.length && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">មិនទាន់មានកិច្ចសន្យា</h3>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="khmer-text flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              បន្ថែមកិច្ចសន្យាថ្មី
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">លេខកិច្ចសន្យា *</Label>
                <Input name="contractNumber" required placeholder="CNT-2024-001" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ថ្ងៃបង់ប្រាក់</Label>
                <Input name="paymentDay" type="number" min="1" max="31" defaultValue="1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">អ្នកជួល *</Label>
                <Select name="tenantId" required>
                  <SelectTrigger><SelectValue placeholder="ជ្រើសរើស..." /></SelectTrigger>
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
                  <SelectTrigger><SelectValue placeholder="ជ្រើសរើស..." /></SelectTrigger>
                  <SelectContent>
                    {rooms?.map((r: any) => (
                      <SelectItem key={r.id} value={String(r.id)}>បន្ទប់ {r.roomNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ថ្ងៃចាប់ផ្តើម *</Label>
                <Input name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ថ្ងៃបញ្ចប់ *</Label>
                <Input name="endDate" type="date" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ថ្លៃឈូឆ្នោត USD</Label>
                <Input name="monthlyRentUSD" type="number" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ថ្លៃឈូឆ្នោត ៛</Label>
                <Input name="monthlyRentRiel" type="number" step="1" defaultValue="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ប្រាក់កក់ USD</Label>
                <Input name="depositUSD" type="number" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ប្រាក់កក់ ៛</Label>
                <Input name="depositRiel" type="number" step="1" defaultValue="0" />
              </div>
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="khmer-text">សេវាកម្មបញ្ចូល</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch name="electricityIncluded" id="elec" />
                  <Label htmlFor="elec" className="text-sm">ភ្លើង</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="waterIncluded" id="water" />
                  <Label htmlFor="water" className="text-sm">ទឹក</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="internetIncluded" id="net" />
                  <Label htmlFor="net" className="text-sm">អ៊ីនធឺណិត</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="trashIncluded" id="trash" />
                  <Label htmlFor="trash" className="text-sm">សំរាម</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">លក្ខខណ្ឌផ្សេងៗ</Label>
              <Input name="otherTerms" placeholder="លក្ខខណ្ឌបន្ថែម..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>បោះបង់</Button>
              <Button type="submit" className="gradient-gold text-white" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'កំពុងរក្សាទុក...' : 'បន្ថែមកិច្ចសន្យា'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="khmer-text">ព័ត៌មានកិច្ចសន្យា</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{selectedContract.contractNumber}</span>
                <Badge variant="outline" className={statusConfig[selectedContract.status]?.color}>
                  {statusConfig[selectedContract.status]?.label}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">អ្នកជួល:</span> <span>{selectedContract.tenant?.fullNameKh ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">បន្ទប់:</span> <span>{selectedContract.room?.roomNumber ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្ងៃចាប់ផ្តើម:</span> <span>{selectedContract.startDate ? new Date(selectedContract.startDate).toLocaleDateString('km-KH') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្ងៃបញ្ចប់:</span> <span>{selectedContract.endDate ? new Date(selectedContract.endDate).toLocaleDateString('km-KH') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្លៃឈូឆ្នោត USD:</span> <span className="font-semibold">${Number(selectedContract.monthlyRentUSD).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្លៃឈូឆ្នោត ៛:</span> <span className="font-semibold">៛{Number(selectedContract.monthlyRentRiel).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ប្រាក់កក់:</span> <span>${Number(selectedContract.depositUSD).toFixed(2)} / ៛{Number(selectedContract.depositRiel).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">វិធីបង់:</span> <span>{paymentMethodLabels[selectedContract.paymentMethod] || selectedContract.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្ងៃបង់ប្រចាំខែ:</span> <span>ថ្ងៃទី {selectedContract.paymentDay}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ភ្លើង:</span> <span>{selectedContract.electricityIncluded ? 'បញ្ចូល' : 'មិនបញ្ចូល'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ទឹក:</span> <span>{selectedContract.waterIncluded ? 'បញ្ចូល' : 'មិនបញ្ចូល'}</span></div>
              </div>
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
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              បញ្ជាក់ការលុប
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-center text-muted-foreground">តើអ្នកប្រាកដជាចង់លុបកិច្ចសន្យានេះឬទេ?</p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>បោះបង់</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>លុប</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
