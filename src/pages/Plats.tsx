/**
 * RECIPES PAGE (PLATS)
 * Showcases traditional Kabyle dishes that highlight our olive oil.
 * Users can click on a dish to see its history, ingredients, and steps.
 * Features an interactive ingredient checklist.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionReveal from "@/components/SectionReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import foodImg1 from "@/assets/food-img-1.jpg";
import foodImg3 from "@/assets/food-img-3.jpg";
import oliveImg2 from "@/assets/olive-img-2.jpg";
import oliveImg5 from "@/assets/olive-img-5.jpg";

interface Dish {
  name: string;
  desc: string;
  image: string;
  history: string;
  recipe: {
    ingredients: string[];
    steps: string[];
  };
  chef_tip?: string;
}

const getDishes = (t: any) => {
  const list = t("plats.list", { returnObjects: true }) as any[];
  return [
    { ...list[0], image: "https://i.pinimg.com/736x/13/03/3c/13033c416722c85ff6e9bc1b8916ee2f.jpg" },
    { ...list[1], image: foodImg3 },
    { ...list[2], image: oliveImg2 },
    { ...list[3], image: oliveImg5 },
  ];
};

const Plats = () => {
  const { t } = useTranslation();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const dishes = getDishes(t);

  // Reset checked ingredients when dish changes
  useEffect(() => {
    setCheckedIngredients({});
  }, [selectedDish]);

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ing]: !prev[ing]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 lg:pt-32 pb-16 px-6 lg:px-10 max-w-7xl mx-auto">
        <BackButton />
        <SectionReveal>
          <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
            {t("plats.hero.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] max-w-4xl mb-6">
            {t("plats.hero.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("plats.hero.desc")}
          </p>
        </SectionReveal>
      </section>

      <section className="px-6 lg:px-10 max-w-7xl mx-auto pb-20 lg:pb-32">
        <div className="grid md:grid-cols-2 gap-8">
          {dishes.map((dish: Dish, i: number) => (
            <SectionReveal key={dish.name} delay={i * 0.1}>
              <div
                className="group cursor-pointer"
                onClick={() => setSelectedDish(dish)}
              >
                <div className="overflow-hidden rounded-2xl mb-5">
                  <motion.img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-[300px] lg:h-[400px] object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {dish.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {dish.desc}
                </p>
                <span className="text-xs font-medium text-primary underline underline-offset-4">
                  {t("plats.modal.link")}
                </span>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* Dish Detail Modal */}
      <AnimatePresence>
        {selectedDish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-foreground/80 backdrop-blur-sm flex items-start justify-center p-4 lg:p-8 overflow-y-auto"
            onClick={() => setSelectedDish(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="bg-background rounded-3xl w-full max-w-3xl my-8 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header image */}
              <div className="relative h-[250px] lg:h-[350px] overflow-hidden">
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedDish(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <div className="p-8 lg:p-12">
                <h2 className="text-3xl font-bold mb-3">{selectedDish.name}</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {selectedDish.desc}
                </p>

                {/* History */}
                <div className="mb-10">
                  <span className="inline-block border border-foreground/20 rounded-full px-3 py-1 text-xs tracking-widest uppercase text-muted-foreground mb-4">
                    {t("plats.modal.history")}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedDish.history}
                  </p>
                </div>

                {/* Recipe */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-block border border-foreground/20 rounded-full px-3 py-1 text-xs tracking-widest uppercase text-muted-foreground">
                      {t("plats.modal.recipe")}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium animate-pulse">
                      {t("plats.modal.interactive_hint")}
                    </span>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {t("plats.modal.ingredients")}
                      </h4>
                      <ul className="space-y-2">
                        {selectedDish.recipe.ingredients.map((ing, i) => (
                          <li 
                            key={i} 
                            onClick={() => toggleIngredient(ing)}
                            className={`flex items-start gap-3 text-sm cursor-pointer group transition-all duration-300 ${
                              checkedIngredients[ing] 
                                ? "text-muted-foreground/40 line-through scale-[0.98]" 
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                              checkedIngredients[ing] ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
                            }`}>
                              {checkedIngredients[ing] && <X className="w-3 h-3 text-white" />}
                            </span>
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-primary" />
                        {t("plats.modal.prep")}
                      </h4>
                      <ol className="space-y-3">
                        {selectedDish.recipe.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground shrink-0">
                              {(i + 1).toString().padStart(2, "0")}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Chef's Tip */}
                {selectedDish.chef_tip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <UtensilsCrossed className="w-12 h-12 text-primary" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      {t("plats.modal.chef_tip")}
                    </h4>
                    <p className="text-sm italic leading-relaxed text-foreground/80">
                      "{selectedDish.chef_tip}"
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Plats;
