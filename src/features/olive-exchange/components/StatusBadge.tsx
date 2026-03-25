import { RequestStatus } from "../types";

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "En attente",
    className: "bg-accent/20 text-accent-foreground border-accent/40",
  },
  accepted: {
    label: "Acceptée",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  processing: {
    label: "En cours",
    className: "bg-blue-500/15 text-blue-700 border-blue-300",
  },
  completed: {
    label: "Terminée",
    className: "bg-emerald-500/15 text-emerald-700 border-emerald-300",
  },
  rejected: {
    label: "Refusée",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

interface StatusBadgeProps {
  status: RequestStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
