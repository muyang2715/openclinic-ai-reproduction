"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";

import { useCall } from "@/hooks/useCall";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CallFab() {
  const { isOpen, openForm } = useCall();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          className="fixed right-6 bottom-6 z-40"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={openForm}
                aria-label="Talk to the AI receptionist"
                className="relative flex size-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-soft-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {/* Pulsing rings to signal "call me" */}
                {!reduceMotion &&
                  [0, 1].map((ring) => (
                    <motion.span
                      key={ring}
                      className="absolute inset-0 rounded-full bg-brand-gradient"
                      initial={{ opacity: 0.4, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.8 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: ring * 1,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                <Phone className="relative z-10 size-6" strokeWidth={2.25} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Talk to the AI receptionist
            </TooltipContent>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
