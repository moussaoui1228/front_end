import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info, Droplets, Banknote } from "lucide-react";
import { ProducerProfile, PaymentMethod } from "../types";
import { useCalculation } from "../hooks/useCalculation";
import CalculationPanel from "./CalculationPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OliveRequestFormProps {
  producer: ProducerProfile;
  onSubmit: (data: {
    oliveQuantityKg: number;
    paymentMethod: PaymentMethod;
    oilPercentage: number;
  }) => void;
  onCancel: () => void;
}

export default function OliveRequestForm({
  producer,
  onSubmit,
  onCancel,
}: OliveRequestFormProps) {
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("money");
  const [oilPercentage, setOilPercentage] = useState(
    producer.oilPercentageOptions[0] ?? 25
  );
  const [error, setError] = useState("");

  const qtyNum = parseFloat(quantity) || 0;

  const result = useCalculation({
    oliveQuantityKg: qtyNum,
    paymentMethod,
    oilPercentage,
    producer,
  });

  const handleSubmit = () => {
    if (qtyNum < 50) {
      setError("La quantité minimale est de 50 kg.");
      return;
    }
    setError("");
    onSubmit({
      oliveQuantityKg: qtyNum,
      paymentMethod,
      oilPercentage,
    });
  };

  return (
    <div className="space-y-6">
      {/* Producer header */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          {producer.avatar}
        </div>
        <div>
          <p className="font-semibold text-foreground">{producer.name}</p>
          <p className="text-xs text-muted-foreground">
            Taux : {producer.conversionRate} kg → 1L · Prix : {producer.processingPricePerKg} DA/kg
          </p>
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          Quantité d'olives (kg)
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>Minimum 50 kg. La quantité détermine la production d'huile.</TooltipContent>
          </Tooltip>
        </Label>
        <Input
          type="number"
          min={50}
          placeholder="Ex : 500"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setError("");
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Payment method */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          Mode de paiement
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              Argent : vous payez un prix fixe par kg.
              <br />
              Pourcentage : le producteur garde une part de l'huile.
            </TooltipContent>
          </Tooltip>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod("money")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
              paymentMethod === "money"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Banknote className="w-4 h-4" /> Argent (DA)
          </button>
          <button
            onClick={() => setPaymentMethod("oil_percentage")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
              paymentMethod === "oil_percentage"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Droplets className="w-4 h-4" /> % d'huile
          </button>
        </div>
      </div>

      {/* Oil percentage selector */}
      {paymentMethod === "oil_percentage" && (
        <div className="space-y-2">
          <Label>Pourcentage pour le producteur</Label>
          <div className="flex gap-2">
            {producer.oilPercentageOptions.map((pct) => (
              <button
                key={pct}
                onClick={() => setOilPercentage(pct)}
                className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition-colors ${
                  oilPercentage === pct
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live calculation */}
      <CalculationPanel result={result} paymentMethod={paymentMethod} />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={qtyNum <= 0}>
          Soumettre la demande
        </Button>
      </div>
    </div>
  );
}
