import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import QRCode from 'qrcode'
import {
  QrCode,
  Download,
  Printer,
  Users,
  Receipt,
  Home,
  Phone,
  DollarSign,
  Coins,
  MapPin,
  Calendar,
  Copy,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function QRDisplay({ data, title, subtitle, type }: { data: string; title: string; subtitle: string; type: 'tenant' | 'payment' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
    }
  }, [data])

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `sokli-qr-${type}-${Date.now()}.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
      toast.success('បានទាញយក QR Code')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('បានចម្លងទិន្នន័យ')
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="premium-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative bg-white p-4 rounded-2xl shadow-inner border border-slate-100">
              <canvas ref={canvasRef} className="rounded-xl" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] px-3 py-1 rounded-full font-medium">
                Sokli House Rent
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>

            <div className="mt-4 flex items-center gap-2 w-full max-w-xs bg-slate-50 rounded-lg p-2 border border-slate-100">
              <code className="text-[10px] text-slate-500 truncate flex-1">{data}</code>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                ទាញយក
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                ព្រីន
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function QRCodePage() {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  const [paymentTenantId, setPaymentTenantId] = useState<string>('')
  const [paymentRoomId, setPaymentRoomId] = useState<string>('')
  const [paymentAmountUSD, setPaymentAmountUSD] = useState('0')
  const [paymentAmountRiel, setPaymentAmountRiel] = useState('0')
  const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().slice(0, 7))

  const { data: tenants } = trpc.tenant.list.useQuery({})
  const { data: rooms } = trpc.room.list.useQuery({})
  const { data: tenantQRData } = trpc.qr.tenantInfo.useQuery(Number(selectedTenantId), { enabled: !!selectedTenantId })
  const { data: paymentQRData } = trpc.qr.generatePaymentData.useQuery({
    tenantId: Number(paymentTenantId) || 1,
    roomId: Number(paymentRoomId) || 1,
    amountUSD: paymentAmountUSD,
    amountRiel: paymentAmountRiel,
    paymentType: 'rent',
    month: paymentMonth,
  }, { enabled: !!paymentTenantId && !!paymentRoomId })

  const selectedTenant = tenants?.find((t: any) => String(t.id) === selectedTenantId)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
          <QrCode className="w-7 h-7 text-amber-500" />
          លេខកូដ QR
        </h1>
        <p className="text-sm text-muted-foreground mt-1">បង្កើត QR Code សម្រាប់អ្នកជួលសង់ឬបង់ប្រាក់</p>
      </motion.div>

      <Tabs defaultValue="tenant" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tenant" className="khmer-text">
            <Users className="w-4 h-4 mr-2" />
            ព័ត៌មានអ្នកជួល
          </TabsTrigger>
          <TabsTrigger value="payment" className="khmer-text">
            <Receipt className="w-4 h-4 mr-2" />
            ការទូទាត់
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="space-y-6 mt-6">
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="premium-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base khmer-text">ជ្រើសរើសអ្នកជួល</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="khmer-text">អ្នកជួល</Label>
                  <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសអ្នកជួល..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants?.map((t: any) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.fullNameKh} {t.room ? `(បន្ទប់ ${t.room.roomNumber})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTenant && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedTenant.fullNameKh}</p>
                        <p className="text-xs text-muted-foreground">{selectedTenant.phoneNumber}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-500" />
                        <span>{selectedTenant.phoneNumber}</span>
                      </div>
                      {selectedTenant.room && (
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-amber-500" />
                          <span>បន្ទប់ {selectedTenant.room.roomNumber}</span>
                        </div>
                      )}
                      {selectedTenant.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span>{selectedTenant.address}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {selectedTenantId && tenantQRData && (
              <QRDisplay
                type="tenant"
                data={JSON.stringify(tenantQRData.tenant)}
                title={tenantQRData.tenant.fullNameKh}
                subtitle={`បន្ទប់ ${tenantQRData.tenant.room?.roomNumber ?? 'N/A'} - សុខលីផ្ទះជួល`}
              />
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6 mt-6">
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="premium-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base khmer-text">បង្កើត QR សម្រាប់បង់ប្រាក់</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="khmer-text">អ្នកជួល</Label>
                  <Select value={paymentTenantId} onValueChange={setPaymentTenantId}>
                    <SelectTrigger><SelectValue placeholder="ជ្រើសរើសអ្នកជួល..." /></SelectTrigger>
                    <SelectContent>
                      {tenants?.map((t: any) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.fullNameKh}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">បន្ទប់</Label>
                  <Select value={paymentRoomId} onValueChange={setPaymentRoomId}>
                    <SelectTrigger><SelectValue placeholder="ជ្រើសរើសបន្ទប់..." /></SelectTrigger>
                    <SelectContent>
                      {rooms?.map((r: any) => (
                        <SelectItem key={r.id} value={String(r.id)}>បន្ទប់ {r.roomNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">ចំនួន USD</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="number" step="0.01" value={paymentAmountUSD} onChange={(e) => setPaymentAmountUSD(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">ចំនួន រៀល</Label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="number" step="1" value={paymentAmountRiel} onChange={(e) => setPaymentAmountRiel(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ខែបង់ប្រាក់</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="month" value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)} className="pl-10" />
                  </div>
                </div>
                  <div className="mt-3 flex items-center gap-2 text-amber-700 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Domnak Thom 5, Phnom Penh, Cambodia</span>
                  </div>
              </CardContent>
            </Card>

            {paymentQRData && (
              <QRDisplay
                type="payment"
                data={paymentQRData.qrData}
                title="QR សម្រាប់បង់ប្រាក់"
                subtitle={`សុខលីផ្ទះជួល - ${paymentMonth}`}
              />
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
