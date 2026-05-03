import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, Crown, ArrowRight } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");
  const redirectUri = `${apiBaseUrl}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="premium-card border-amber-200/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center shadow-lg mb-4"
            >
              <Home className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gradient-gold khmer-text">
              សុខលីផ្ទះជួល
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Sokli House Rent Management</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Crown className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">Premium Edition</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">សូមចូលប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រងផ្ទះជួល</p>
              <p className="text-xs text-muted-foreground">Domnak Thom 5, Phnom Penh, Cambodia</p>
            </div>
            <Button
              className="w-full gradient-gold text-white hover:opacity-90 shadow-lg h-12 text-base"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              ចូលប្រើប្រាស់
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ដោយការចូល អ្នកប្រព្រឹត្តតាមលក្ខខណ្ឌនិងគោលការណ៍ភាពឯកជន
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
