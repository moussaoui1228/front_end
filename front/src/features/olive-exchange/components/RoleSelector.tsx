import { motion } from "framer-motion";
import { User, Factory, ChevronRight } from "lucide-react";
import { UserRole } from "../types";
import { useExchange } from "../context/ExchangeContext";

const roles: { key: UserRole; label: string; desc: string; icon: typeof User }[] = [
  {
    key: "buyer",
    label: "Client",
    desc: "Soumettez vos olives pour trituration et recevez votre huile.",
    icon: User,
  },
  {
    key: "producer",
    label: "Producteur",
    desc: "Gérez les demandes de trituration et fixez vos tarifs.",
    icon: Factory,
  },
];

export default function RoleSelector() {
  const { role, setRole } = useExchange();

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {roles.map((r) => {
        const active = role === r.key;
        return (
          <motion.button
            key={r.key}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole(r.key)}
            className={`relative text-left rounded-lg border-2 p-6 transition-colors ${
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <r.icon className="w-5 h-5" />
              </div>
              {active && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  Actif
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{r.label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
            <ChevronRight
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-opacity ${
                active ? "opacity-100 text-primary" : "opacity-0"
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
