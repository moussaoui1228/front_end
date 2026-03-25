/**
 * REGISTRATION PAGE (INSCRIPTION)
 * Allows new customers to create an account.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import BackButton from "@/components/BackButton";
import heroImg from "@/assets/olive-img-2.jpg";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/Context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

import { useTranslation } from "react-i18next";

const Inscription = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  
  // The local form data
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * handleSubmit
   * Creates a new user account on the server.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION: Ensure all fields are filled
    if (!form.nom || !form.prenom || !form.email || !form.telephone || !form.password) {
      toast({ title: t("auth.register.error_title"), description: t("auth.register.error_empty"), variant: "destructive" });
      return;
    }
    
    // Check password length
    if (form.password.length < 6) {
      toast({ title: t("auth.register.error_title"), description: t("auth.register.error_password"), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: form.prenom,
        last_name: form.nom,
        email: form.email,
        phone: form.telephone,
        password: form.password,
      });
      toast({ title: t("auth.register.success_title"), description: t("auth.register.success_desc") });
      navigate("/boutique", { replace: true });
    } catch (err: any) {
      toast({ title: t("auth.register.error_title"), description: err.message || t("auth.register.error_general"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleGoogleSuccess
   * Simple registration via Google account.
   */
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      toast({ title: t("auth.register.success_title"), description: t("auth.register.google_success") });
      navigate("/boutique", { replace: true });
    } catch (err: any) {
      toast({ title: t("auth.register.error_title"), description: err.message || t("auth.register.google_error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, val: string) => setForm({ ...form, [key]: val });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Olives"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
      </div>

      <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <BackButton variant="auth" />
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground mb-2 block">TAZDAYTH</Link>
          <h1 className="text-3xl font-bold mb-2">{t("auth.register.title")}</h1>
          <p className="text-muted-foreground text-sm mb-8">{t("auth.register.subtitle")}</p>

          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast({ title: t("auth.register.error_title"), description: t("auth.register.google_error"), variant: "destructive" });
              }}
              text="signup_with"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t("auth.register.or_email")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "nom", label: t("auth.register.nom") },
                { key: "prenom", label: t("auth.register.prenom") },
              ].map((f) => (
                <div key={f.key} className="relative">
                  <input
                    value={(form as any)[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="peer w-full bg-secondary rounded-xl px-4 pt-6 pb-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-2 text-[10px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px]">
                    {f.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="relative">
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => update("telephone", e.target.value)}
                className="peer w-full bg-secondary rounded-xl px-4 pt-6 pb-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                placeholder=" "
                  />
                  <label className="absolute left-4 top-2 text-[10px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px]">
                    {t("auth.register.telephone")}
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="peer w-full bg-secondary rounded-xl px-4 pt-6 pb-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-2 text-[10px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px]">
                    {t("auth.register.email")}
                  </label>
                </div>

                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="peer w-full bg-secondary rounded-xl px-4 pt-6 pb-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-2 text-[10px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px]">
                    {t("auth.register.password")}
                  </label>
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {loading ? t("auth.register.loading") : t("auth.register.submit")}
                </button>
              </form>

              <p className="text-sm text-muted-foreground mt-6 text-center">
                {t("auth.register.has_account")}{" "}
                <Link to="/connexion" className="text-primary font-medium hover:underline">
                  {t("auth.register.login_link")}
                </Link>
              </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Inscription;
