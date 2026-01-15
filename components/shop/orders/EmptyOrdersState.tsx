"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface EmptyOrdersStateProps {
  className?: string;
}

export function EmptyOrdersState({ className }: EmptyOrdersStateProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-[#D4AF37]" />
            </div>
          </div>
          {/* Decorative dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#D4AF37]/30 animate-pulse" />
          <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-[#D4AF37]/20 animate-pulse delay-100" />
          <div className="absolute top-1/2 -right-6 w-2 h-2 rounded-full bg-[#D4AF37]/40 animate-pulse delay-200" />
        </div>

        {/* Title and Description */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {t("orders.empty.title", { defaultValue: "No orders yet" })}
        </h3>
        <p className="text-gray-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
          {t("orders.empty.description", { 
            defaultValue: "Looks like you haven't placed any orders yet. Start exploring our collection and treat yourself to something special!" 
          })}
        </p>

        {/* CTA Button */}
        <Link href="/shop">
          <Button 
            className="bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all duration-300"
          >
            {t("orders.empty.startShopping", { defaultValue: "Start Shopping" })}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
