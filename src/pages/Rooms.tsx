import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  Building2,
  Search,
  Plus,
  Home,
  Edit3,
  Trash2,
  Eye,
  Filter,
  DollarSign,
  Zap,
  Droplets,
  Maximize,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Bookmark
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
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  available: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'ទំនេរ' },
  occupied: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Home, label: 'មានអ្នកជួល' },
  maintenance: { color: 'bg-red-100 text-red-700 border-red-200', icon: Wrench, label: 'ជួសជុល' },
  reserved: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Bookmark, label: 'រក្សាទុក' },
}

const roomTypeLabels: Record<string, string> = {
  single: 'បន្ទប់តែមួយ',
  double: 'បន្ទប់គូ',
  family: 'បន្ទប់គ្រួសារ',
  studio: 'ស្ទូឌីយោ',
  shop: 'ហាង',
}

export default function Rooms() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const utils = trpc.useUtils()
  const { data: rooms, isLoading } = trpc.room.list.useQuery({ search: search || undefined, status: statusFilter })
  const { data: stats } = trpc.room.stats.useQuery()

  const createMutation = trpc.room.create.useMutation({
    onSuccess: () => {
      utils.room.list.invalidate()
      utils.room.stats.invalidate()
      setIsCreateOpen(false)
      toast.success('បានបន្ថែមបន្ទប់ដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const updateMutation = trpc.room.update.useMutation({
    onSuccess: () => {
      utils.room.list.invalidate()
      setIsEditOpen(false)
      toast.success('បានកែប្រែដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = trpc.room.delete.useMutation({
    onSuccess: () => {
      utils.room.list.invalidate()
      utils.room.stats.invalidate()
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
      roomNumber: formData.get('roomNumber') as string,
      floor: formData.get('floor') as string || undefined,
      roomType: (formData.get('roomType') as string) as any || 'single',
      status: (formData.get('status') as string) as any || 'available',
      monthlyRentUSD: formData.get('monthlyRentUSD') as string || '0',
      monthlyRentRiel: formData.get('monthlyRentRiel') as string || '0',
      depositUSD: formData.get('depositUSD') as string || '0',
      depositRiel: formData.get('depositRiel') as string || '0',
      electricityRate: formData.get('electricityRate') as string || '0.25',
      waterRate: formData.get('waterRate') as string || '0.50',
      description: formData.get('description') as string || undefined,
      amenities: formData.get('amenities') as string || undefined,
      squareMeters: Number(formData.get('squareMeters')) || undefined,
    })
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRoom) return
    const form = e.currentTarget
    const formData = new FormData(form)
    updateMutation.mutate({
      id: selectedRoom.id,
      roomNumber: formData.get('roomNumber') as string,
      floor: formData.get('floor') as string || undefined,
      roomType: (formData.get('roomType') as string) as any,
      status: (formData.get('status') as string) as any,
      monthlyRentUSD: formData.get('monthlyRentUSD') as string || undefined,
      monthlyRentRiel: formData.get('monthlyRentRiel') as string || undefined,
      depositUSD: formData.get('depositUSD') as string || undefined,
      depositRiel: formData.get('depositRiel') as string || undefined,
      electricityRate: formData.get('electricityRate') as string || undefined,
      waterRate: formData.get('waterRate') as string || undefined,
      description: formData.get('description') as string || undefined,
      amenities: formData.get('amenities') as string || undefined,
      squareMeters: Number(formData.get('squareMeters')) || undefined,
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-500" />
            គ្រប់គ្រងបន្ទប់
          </h1>
          <p className="text-sm text-muted-foreground mt-1">គ្រប់គ្រងព័ត៌មានបន្ទប់និងផ្ទះជួលទាំងអស់</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {stats?.available ?? 0} ទំនេរ
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Home className="w-3 h-3 mr-1" />
            {stats?.occupied ?? 0} មានអ្នកជួល
          </Badge>
          <Button onClick={() => setIsCreateOpen(true)} className="gradient-gold text-white">
            <Plus className="w-4 h-4 mr-2" />
            បន្ថែមបន្ទប់
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ស្វែងរកលេខបន្ទប់..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="ស្ថានភាព" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ទាំងអស់</SelectItem>
            <SelectItem value="available">ទំនេរ</SelectItem>
            <SelectItem value="occupied">មានអ្នកជួល</SelectItem>
            <SelectItem value="maintenance">ជួសជុល</SelectItem>
            <SelectItem value="reserved">រក្សាទុក</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {rooms?.map((room: any) => {
              const config = statusConfig[room.status] || statusConfig.available
              const StatusIcon = config.icon
              return (
                <motion.div key={room.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="premium-card hover-lift overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Home className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">បន្ទប់ {room.roomNumber}</h3>
                            <p className="text-xs text-muted-foreground">{roomTypeLabels[room.roomType] || room.roomType}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">ថ្លៃឈូឆ្នោត/ខែ</p>
                            <p className="font-semibold">${Number(room.monthlyRentUSD).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Maximize className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">ទំហំ</p>
                            <p className="font-semibold">{room.squareMeters ? `${room.squareMeters} ម²` : '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">ថ្លៃភ្លើង</p>
                            <p className="font-semibold">${Number(room.electricityRate).toFixed(2)}/kWh</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Droplets className="w-4 h-4 text-cyan-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">ថ្លៃទឹក</p>
                            <p className="font-semibold">${Number(room.waterRate).toFixed(2)}/m³</p>
                          </div>
                        </div>
                      </div>

                      {room.amenities && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {room.amenities.split(',').map((a: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{a.trim()}</Badge>
                          ))}
                        </div>
                      )}

                      <Separator className="my-3" />

                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setSelectedRoom(room); setIsViewOpen(true) }}>
                          <Eye className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setSelectedRoom(room); setIsEditOpen(true) }}>
                          <Edit3 className="w-4 h-4 text-amber-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setDeleteConfirmId(room.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && !rooms?.length && (
        <motion.div variants={itemVariants} className="text-center py-16">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">មិនទាន់មានបន្ទប់</h3>
          <p className="text-sm text-muted-foreground mt-1">ចាប់ផ្តើមដោយការបន្ថែមបន្ទប់ថ្មី</p>
        </motion.div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="khmer-text flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              បន្ថែមបន្ទប់ថ្មី
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">លេខបន្ទប់ *</Label>
                <Input name="roomNumber" required placeholder="ឧទាហរណ៍៖ 101" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ជាន់</Label>
                <Input name="floor" placeholder="ឧទាហរណ៍៖ ១" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ប្រភេទបន្ទប់</Label>
                <Select name="roomType" defaultValue="single">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">បន្ទប់តែមួយ</SelectItem>
                    <SelectItem value="double">បន្ទប់គូ</SelectItem>
                    <SelectItem value="family">បន្ទប់គ្រួសារ</SelectItem>
                    <SelectItem value="studio">ស្ទូឌីយោ</SelectItem>
                    <SelectItem value="shop">ហាង</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ស្ថានភាព</Label>
                <Select name="status" defaultValue="available">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">ទំនេរ</SelectItem>
                    <SelectItem value="occupied">មានអ្នកជួល</SelectItem>
                    <SelectItem value="maintenance">ជួសជុល</SelectItem>
                    <SelectItem value="reserved">រក្សាទុក</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ថ្លៃឈូឆ្នោត (USD)</Label>
                <Input name="monthlyRentUSD" type="number" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ថ្លៃឈូឆ្នោត (៛)</Label>
                <Input name="monthlyRentRiel" type="number" step="1" defaultValue="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ប្រាក់កក់ (USD)</Label>
                <Input name="depositUSD" type="number" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ប្រាក់កក់ (៛)</Label>
                <Input name="depositRiel" type="number" step="1" defaultValue="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="khmer-text">ថ្លៃភ្លើង ($/kWh)</Label>
                <Input name="electricityRate" type="number" step="0.01" defaultValue="0.25" />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ថ្លៃទឹក ($/m³)</Label>
                <Input name="waterRate" type="number" step="0.01" defaultValue="0.50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">ទំហំ (ម²)</Label>
              <Input name="squareMeters" type="number" placeholder="ឧទាហរណ៍៖ ២៥" />
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">ការបរិភោគ</Label>
              <Input name="amenities" placeholder="ម៉ាស៊ីនត្រជាក់, ទូរទស្សន៍, ទូរខ្មោច..." />
            </div>
            <div className="space-y-2">
              <Label className="khmer-text">ពិពណ៌នា</Label>
              <Input name="description" placeholder="ពិពណ៌នាអំពីបន្ទប់..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>បោះបង់</Button>
              <Button type="submit" className="gradient-gold text-white" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'កំពុងរក្សាទុក...' : 'បន្ថែមបន្ទប់'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="khmer-text flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" />
              កែប្រែបន្ទប់
            </DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="khmer-text">លេខបន្ទប់ *</Label>
                  <Input name="roomNumber" defaultValue={selectedRoom.roomNumber} required />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ជាន់</Label>
                  <Input name="floor" defaultValue={selectedRoom.floor || ''} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="khmer-text">ប្រភេទបន្ទប់</Label>
                  <Select name="roomType" defaultValue={selectedRoom.roomType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">បន្ទប់តែមួយ</SelectItem>
                      <SelectItem value="double">បន្ទប់គូ</SelectItem>
                      <SelectItem value="family">បន្ទប់គ្រួសារ</SelectItem>
                      <SelectItem value="studio">ស្ទូឌីយោ</SelectItem>
                      <SelectItem value="shop">ហាង</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ស្ថានភាព</Label>
                  <Select name="status" defaultValue={selectedRoom.status}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">ទំនេរ</SelectItem>
                      <SelectItem value="occupied">មានអ្នកជួល</SelectItem>
                      <SelectItem value="maintenance">ជួសជុល</SelectItem>
                      <SelectItem value="reserved">រក្សាទុក</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="khmer-text">ថ្លៃឈូឆ្នោត (USD)</Label>
                  <Input name="monthlyRentUSD" type="number" step="0.01" defaultValue={Number(selectedRoom.monthlyRentUSD)} />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ថ្លៃឈូឆ្នោត (៛)</Label>
                  <Input name="monthlyRentRiel" type="number" step="1" defaultValue={Number(selectedRoom.monthlyRentRiel)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ពិពណ៌នា</Label>
                <Input name="description" defaultValue={selectedRoom.description || ''} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>បោះបង់</Button>
                <Button type="submit" className="gradient-gold text-white" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="khmer-text">ព័ត៌មានបន្ទប់</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Home className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">បន្ទប់ {selectedRoom.roomNumber}</h3>
                  <Badge variant="outline" className={statusConfig[selectedRoom.status]?.color}>
                    {statusConfig[selectedRoom.status]?.label}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">ប្រភេទ:</span> <span>{roomTypeLabels[selectedRoom.roomType]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ជាន់:</span> <span>{selectedRoom.floor || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ទំហំ:</span> <span>{selectedRoom.squareMeters ? `${selectedRoom.squareMeters} ម²` : '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្លៃឈូឆ្នោត USD:</span> <span>${Number(selectedRoom.monthlyRentUSD).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្លៃឈូឆ្នោត ៛:</span> <span>៛{Number(selectedRoom.monthlyRentRiel).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ប្រាក់កក់:</span> <span>${Number(selectedRoom.depositUSD).toFixed(2)} / ៛{Number(selectedRoom.depositRiel).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្លៃភ្លើង:</span> <span>${Number(selectedRoom.electricityRate).toFixed(2)}/kWh</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្លៃទឹក:</span> <span>${Number(selectedRoom.waterRate).toFixed(2)}/m³</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ការបរិភោគ:</span> <span>{selectedRoom.amenities || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ពិពណ៌នា:</span> <span>{selectedRoom.description || '-'}</span></div>
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
          <p className="text-sm text-center text-muted-foreground">តើអ្នកប្រាកដជាចង់លុបបន្ទប់នេះឬទេ?</p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>បោះបង់</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>លុប</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
