import { Droplets, TrendingUp, ArrowRight, Info } from "lucide-react";
import { CalculationResult, PaymentMethod } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface CalculationPanelProps {
  result: CalculationResult | null;
  paymentMethod: PaymentMethod;
}

export default function CalculationPanel({
  result,
  paymentMethod,
}: CalculationPanelProps) {
  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Remplissez le formulaire pour voir l'estimation en temps réel.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={JSON.stringify(result)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-lg border border-primary/20 bg-primary/5 p-6 space-y-4"
      >
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Estimation en temps réel
        </h4>

        <div className="space-y-3">
          {/* Expected oil */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              Production d'huile estimée
            </span>
            <span className="font-semibold text-foreground">
              {result.expectedOilOutput.toFixed(1)} L
            </span>
          </div>

          {/* Producer share */}
          {paymentMethod === "oil_percentage" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Part producteur</span>
              <span className="font-semibold text-accent-foreground">
                − {result.producerShare.toFixed(1)} L
              </span>
            </div>
          )}

          {paymentMethod === "money" && result.totalCost !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coût de trituration</span>
              <span className="font-semibold text-accent-foreground">
                {result.totalCost.toLocaleString()} DA
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Client final */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
              Votre huile finale
            </span>
            <span className="text-lg font-bold text-primary">
              {result.clientFinalOil.toFixed(1)} L
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
