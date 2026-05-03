import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-6xl font-bold text-gradient-gold mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-900 khmer-text mb-2">ទំព័រមិនត្រឹមត្រូវ</h2>
        <p className="text-muted-foreground mb-6">ទំព័រដែលអ្នកស្វែងរកមិនមានទេ</p>
        <Link to="/dashboard">
          <Button className="gradient-gold text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
