/**
 * PASSWORD RECOVERY PAGE (MOT DE PASSE OUBLIÉ)
 * Allows users to reset their password using a 6-digit code sent via email.
 * This is a 2-step process:
 * 1. Request a code by entering the email.
 * 2. Enter the code and a new password.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import API_URL from "@/config";

const MotDePasseOublie = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [step, setStep] = useState<"email" | "reset">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({ title: "Erreur", description: "Veuillez entrer votre email.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Erreur lors de l'envoi du code.");
            }

            toast({ title: "Code envoyé", description: "Un code de vérification a été envoyé à votre email." });
            setStep("reset");
        } catch (err: any) {
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !newPassword) {
            toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Code invalide ou expiré.");
            }

            toast({ title: "Succès", description: "Votre mot de passe a été mis à jour." });
            navigate("/connexion");
        } catch (err: any) {
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Link to="/connexion" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                </Link>

                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {step === "email" ? "1" : "2"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Étape {step === "email" ? "1 sur 2" : "2 sur 2"}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        {step === "email" ? "Mot de passe oublié" : "Réinitialisation"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {step === "email"
                            ? "Entrez votre email pour recevoir un code de vérification."
                            : "Entrez le code reçu par email et choisissez votre nouveau mot de passe."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "email" ? (
                        <motion.form
                            key="email-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendCode}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Adresse Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-secondary rounded-2xl pl-11 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                            >
                                {loading ? "Envoi du code..." : "Recevoir le code de vérification"}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="reset-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleResetPassword}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Code de vérification (6 chiffres)</label>
                                    <div className="relative">
                                        <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full bg-secondary rounded-2xl pl-11 pr-4 py-4 text-center text-lg font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground ml-1 italic">Vérifiez vos emails (ou le terminal si vous testez en local)</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type={showPass ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-secondary rounded-2xl pl-11 pr-12 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                                >
                                    {loading ? "Mise à jour..." : "Réinitialiser mon mot de passe"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
                                    className="w-full text-xs font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                                >
                                    Utiliser une autre adresse email
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default MotDePasseOublie;
