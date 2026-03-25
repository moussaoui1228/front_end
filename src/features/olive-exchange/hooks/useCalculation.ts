import { useMemo } from "react";
import { PaymentMethod, CalculationResult, ProducerProfile } from "../types";

interface CalcInput {
  oliveQuantityKg: number;
  paymentMethod: PaymentMethod;
  oilPercentage: number;
  producer: ProducerProfile | null;
}

export function useCalculation({
  oliveQuantityKg,
  paymentMethod,
  oilPercentage,
  producer,
}: CalcInput): CalculationResult | null {
  return useMemo(() => {
    if (!producer || oliveQuantityKg <= 0) return null;

    const expectedOilOutput = oliveQuantityKg / producer.conversionRate;

    if (paymentMethod === "oil_percentage") {
      const producerShare = expectedOilOutput * (oilPercentage / 100);
      const clientFinalOil = expectedOilOutput - producerShare;
      return { expectedOilOutput, producerShare, clientFinalOil };
    }

    // money payment
    const totalCost = oliveQuantityKg * producer.processingPricePerKg;
    return {
      expectedOilOutput,
      producerShare: 0,
      clientFinalOil: expectedOilOutput,
      totalCost,
    };
  }, [oliveQuantityKg, paymentMethod, oilPercentage, producer]);
}
