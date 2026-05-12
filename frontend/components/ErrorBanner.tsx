import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-100">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} />
        <span>{message}</span>
      </div>
    </motion.div>
  );
}
