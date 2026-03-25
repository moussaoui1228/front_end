import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import loadingImg from "@/assets/loading-olives.jpg";

const BACKGROUND_DECORATIONS = [
  { top: '12%', left: '8%', rot: 45, size: 60, type: 1 },
  { top: '22%', left: '82%', rot: -30, size: 50, type: 2 },
  { top: '75%', left: '15%', rot: 15, size: 70, type: 1 },
  { top: '65%', left: '88%', rot: 120, size: 55, type: 2 },
  { top: '5%', left: '45%', rot: 90, size: 45, type: 1 },
  { top: '92%', left: '35%', rot: -45, size: 65, type: 2 },
  { top: '42%', left: '10%', rot: -15, size: 50, type: 1 },
  { top: '28%', left: '55%', rot: 180, size: 55, type: 2 },
  { top: '82%', left: '62%', rot: 22, size: 75, type: 1 },
  { top: '48%', left: '78%', rot: -90, size: 40, type: 2 },
  { top: '15%', left: '70%', rot: 30, size: 45, type: 1 },
  { top: '88%', left: '85%', rot: 10, size: 60, type: 2 },
  { top: '35%', left: '25%', rot: 160, size: 50, type: 1 },
  { top: '55%', left: '35%', rot: -10, size: 45, type: 2 },
  { top: '18%', left: '92%', rot: 75, size: 50, type: 1 },
  { top: '68%', left: '5%', rot: -120, size: 65, type: 2 },
  { top: '95%', left: '12%', rot: 40, size: 55, type: 1 },
  { top: '2%', left: '22%', rot: -15, size: 40, type: 2 },
  { top: '52%', left: '94%', rot: 200, size: 45, type: 1 },
  { top: '38%', left: '65%', rot: -50, size: 55, type: 2 },
];

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const interval = 20;
    const step = 100 / (duration / interval);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step + Math.random() * 0.8;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 100);
          return 100;
        }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col bg-[#F2EBE1]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >


      {/* Top Left Corner */}
      <div className="absolute top-0 left-0 w-48 md:w-64 lg:w-80 pointer-events-none z-10 opacity-80">
        <img
          src="/olive-corner.png"
          alt="Olive Corner decoration"
          className="w-full h-full"
          onError={(e) => e.currentTarget.style.display = "none"}
        />
      </div>

      {/* Bottom Right New Corner branch */}
      <div className="absolute bottom-0 right-0 w-48 md:w-64 lg:w-80 pointer-events-none z-10 opacity-80">
        <img
          src="/olive-corner-2.png"
          alt="Original Pinterest decoration"
          className="w-full h-full"
          onError={(e) => e.currentTarget.style.display = "none"}
        />
      </div>
      {/* Randomized tiny background decorative olives - FIXED & STATIC */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {BACKGROUND_DECORATIONS.map((olive, i) => (
          <img
            key={i}
            src={`/extra-${olive.type}.png`}
            alt="Decorative olive"
            style={{
              position: 'absolute',
              top: olive.top,
              left: olive.left,
              width: `${olive.size}px`,
              height: 'auto',
              opacity: 0.8,
              transform: `rotate(${olive.rot}deg)`,
              zIndex: 5
            }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ))}
      </div>
      <div className="absolute top-10 right-10 w-24 md:w-40 pointer-events-none z-10 opacity-60">
        <img
          src="/olive-branch-1.png"
          alt="Olive Branch decoration"
          className="w-full h-full object-contain"
          onError={(e) => e.currentTarget.style.display = "none"}
        />
      </div>

      <div className="absolute bottom-10 left-10 w-24 md:w-40 pointer-events-none z-10 opacity-60">
        <img
          src="/olive-branch-2.png"
          alt="Olive Branch decoration 2"
          className="w-full h-full object-contain"
          onError={(e) => e.currentTarget.style.display = "none"}
        />
      </div>




      {/* Brand name and Logo - Center */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <img
            src="/logo.png"
            alt="TAZDAYTH Logo"
            className="w-56 md:w-72 lg:w-96 mb-2 object-contain"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <p className="text-foreground/80 text-sm md:text-base tracking-[0.5em] uppercase mt-4">
            {t("loading.subtitle")}
          </p>
        </div>
      </div>

      {/* Progress bar - bottom */}
      <div className="relative z-20 w-full h-1 bg-foreground/10 mt-auto">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
