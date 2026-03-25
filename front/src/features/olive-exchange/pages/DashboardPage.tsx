import { motion } from "framer-motion";
import { Factory, Settings } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoleSelector from "../components/RoleSelector";
import ProducerDashboard from "../components/ProducerDashboard";
import { useExchange } from "../context/ExchangeContext";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { role } = useExchange();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Tableau de bord
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gérez votre rôle et vos demandes de trituration.
          </p>
        </motion.div>

        {/* Role selector */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-primary" />
            Rôle du compte
          </h2>
          <RoleSelector />
        </section>

        {/* Content based on role */}
        {role === "producer" && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Demandes de trituration
            </h2>
            <ProducerDashboard />
          </motion.section>
        )}

        {role === "buyer" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-8 text-center"
          >
            <h3 className="font-semibold text-foreground mb-2">Mode Client actif</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Soumettez vos olives pour trituration auprès de nos producteurs partenaires.
            </p>
            <Link
              to="/olive-exchange"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Accéder à l'échange
            </Link>
          </motion.div>
        )}

        {role === "none" && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">
              Sélectionnez un rôle ci-dessus pour commencer.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
