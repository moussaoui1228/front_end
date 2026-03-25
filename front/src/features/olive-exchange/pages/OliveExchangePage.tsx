import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Leaf, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProducers } from "../data/mock-producers";
import { ProducerProfile, PaymentMethod } from "../types";
import { useExchange } from "../context/ExchangeContext";
import { useCalculation } from "../hooks/useCalculation";
import ProducerList from "../components/ProducerList";
import OliveRequestForm from "../components/OliveRequestForm";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "@/hooks/use-toast";

type Step = "browse" | "form" | "success";

export default function OliveExchangePage() {
  const { addRequest } = useExchange();
  const [step, setStep] = useState<Step>("browse");
  const [selectedProducer, setSelectedProducer] = useState<ProducerProfile | null>(null);

  // For confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<{
    oliveQuantityKg: number;
    paymentMethod: PaymentMethod;
    oilPercentage: number;
  } | null>(null);

  const calcResult = useCalculation({
    oliveQuantityKg: formData?.oliveQuantityKg ?? 0,
    paymentMethod: formData?.paymentMethod ?? "money",
    oilPercentage: formData?.oilPercentage ?? 25,
    producer: selectedProducer,
  });

  const handleSelectProducer = (p: ProducerProfile) => {
    setSelectedProducer(p);
    setStep("form");
  };

  const handleFormSubmit = (data: typeof formData) => {
    setFormData(data);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedProducer || !formData || !calcResult) return;

    addRequest({
      id: `r${Date.now()}`,
      clientName: "Vous",
      clientAvatar: "VS",
      producerId: selectedProducer.id,
      producerName: selectedProducer.name,
      oliveQuantityKg: formData.oliveQuantityKg,
      paymentMethod: formData.paymentMethod,
      oilPercentage: formData.oilPercentage,
      expectedOilOutput: calcResult.expectedOilOutput,
      producerShare: calcResult.producerShare,
      clientFinalOil: calcResult.clientFinalOil,
      totalCost: calcResult.totalCost,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    setShowConfirm(false);
    setStep("success");
    toast({ title: "Demande envoyée avec succès !" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-6 h-6 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Échange & Trituration
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Confiez vos olives à un producteur de confiance et recevez votre huile d'olive.
            Choisissez de payer en argent ou en pourcentage d'huile.
          </p>
        </motion.div>

        {/* Back button */}
        {step !== "browse" && step !== "success" && (
          <button
            onClick={() => {
              setStep("browse");
              setSelectedProducer(null);
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux producteurs
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === "browse" && (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProducerList
                producers={mockProducers}
                onSelectProducer={handleSelectProducer}
              />
            </motion.div>
          )}

          {step === "form" && selectedProducer && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-lg mx-auto"
            >
              <OliveRequestForm
                producer={selectedProducer}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setStep("browse");
                  setSelectedProducer(null);
                }}
              />
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Demande envoyée !
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Votre demande de trituration a été envoyée au producteur.
                Vous serez notifié dès qu'elle sera traitée.
              </p>
              <button
                onClick={() => {
                  setStep("browse");
                  setSelectedProducer(null);
                  setFormData(null);
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Soumettre une autre demande
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirm modal */}
      {selectedProducer && formData && calcResult && (
        <ConfirmModal
          open={showConfirm}
          producer={selectedProducer}
          oliveQuantityKg={formData.oliveQuantityKg}
          paymentMethod={formData.paymentMethod}
          oilPercentage={formData.oilPercentage}
          result={calcResult}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <Footer />
    </div>
  );
}
