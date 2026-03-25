/**
 * MAIN APPLICATION COMPONENT
 * This file defines all the routes (URLs) of the website.
 * It uses React Router to show different pages depending on the URL.
 */

import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./pages/Index";
import Processus from "./pages/Processus";
import Plats from "./pages/Plats";
import Boutique from "./pages/Boutique";

import Region from "./pages/Region";
import APropos from "./pages/APropos";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import Suivi from "./pages/Suivi";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute"; // For pages that need a login
import AdminRoute from "./components/AdminRoute"; // For the owner dashboard
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const handleComplete = useCallback(() => setLoading(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          {loading && <LoadingScreen onComplete={handleComplete} />}
        </AnimatePresence>
        {!loading && (
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/processus" element={<Processus />} />
                <Route path="/plats" element={<Plats />} />
                <Route
                  path="/boutique"
                  element={
                    <ProtectedRoute>
                      <Boutique />
                    </ProtectedRoute>
                  }
                />

                <Route path="/region" element={<Region />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/connexion" element={<Connexion />} />
                <Route path="/inscription" element={<Inscription />} />
                <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
                <Route
                  path="/suivi"
                  element={
                    <ProtectedRoute>
                      <Suivi />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <AdminRoute>
                      <Dashboard />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
