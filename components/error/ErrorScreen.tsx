// components/error/ErrorScreen.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useMatchDayStore } from "@/lib/store";

interface ErrorScreenProps {
  error?: Error;
  reset?: () => void;
}

/**
 * A premium error screen displayed when the application crashes or fails critically.
 * Uses the Syne font for headings and features smooth animations.
 */
export function ErrorScreen({ error, reset }: ErrorScreenProps): React.JSX.Element {
  const { reset: resetStore } = useMatchDayStore();

  const handleFullReset = (): void => {
    resetStore();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-destructive/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center max-w-sm"
      >
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-8">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>

        <h1 
          className="text-4xl font-bold tracking-tight mb-4 text-foreground"
          style={{ fontFamily: "var(--font-syne, system-ui)" }}
        >
          A stadium-sized error occurred
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-10">
          The MatchDay AI hit an unexpected hurdle. We've logged the error and our groundskeepers are on it.
        </p>

        {error && (
          <div className="w-full bg-muted/50 border border-border rounded-xl p-3 mb-8 text-left">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Error Details</p>
            <p className="text-xs font-mono text-destructive break-all line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => reset ? reset() : window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={handleFullReset}
            className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground py-4 rounded-2xl font-bold text-sm hover:text-foreground active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4" />
            Return to Landing
          </button>
        </div>
      </motion.div>
    </div>
  );
}
