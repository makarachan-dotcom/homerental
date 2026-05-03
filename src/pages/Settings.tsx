import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  Settings,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  User,
  CreditCard,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function SettingsPage() {
  const { data: user } = trpc.auth.me.useQuery()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900 khmer-text flex items-center gap-2">
          <Settings className="w-7 h-7 text-amber-500" />
          ការកំណត់
        </h1>
        <p className="text-sm text-muted-foreground mt-1">កំណត់រចនាសម្ព័ន្ធប្រព័ន្ធ</p>
      </motion.div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="business" className="khmer-text">
            <Building2 className="w-4 h-4 mr-2" />
            ពាណិជ្ជកម្ម
          </TabsTrigger>
          <TabsTrigger value="payment" className="khmer-text">
            <CreditCard className="w-4 h-4 mr-2" />
            ទូទាត់
          </TabsTrigger>
          <TabsTrigger value="profile" className="khmer-text">
            <User className="w-4 h-4 mr-2" />
            ប្រូហ្វាល់
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6 mt-6">
          <motion.div variants={itemVariants}>
            <Card className="premium-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base khmer-text flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  ព័ត៌មានពាណិជ្ជកម្ម
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center border-2 border-amber-200">
                    <img src="/logo.png" alt="Sokli House Rent" className="w-14 h-14 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gradient-gold">សុខលីផ្ទះជួល</h3>
                    <p className="text-sm text-muted-foreground">Sokli House Rent</p>
                    <Badge variant="outline" className="mt-1 border-amber-200 text-amber-700 bg-amber-50">
                      Premium Edition
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">ឈ្មោះពាណិជ្ជកម្ម</Label>
                    <Input defaultValue="សុខលីផ្ទះជួល" />
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">ឈ្មោះអង់គ្លេស</Label>
                    <Input defaultValue="Sokli House Rent" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">ទីតាំង</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <Input defaultValue="Domnak Thom 5, Phnom Penh, Cambodia" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="khmer-text">លេខទូរស័ព្ទ</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                      <Input defaultValue="+855 12 345 678" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="khmer-text">អ៊ីមែល</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                      <Input defaultValue="info@soklihouse.com" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">គេហទំព័រ</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                    <Input defaultValue="www.soklihouse.com" />
                  </div>
                </div>
                <Button className="gradient-gold text-white">
                  <Save className="w-4 h-4 mr-2" />
                  រក្សាទុក
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6 mt-6">
          <motion.div variants={itemVariants}>
            <Card className="premium-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base khmer-text flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  ការកំណត់ទូទាត់
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="khmer-text">រូបិយប័ណ្ណលំនាំដើម</Label>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      USD ($)
                    </Button>
                    <Button variant="outline">
                      <span className="mr-2">៛</span>
                      រៀល (KHR)
                    </Button>
                    <Button variant="outline">
                      ទាំងពីរ
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">អត្រាប្តូរប្រាក់ (៛/USD)</Label>
                  <Input defaultValue="4100" />
                  <p className="text-xs text-muted-foreground">អត្រាប្តូរប្រាក់ប្រើសម្រាប់គណនា</p>
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">គណនី ABA</Label>
                  <Input placeholder="លេខគណនី ABA..." />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">គណនី ACLEDA</Label>
                  <Input placeholder="លេខគណនី ACLEDA..." />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">គណនី Wing</Label>
                  <Input placeholder="លេខគណនី Wing..." />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">បើក QR Code ទូទាត់</p>
                    <p className="text-xs text-muted-foreground">អនុញ្ញាតអោយអ្នកជួលបង់តាម QR Code</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="gradient-gold text-white">
                  <Save className="w-4 h-4 mr-2" />
                  រក្សាទុក
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <motion.div variants={itemVariants}>
            <Card className="premium-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base khmer-text flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  ព័ត៌មានគណនី
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-700">
                    {user?.name?.charAt(0) ?? 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold">{user?.name ?? 'Admin'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
                    <Badge variant="outline" className="mt-1 border-amber-200 text-amber-700 bg-amber-50">
                      {user?.role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'អ្នកប្រើប្រាស់'}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="khmer-text">ឈ្មោះ</Label>
                  <Input defaultValue={user?.name ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label className="khmer-text">អ៊ីមែល</Label>
                  <Input defaultValue={user?.email ?? ''} type="email" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">ការជូនដំណឹង</p>
                    <p className="text-xs text-muted-foreground">ទទួលការជូនដំណឹងតាមអ៊ីមែល</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">ការពារសុវត្ថិភាពពីរជាន់</p>
                    <p className="text-xs text-muted-foreground">បើក 2FA សម្រាប់សុវត្ថិភាពបន្ថែម</p>
                  </div>
                  <Switch />
                </div>
                <Button className="gradient-gold text-white">
                  <Save className="w-4 h-4 mr-2" />
                  រក្សាទុក
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
