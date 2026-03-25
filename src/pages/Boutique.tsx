/**
 * BOUTIQUE PAGE
 * This is the main shop of the application. 
 * It has two modes:
 * 1. "Buy": Standard e-commerce for purchasing olive oil bottles.
 * 2. "Press": A service request form for customers bringing their own olives.
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SectionReveal from "@/components/SectionReveal";
import MagneticButton from "@/components/MagneticButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { wilayas, oilTypes, buyQuantities, OilType } from "@/data/wilayas";
import { ShippingMethod, PaymentMethod } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/Context/AuthContext";
import { ShoppingBag, Factory, Banknote, Droplets, Info, CheckCircle2, Plus, Trash2, ShoppingCart, Clock, AlertCircle } from "lucide-react";
import oliveImg5 from "@/assets/olive-img-5.jpg";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import API_URL from "@/config";
import { useTranslation } from "react-i18next";

type Mode = "buy" | "press";

// Interface for items added to the virtual basket
interface CartItem {
  id: string;
  product_id: string;
  model_type: 'OliveCategory' | 'Product';
  name: string;
  quantity: string;
  liters: number;
  pricePerLiter: number;
  subtotal: number;
}

// Interface for products fetched from the database
interface Product {
  _id: string;
  name: string;
  category: 'extra_virgin' | 'virgin' | 'third_quality';
  price_per_liter: number;
  stock_liters: number;
  is_available: boolean;
}

const Boutique = () => {
  const { toast } = useToast(); // For showing success/error popups
  const { user, token } = useAuth(); // Logged in user information
  const { t } = useTranslation(); // Translation function
  
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // "buy" for shopping, "press" for pressing service
  const [mode, setMode] = useState<Mode>("buy");

  // SHOPPING STATE
  const [buyQuantity, setBuyQuantity] = useState<string>("1L");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<ShippingMethod>("delivery");
  const [wilayaCode, setWilayaCode] = useState<number>(0);
  
  // Pre-fill the form with the user's account details if they share logged in
  const [form, setForm] = useState({
    nom: user?.last_name || "",
    prenom: user?.first_name || "",
    telephone: user?.phone || "",
  });
  
  const [submitting, setSubmitting] = useState(false); // Loading state for the submit buttons
  const [showSuccess, setShowSuccess] = useState(false); // Shows the confirmation message after order

  // DYNAMIC DATA FROM BACKEND
  const [dbWilayas, setDbWilayas] = useState<any[]>([]);
  const [oliveCategories, setOliveCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pressingServices, setPressingServices] = useState<any[]>([]);
  const [producerPercentage, setProducerPercentage] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * fetchBoutiqueData
   * Connects to our backend to get the latest prices, stock levels, 
   * and shipping rates for all regions.
   */
  const fetchBoutiqueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wilayasRes, oliveRes, pressingRes, settingsRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/shipping-rates`),
        fetch(`${API_URL}/prices/olives`),
        fetch(`${API_URL}/prices/pressing`),
        fetch(`${API_URL}/settings`),
        fetch(`${API_URL}/products`)
      ]);

      const checks = [
        { res: wilayasRes, name: "wilayas" },
        { res: oliveRes, name: "olives" },
        { res: pressingRes, name: "pressing" },
        { res: settingsRes, name: "settings" },
        { res: productsRes, name: "products" }
      ];

      // If one of the API calls fails, we stop and show an error
      const failed = checks.filter(c => !c.res.ok);
      if (failed.length > 0) {
        if (failed.some(f => f.res.status === 429)) {
          throw new Error("Trop de requêtes. Veuillez patienter un instant avant de réessayer.");
        }
        throw new Error("Erreur lors de la récupération des données.");
      }

      const [wilayasData, oliveData, pressingData, settingsData, productsData] = await Promise.all([
        wilayasRes.json(),
        oliveRes.json(),
        pressingRes.json(),
        settingsRes.json(),
        productsRes.json()
      ]);

      setDbWilayas(wilayasData.map((w: any) => ({
        code: w.wilaya_code,
        name: w.wilaya,
        shipping: w.price
      })));
      setOliveCategories(oliveData.map((c: any) => ({ ...c, model_type: 'OliveCategory' })));
      setProducts(productsData.map((p: any) => ({ ...p, model_type: 'Product', stock_liters: p.stock_liters || 0 })));
      setPressingServices(pressingData);
      setProducerPercentage(settingsData.pressing_percentage_taken || 30);
    } catch (err: any) {
      console.error("Failed to fetch boutique data:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiqueData();
  }, [t]);

  // Combine both "raw" oil and bottled products into a single list
  const allAvailableItems = useMemo(() => {
    return [...oliveCategories, ...products].filter(item => item.active !== false && item.is_available !== false);
  }, [oliveCategories, products]);

  const activeWilayas = dbWilayas.length > 0 ? dbWilayas : wilayas;

  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [pressOilType, setPressOilType] = useState<OilType>(oilTypes[0]);

  useEffect(() => {
    if (allAvailableItems.length > 0 && !selectedCategory) {
      setSelectedCategory(allAvailableItems[0]);
    }
  }, [allAvailableItems, selectedCategory]);

  useEffect(() => {
    if (pressingServices.length > 0 && (!pressOilType.id || pressOilType.id === '1' || pressOilType.id === '2' || pressOilType.id === '3')) {
      const svc = pressingServices[0];
      setPressOilType({
        id: svc._id,
        name: svc.name,
        quality_name: svc.category,
        yieldPerKg: svc.yield_per_kg || 0.2,
        processingPricePerKg: svc.fee
      } as any);
    }
  }, [pressingServices, pressOilType.id]);

  /**
   * addToCart
   * Checks if we have enough stock before adding the item to the order list.
   */
  const addToCart = () => {
    if (!selectedCategory) return;
    const liters = parseFloat(buyQuantity) || 0;

    // We can't sell more than we have in the mill
    if (liters > (selectedCategory.stock_liters || 0)) {
      toast({
        title: t("boutique.items.stock_insufficient"),
        description: t("boutique.items.only_available", { qty: selectedCategory.stock_liters }),
        variant: "destructive"
      });
      return;
    }

    const subtotal = (selectedCategory.price_per_liter || 0) * liters;

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      product_id: selectedCategory._id,
      model_type: selectedCategory.model_type,
      name: selectedCategory.name,
      quantity: buyQuantity,
      liters,
      pricePerLiter: selectedCategory.price_per_liter || 0,
      subtotal,
    };

    setCart([...cart, newItem]);
    toast({ title: t("boutique.items.added_to_cart"), description: t("boutique.items.added_desc", { qty: buyQuantity, name: selectedCategory.name }) });
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // PRESSING STATE
  const [oliveKg, setOliveKg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("money");
  const [pressError, setPressError] = useState("");

  const selectedWilaya = activeWilayas.find((w) => w.code === wilayaCode);

  // SHOPPING CALCULATIONS
  const buyPrice = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = deliveryMethod === "delivery" ? (selectedWilaya?.shipping || 0) : 0;
  const buyTotal = buyPrice + shipping;

  /**
   * pressCalc
   * Automatically calculates how much oil the customer can expect
   * and what the mill's share will be if paying by percentage.
   */
  const oliveKgNum = parseFloat(oliveKg) || 0;
  const pressCalc = useMemo(() => {
    if (oliveKgNum <= 0) return null;
    const expectedOil = oliveKgNum * (pressOilType.yieldPerKg || 0.2);
    if (paymentMethod === "olives") {
      const producerShare = expectedOil * (producerPercentage / 100);
      const clientOil = expectedOil - producerShare;
      return { expectedOil, producerShare, clientOil };
    }
    const totalCost = oliveKgNum * pressOilType.processingPricePerKg;
    return { expectedOil, producerShare: 0, clientOil: expectedOil, totalCost };
  }, [oliveKgNum, pressOilType, paymentMethod, producerPercentage]);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast({ title: t("boutique.form.cart_empty_title"), description: t("boutique.form.cart_empty_desc"), variant: "destructive" });
      return;
    }
    if (!form.nom || !form.prenom || !form.telephone) {
      toast({ title: t("auth.register.error_title"), description: t("auth.register.error_empty"), variant: "destructive" });
      return;
    }
    if (deliveryMethod === "delivery" && !wilayaCode) {
      toast({ title: t("boutique.form.wilaya_error_title"), description: t("boutique.form.wilaya_error_desc"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            olive_category_id: item.product_id,
            model_type: (item as any).model_type || 'OliveCategory',
            quantity: item.liters,
            olive_price_at_order: item.pricePerLiter,
            pressing_fee_at_order: 0, // No pressing fee in direct buy mode
            subtotal: item.subtotal
          })),
          shipping: {
            type: deliveryMethod,
            wilaya: deliveryMethod === "delivery" ? selectedWilaya?.name : undefined,
            cost: shipping,
          },
          total_price: buyTotal
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la commande");
      }
      setShowSuccess(true);
      toast({ title: t("boutique.success.buy_title"), description: t("boutique.success.buy_desc") });
      setCart([]);
      setWilayaCode(0);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (oliveKgNum < 50) {
      setPressError(t("boutique.press.min_error"));
      return;
    }
    if (!form.nom || !form.prenom || !form.telephone) {
      toast({ title: t("auth.register.error_title"), description: t("auth.register.error_empty"), variant: "destructive" });
      return;
    }
    setPressError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/pressing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          olive_quantity_kg: oliveKgNum,
          oil_quality: pressOilType.quality_name,
          yield: {
            liters_per_kg: pressOilType.conversionRate,
            produced_oil_liters: pressCalc?.expectedOil || 0,
          },
          payment: {
            type: paymentMethod,
            pressing_price_per_kg: paymentMethod === "money" ? pressOilType.processingPricePerKg : undefined,
            percentage_taken: paymentMethod === "olives" ? producerPercentage : undefined,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de l'envoi");
      }
      setShowSuccess(true);
      toast({ title: t("boutique.success.press_title"), description: t("boutique.success.press_desc") });
      setOliveKg("");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-6 text-center max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {mode === "buy" ? t("boutique.success.order_title") : t("boutique.success.press_title")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {mode === "buy"
                ? t("boutique.success.order_desc")
                : t("boutique.success.press_desc")}
            </p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                to="/suivi"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-all"
              >
                {t("nav.tracking")}
              </Link>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
              >
                {t("boutique.success.another")}
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 lg:pt-32 pb-10 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionReveal>
          <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
            {t("boutique.hero.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-[0.95] mb-4">
            {t("boutique.hero.title")}
          </h1>
          <p className="text-muted-foreground max-w-xl mb-8">
            {t("boutique.hero.desc")}
          </p>
        </SectionReveal>

        {/* Mode selector */}
        <SectionReveal delay={0.1}>
          <div className="grid grid-cols-2 gap-4 max-w-md mb-10">
            <button
              onClick={() => setMode("buy")}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 p-4 text-sm font-semibold transition-all duration-300 ${mode === "buy"
                ? "border-primary bg-primary/5 text-foreground shadow-sm"
                : "border-border text-muted-foreground hover:border-primary/40"
                }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {t("boutique.modes.buy")}
            </button>
            <button
              onClick={() => setMode("press")}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 p-4 text-sm font-semibold transition-all duration-300 ${mode === "press"
                ? "border-primary bg-primary/5 text-foreground shadow-sm"
                : "border-border text-muted-foreground hover:border-primary/40"
                }`}
            >
              <Factory className="w-5 h-5" />
              {t("boutique.modes.press")}
            </button>
          </div>
        </SectionReveal>
      </section>

      <section className="px-6 lg:px-10 max-w-7xl mx-auto pb-20 lg:pb-32">
        <AnimatePresence mode="wait">
          {mode === "buy" ? (
            <motion.div
              key="buy"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                <SectionReveal>
                  <div className="overflow-hidden rounded-2xl sticky top-24">
                    <img src={oliveImg5} alt="Huile d'olive TAZDAYTH" className="w-full h-[400px] lg:h-[550px] object-cover" />
                  </div>
                </SectionReveal>

                <div>
                  {/* Oil type selector */}
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-3">{t("boutique.buy.oil_type")}</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {loading ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="h-48 bg-secondary/20 animate-pulse rounded-3xl" />
                        ))
                      ) : error ? (
                        <div className="col-span-full text-center py-10 bg-red-500/5 rounded-3xl border border-red-500/10">
                          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                          <p className="text-sm font-bold text-red-600 mb-3">{error}</p>
                          <button 
                            onClick={fetchBoutiqueData}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Réessayer
                          </button>
                        </div>
                      ) : allAvailableItems.length > 0 ? (
                        allAvailableItems.map((category) => (
                          <button
                            key={category._id}
                            onClick={() => category.stock_liters > 0 && setSelectedCategory(category)}
                            className={`relative group p-6 rounded-3xl border-2 transition-all duration-500 text-left overflow-hidden ${selectedCategory?._id === category._id
                              ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                              : "border-secondary hover:border-primary/30 bg-secondary/30"
                              } ${category.stock_liters <= 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${selectedCategory?._id === category._id ? "bg-primary text-white" : "bg-background text-primary"}`}>
                                  <Droplets className="w-6 h-6" />
                                </div>
                                {category.stock_liters <= 0 ? (
                                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    {t("boutique.items.out_of_stock")}
                                  </span>
                                ) : category.stock_liters <= 20 ? (
                                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    {t("boutique.items.only_left", { qty: category.stock_liters })}
                                  </span>
                                ) : null}
                              </div>
                              <h4 className="font-bold text-lg mb-1">{category.name}</h4>
                              <p className="text-2xl font-black text-primary mb-3">
                                {category.price_per_liter}
                                <span className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-widest">DA/L</span>
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="col-span-full text-muted-foreground italic text-center py-10">
                          {t("boutique.no_products_available")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">{t("boutique.buy.quantity")} (L)</p>
                      <button
                        type="button"
                        onClick={addToCart}
                        className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-all border border-primary/20"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t("dashboard.common.add") || "Ajouter"}
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        {buyQuantities.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setBuyQuantity(q)}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${buyQuantity === q
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                              }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-[150px]">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            value={parseFloat(buyQuantity) || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                setBuyQuantity("0L");
                              } else {
                                setBuyQuantity(val + "L");
                              }
                            }}
                            className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow pr-10"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">L</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          {t("boutique.items.custom")} {t("boutique.items.per_05l")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price summary & Cart */}
                  <div className="bg-accent/50 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">{t("boutique.cart.title")}</h3>
                    </div>

                    <AnimatePresence>
                      {cart.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic mb-4">{t("boutique.cart.empty")}</p>
                      ) : (
                        <div className="space-y-3 mb-4">
                          {cart.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex justify-between items-center text-sm"
                            >
                              <div className="flex-1">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground ml-2">({item.quantity})</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-semibold text-primary">{item.subtotal.toLocaleString()} DA</span>
                                <button type="button" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>

                    <div className="border-t border-foreground/10 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("boutique.cart.subtotal")}</span>
                        <span className="font-semibold">{buyPrice.toLocaleString()} DA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("boutique.cart.delivery")}</span>
                        <span className="font-semibold">{shipping ? `${shipping.toLocaleString()} DA` : "—"}</span>
                      </div>
                      <div className="border-t border-foreground/10 mt-3 pt-3 flex justify-between">
                        <span className="font-bold">{t("boutique.cart.total")}</span>
                        <span className="font-bold text-primary text-xl">{buyTotal.toLocaleString()} DA</span>
                      </div>
                    </div>
                  </div>

                  {/* Order form */}
                  <form onSubmit={handleBuySubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t("boutique.form.nom")}</label>
                        <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder={t("boutique.form.nom_placeholder")} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t("boutique.form.prenom")}</label>
                        <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder={t("boutique.form.prenom_placeholder")} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t("boutique.form.telephone")}</label>
                      <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder={t("boutique.form.telephone_placeholder")} />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t("boutique.form.receiving_mode")}</label>
                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("delivery")}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${deliveryMethod === "delivery" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
                        >
                          {t("boutique.form.home_delivery")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("pickup")}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${deliveryMethod === "pickup" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
                        >
                          {t("boutique.form.local_pickup")}
                        </button>
                      </div>
                    </div>

                    {deliveryMethod === "delivery" ? (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t("boutique.form.wilaya")}</label>
                        <select
                          value={wilayaCode}
                          onChange={(e) => setWilayaCode(Number(e.target.value))}
                          className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
                        >
                          <option value={0}>{t("boutique.form.wilaya_placeholder")}</option>
                          {activeWilayas.map((w) => (
                            <option key={w.code} value={w.code}>
                              {w.code} - {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
                        <Clock className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-foreground mb-1">{t("boutique.pickup_notice.title")}</p>
                          <p className="text-xs text-muted-foreground">{t("boutique.pickup_notice.desc")}</p>
                        </div>
                      </div>
                    )}

                    <MagneticButton className={`w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-medium transition-all duration-300 ${submitting ? "opacity-60 pointer-events-none" : "hover:bg-primary/90"}`}>
                      {submitting ? "Envoi en cours..." : "Confirmer la commande"}
                    </MagneticButton>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="press"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                <SectionReveal>
                  <div className="overflow-hidden rounded-2xl sticky top-24">
                    <img src={oliveImg5} alt="Service de trituration" className="w-full h-[400px] lg:h-[550px] object-cover" />
                    <div className="absolute inset-0 bg-foreground/20 flex items-end p-6">
                      <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 w-full">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Comment ça marche ?</p>
                        <p className="text-sm text-foreground">
                          Apportez vos olives, nous les pressons pour vous. Payez en argent ou laissez un pourcentage de l'huile produite.
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionReveal>

                <div>
                  <h2 className="text-2xl font-bold mb-2">{t("boutique.press.service_title")}</h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    {t("boutique.press.service_desc")}
                  </p>

                  <form onSubmit={handlePressSubmit} className="space-y-6">
                    {/* Pressing method (Fixed to Semi-Automatique) */}
                    <div>
                      <label className="text-sm font-medium mb-3 flex items-center gap-1.5">
                        Méthode de trituration
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>Nous utilisons exclusivement la méthode semi-automatique avec un tarif unique.</TooltipContent>
                        </Tooltip>
                      </label>
                      <div className="flex flex-col gap-2 mt-2">
                          <button
                            type="button"
                            className="flex items-center justify-between rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-left transition-all duration-300 cursor-default"
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">Méthode Semi-Automatique</p>
                              <p className="text-xs text-primary font-medium">{pressingServices[0]?.fee || 35} DA/kg (Tarif unique)</p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </button>
                      </div>
                    </div>

                    {/* Olive quantity */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                        Quantité d'olives (kg)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>Minimum 50 kg.</TooltipContent>
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        min={50}
                        placeholder="Ex : 500"
                        value={oliveKg}
                        onChange={(e) => { setOliveKg(e.target.value); setPressError(""); }}
                        className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow mt-1"
                      />
                      {pressError && <p className="text-sm text-destructive mt-1">{pressError}</p>}
                    </div>

                    {/* Payment method */}
                    <div>
                      <label className="text-sm font-medium mb-3 flex items-center gap-1.5">
                        Mode de paiement
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Argent : prix fixe par kg.<br />
                            Pourcentage : vous cédez une part de l'huile produite.
                          </TooltipContent>
                        </Tooltip>
                      </label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("money")}
                          className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all duration-300 ${paymentMethod === "money"
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                        >
                          <Banknote className="w-4 h-4" /> {t("boutique.press.money")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("olives")}
                          className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all duration-300 ${paymentMethod === "olives"
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                        >
                          <Droplets className="w-4 h-4" /> {t("boutique.press.percentage")}
                        </button>
                      </div>
                    </div>

                    {/* Fixed percentage info */}
                    {paymentMethod === "olives" && (
                      <div className="bg-accent/50 rounded-xl px-4 py-3 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{producerPercentage}%</span> de l'huile produite sera retenue par le producteur comme paiement du service.
                      </div>
                    )}

                    {/* Live calculation */}
                    {pressCalc && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-accent/50 rounded-2xl p-6"
                      >
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Estimation</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Production estimée</span>
                            <span className="font-semibold">{pressCalc.expectedOil.toFixed(1)} L</span>
                          </div>
                          {paymentMethod === "olives" && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Part producteur ({producerPercentage}%)</span>
                              <span className="font-semibold">{pressCalc.producerShare.toFixed(1)} L</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-foreground/10 pt-2 mt-2">
                            <span className="font-bold">
                              {paymentMethod === "money" ? "Coût du service" : "Votre huile"}
                            </span>
                            <span className="font-bold text-primary text-lg">
                              {paymentMethod === "money"
                                ? `${pressCalc.totalCost?.toLocaleString()} DZD`
                                : `${pressCalc.clientOil.toFixed(1)} L`}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nom</label>
                        <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder="Votre nom" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Prénom</label>
                        <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder="Votre prénom" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Téléphone</label>
                      <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder="0555 123 456" />
                    </div>

                    <MagneticButton className={`w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-medium transition-all duration-300 ${submitting ? "opacity-60 pointer-events-none" : "hover:bg-primary/90"}`}>
                      {submitting ? t("boutique.form.submitting") : t("boutique.form.submit_press")}
                    </MagneticButton>
                    <p className="text-[10px] text-center text-muted-foreground italic mt-3 px-4">
                      {t("boutique.press.notice")}
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </div>
  );
};

export default Boutique;
