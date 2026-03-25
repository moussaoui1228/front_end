import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Check, X, Play, CheckCircle2, Droplets, Banknote } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useExchange } from "../context/ExchangeContext";
import { ProcessingRequest } from "../types";
import { toast } from "@/hooks/use-toast";

export default function ProducerDashboard() {
  const { requests, updateRequestStatus } = useExchange();
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const action = (id: string, status: ProcessingRequest["status"], msg: string) => {
    updateRequestStatus(id, status);
    toast({ title: msg });
  };

  const filters = [
    { key: "all", label: "Toutes" },
    { key: "pending", label: "En attente" },
    { key: "accepted", label: "Acceptées" },
    { key: "processing", label: "En cours" },
    { key: "completed", label: "Terminées" },
    { key: "rejected", label: "Refusées" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Droplets className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune demande dans cette catégorie.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Client</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Huile estimée</TableHead>
                <TableHead>Votre part</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {req.clientAvatar}
                      </div>
                      <span className="font-medium text-foreground">{req.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{req.oliveQuantityKg} kg</TableCell>
                  <TableCell>
                    {req.paymentMethod === "money" ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Banknote className="w-3.5 h-3.5" /> {req.totalCost?.toLocaleString()} DA
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm">
                        <Droplets className="w-3.5 h-3.5" /> {req.oilPercentage}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{req.expectedOilOutput.toFixed(1)} L</TableCell>
                  <TableCell>
                    {req.paymentMethod === "oil_percentage"
                      ? `${req.producerShare.toFixed(1)} L`
                      : `${req.totalCost?.toLocaleString()} DA`}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {req.status === "pending" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:text-primary"
                            onClick={() => action(req.id, "accepted", "Demande acceptée")}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => action(req.id, "rejected", "Demande refusée")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {req.status === "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => action(req.id, "processing", "Trituration en cours")}
                        >
                          <Play className="w-3 h-3 mr-1" /> Triturer
                        </Button>
                      )}
                      {req.status === "processing" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => action(req.id, "completed", "Trituration terminée !")}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Terminer
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
