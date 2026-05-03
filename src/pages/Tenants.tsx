import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Home,
  Edit3,
  Trash2,
  X,
  UserCheck,
  UserX,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  blacklisted: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  active: 'សកម្ម',
  inactive: 'មិនសកម្ម',
  blacklisted: 'បញ្ជាក់បិទ',
}

export default function Tenants() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const utils = trpc.useUtils()
  const { data: tenants, isLoading } = trpc.tenant.list.useQuery({ search: search || undefined, status: statusFilter })
  const { data: stats } = trpc.tenant.stats.useQuery()

  const createMutation = trpc.tenant.create.useMutation({
    onSuccess: () => {
      utils.tenant.list.invalidate()
      utils.tenant.stats.invalidate()
      setIsCreateOpen(false)
      toast.success('បានបន្ថែមអ្នកជួលដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const updateMutation = trpc.tenant.update.useMutation({
    onSuccess: () => {
      utils.tenant.list.invalidate()
      utils.tenant.byId.invalidate()
      setIsEditOpen(false)
      toast.success('បានកែប្រែដោយជោគជ័យ')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = trpc.tenant.delete.useMutation({
    onSuccess: () => {
      utils.tenant.list.invalidate()
      utils.tenant.stats.invalidate()
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
      fullNameKh: formData.get('fullNameKh') as string,
      fullNameEn: formData.get('fullNameEn') as string || undefined,
      phoneNumber: formData.get('phoneNumber') as string,
      phoneNumber2: formData.get('phoneNumber2') as string || undefined,
      email: formData.get('email') as string || undefined,
      idCardNumber: formData.get('idCardNumber') as string || undefined,
      idCardType: (formData.get('idCardType') as string) as any || 'national_id',
      dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      nationality: formData.get('nationality') as string || 'Cambodian',
      occupation: formData.get('occupation') as string || undefined,
      workplace: formData.get('workplace') as string || undefined,
      emergencyContactName: formData.get('emergencyContactName') as string || undefined,
      emergencyContactPhone: formData.get('emergencyContactPhone') as string || undefined,
      emergencyContactRelation: formData.get('emergencyContactRelation') as string || undefined,
      address: formData.get('address') as string || undefined,
      province: formData.get('province') as string || undefined,
      district: formData.get('district') as string || undefined,
      commune: formData.get('commune') as string || undefined,
      village: formData.get('village') as string || undefined,
      familyMembers: Number(formData.get('familyMembers') || 1),
      vehicleInfo: formData.get('vehicleInfo') as string || undefined,
      status: (formData.get('status') as string) as any || 'active',
      notes: formData.get('notes') as string || undefined,
    })
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTenant) return
    const form = e.currentTarget
    const formData = new FormData(form)
    updateMutation.mutate({
      id: selectedTenant.id,
      fullNameKh: formData.get('fullNameKh') as string,
      fullNameEn: formData.get('fullNameEn') as string || undefined,
      phoneNumber: formData.get('phoneNumber') as string,
      phoneNumber2: formData.get('phoneNumber2') as string || undefined,
      email: formData.get('email') as string || undefined,
      idCardNumber: formData.get('idCardNumber') as string || undefined,
      idCardType: (formData.get('idCardType') as string) as any,
      dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      nationality: formData.get('nationality') as string || undefined,
      occupation: formData.get('occupation') as string || undefined,
      workplace: formData.get('workplace') as string || undefined,
      emergencyContactName: formData.get('emergencyContactName') as string || undefined,
      emergencyContactPhone: formData.get('emergencyContactPhone') as string || undefined,
      emergencyContactRelation: formData.get('emergencyContactRelation') as string || undefined,
      address: formData.get('address') as string || undefined,
      province: formData.get('province') as string || undefined,
      district: formData.get('district') as string || undefined,
      commune: formData.get('commune') as string || undefined,
      village: formData.get('village') as string || undefined,
      familyMembers: Number(formData.get('familyMembers') || 1),
      vehicleInfo: formData.get('vehicleInfo') as string || undefined,
      status: (formData.get('status') as string) as any,
      notes: formData.get('notes') as string || undefined,
    })
  }

  const openEdit = (tenant: any) => {
    setSelectedTenant(tenant)
    setIsEditOpen(true)
  }

  const openView = (tenant: any) => {
    setSelectedTenant(tenant)
    setIsViewOpen(true)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-500" />
            គ្រប់គ្រងអ្នកជួល
          </h1>
          <p className="text-sm text-muted-foreground mt-1">គ្រប់គ្រងព័ត៌មានអ្នកជួលទាំងអស់</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <UserCheck className="w-3 h-3 mr-1" />
            {stats?.active ?? 0} សកម្ម
          </Badge>
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            <UserX className="w-3 h-3 mr-1" />
            {stats?.inactive ?? 0} មិនសកម្ម
          </Badge>
          <Button onClick={() => setIsCreateOpen(true)} className="gradient-gold text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            បន្ថែមអ្នកជួល
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ស្វែងរកឈ្មោះ លេខទូរស័ព្ទ ឬលេខអត្តសញ្ញាណ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="ស្ថានភាព" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ទាំងអស់</SelectItem>
            <SelectItem value="active">សកម្ម</SelectItem>
            <SelectItem value="inactive">មិនសកម្ម</SelectItem>
            <SelectItem value="blacklisted">បញ្ជាក់បិទ</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tenant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {tenants?.map((tenant: any) => (
              <motion.div
                key={tenant.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="premium-card hover-lift overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 khmer-text">{tenant.fullNameKh}</h3>
                          {tenant.fullNameEn && <p className="text-xs text-muted-foreground">{tenant.fullNameEn}</p>}
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[tenant.status] || ''}>
                        {statusLabels[tenant.status] || tenant.status}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-amber-500" />
                        <span>{tenant.phoneNumber}</span>
                      </div>
                      {tenant.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4 text-amber-500" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                      )}
                      {tenant.room && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Home className="w-4 h-4 text-amber-500" />
                          <span>បន្ទប់ {tenant.room.roomNumber}</span>
                        </div>
                      )}
                      {tenant.address && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span className="truncate">{tenant.address}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('km-KH') : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openView(tenant)}>
                          <Eye className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEdit(tenant)}>
                          <Edit3 className="w-4 h-4 text-amber-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setDeleteConfirmId(tenant.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && !tenants?.length && (
        <motion.div variants={itemVariants} className="text-center py-16">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">មិនទាន់មានអ្នកជួល</h3>
          <p className="text-sm text-muted-foreground mt-1">ចាប់ផ្តើមដោយការបន្ថែមអ្នកជួលថ្មី</p>
        </motion.div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="khmer-text flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              បន្ថែមអ្នកជួលថ្មី
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal" className="khmer-text">ព័ត៌មានផ្ទាល់ខ្លួន</TabsTrigger>
                <TabsTrigger value="contact" className="khmer-text">ទំនាក់ទំនង</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">ឈ្មោះខ្មែរ *</Label>
                    <Input name="fullNameKh" required placeholder="ឧទាហរណ៍៖ សុខ សម្បត្តិ" />
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">ឈ្មោះអង់គ្លេស</Label>
                    <Input name="fullNameEn" placeholder="e.g. Sok Sambath" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">លេខទូរស័ព្ទ *</Label>
                    <Input name="phoneNumber" required placeholder="012 345 678" />
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">លេខទូរស័ព្ទទី ២</Label>
                    <Input name="phoneNumber2" placeholder="098 765 432" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">អ៊ីមែល</Label>
                    <Input name="email" type="email" placeholder="example@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">ថ្ងៃខែឆ្នាំកំណើត</Label>
                    <Input name="dateOfBirth" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">លេខអត្តសញ្ញាណ</Label>
                    <Input name="idCardNumber" placeholder="123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">ប្រភេទអត្តសញ្ញាណ</Label>
                    <Select name="idCardType" defaultValue="national_id">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national_id">អត្តសញ្ញាណប័ណ្ណ</SelectItem>
                        <SelectItem value="passport">លិខិតឆ្លងដែន</SelectItem>
                        <SelectItem value="driver_license">ប័ណ្ណបើកបរ</SelectItem>
                        <SelectItem value="other">ផ្សេងៗ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="contact" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="khmer-text">អាសយដ្ឋាន</Label>
                  <Input name="address" placeholder="ផ្លូវ... សង្កាត់... ខណ្ឌ..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">ខេត្ត/ក្រុង</Label>
                    <Input name="province" placeholder="ភ្នំពេញ" />
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">ស្រុក/ខណ្ឌ</Label>
                    <Input name="district" placeholder="ឫស្សីកែវ" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">ឃុំ/សង្កាត់</Label>
                    <Input name="commune" placeholder="ទួលសង្កែ" />
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">ភូមិ</Label>
                    <Input name="village" placeholder="ភូមិ ៥" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="khmer-text">ទំនាក់ទំនងបន្ទាន់</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input name="emergencyContactName" placeholder="ឈ្មោះ" />
                    <Input name="emergencyContactPhone" placeholder="លេខទូរស័ព្ទ" />
                    <Input name="emergencyContactRelation" placeholder="ទំនាក់ទំនង" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ការងារ</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input name="occupation" placeholder="មុខរបរ" />
                    <Input name="workplace" placeholder="កន្លែងធ្វើការ" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">សម្កាល់</Label>
                  <Input name="notes" placeholder="កត់ចំណាំ..." />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ស្ថានភាព</Label>
                  <Select name="status" defaultValue="active">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">សកម្ម</SelectItem>
                      <SelectItem value="inactive">មិនសកម្ម</SelectItem>
                      <SelectItem value="blacklisted">បញ្ជាក់បិទ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                បោះបង់
              </Button>
              <Button type="submit" className="gradient-gold text-white" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'កំពុងរក្សាទុក...' : 'បន្ថែមអ្នកជួល'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="khmer-text flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" />
              កែប្រែព័ត៌មានអ្នកជួល
            </DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="khmer-text">ឈ្មោះខ្មែរ *</Label>
                  <Input name="fullNameKh" defaultValue={selectedTenant.fullNameKh} required />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ឈ្មោះអង់គ្លេស</Label>
                  <Input name="fullNameEn" defaultValue={selectedTenant.fullNameEn || ''} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="khmer-text">លេខទូរស័ព្ទ *</Label>
                  <Input name="phoneNumber" defaultValue={selectedTenant.phoneNumber} required />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">លេខទូរស័ព្ទទី ២</Label>
                  <Input name="phoneNumber2" defaultValue={selectedTenant.phoneNumber2 || ''} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="khmer-text">អ៊ីមែល</Label>
                  <Input name="email" type="email" defaultValue={selectedTenant.email || ''} />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ថ្ងៃខែឆ្នាំកំណើត</Label>
                  <Input name="dateOfBirth" type="date" defaultValue={selectedTenant.dateOfBirth ? new Date(selectedTenant.dateOfBirth).toISOString().split('T')[0] : ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">អាសយដ្ឋាន</Label>
                <Input name="address" defaultValue={selectedTenant.address || ''} />
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">ស្ថានភាព</Label>
                <Select name="status" defaultValue={selectedTenant.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">សកម្ម</SelectItem>
                    <SelectItem value="inactive">មិនសកម្ម</SelectItem>
                    <SelectItem value="blacklisted">បញ្ជាក់បិទ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="khmer-text">កត់ចំណាំ</Label>
                <Input name="notes" defaultValue={selectedTenant.notes || ''} />
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="khmer-text">ព័ត៌មានលម្អិត</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedTenant.fullNameKh}</h3>
                  <Badge variant="outline" className={statusColors[selectedTenant.status]}>
                    {statusLabels[selectedTenant.status]}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">លេខទូរស័ព្ទ:</span> <span>{selectedTenant.phoneNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">អ៊ីមែល:</span> <span>{selectedTenant.email || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">លេខអត្តសញ្ញាណ:</span> <span>{selectedTenant.idCardNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ថ្ងៃខែឆ្នាំកំណើត:</span> <span>{selectedTenant.dateOfBirth ? new Date(selectedTenant.dateOfBirth).toLocaleDateString('km-KH') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">អាសយដ្ឋាន:</span> <span>{selectedTenant.address || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">បន្ទប់:</span> <span>{selectedTenant.room?.roomNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ការងារ:</span> <span>{selectedTenant.occupation || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">កន្លែងធ្វើការ:</span> <span>{selectedTenant.workplace || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ចំនួនសមាជិកគ្រួសារ:</span> <span>{selectedTenant.familyMembers}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">កត់ចំណាំ:</span> <span>{selectedTenant.notes || '-'}</span></div>
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
          <p className="text-sm text-center text-muted-foreground">
            តើអ្នកប្រាកដជាចង់លុបអ្នកជួលនេះឬទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
          </p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>បោះបង់</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>
              <Trash2 className="w-4 h-4 mr-2" />
              លុប
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
