import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Droplets, Banknote } from "lucide-react";
import { CalculationResult, PaymentMethod, ProducerProfile } from "../types";

interface ConfirmModalProps {
  open: boolean;
  producer: ProducerProfile;
  oliveQuantityKg: number;
  paymentMethod: PaymentMethod;
  oilPercentage: number;
  result: CalculationResult;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  producer,
  oliveQuantityKg,
  paymentMethod,
  oilPercentage,
  result,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/60" onClick={onCancel} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirmer la demande</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vérifiez les détails avant de soumettre.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Producteur" value={producer.name} />
              <Row label="Quantité d'olives" value={`${oliveQuantityKg} kg`} />
              <Row
                label="Mode de paiement"
                value={
                  paymentMethod === "money" ? (
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5" /> Argent
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" /> {oilPercentage}% d'huile
                    </span>
                  )
                }
              />
              <div className="border-t border-border my-2" />
              <Row
                label="Huile estimée"
                value={`${result.expectedOilOutput.toFixed(1)} L`}
              />
              {paymentMethod === "oil_percentage" && (
                <Row
                  label="Part producteur"
                  value={`${result.producerShare.toFixed(1)} L`}
                />
              )}
              {paymentMethod === "money" && result.totalCost !== undefined && (
                <Row
                  label="Coût total"
                  value={`${result.totalCost.toLocaleString()} DA`}
                />
              )}
              <div className="border-t border-border my-2" />
              <div className="flex justify-between font-bold text-foreground">
                <span>Votre huile finale</span>
                <span className="text-primary">{result.clientFinalOil.toFixed(1)} L</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Annuler
              </Button>
              <Button className="flex-1" onClick={onConfirm}>
                Confirmer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
