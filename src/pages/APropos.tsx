/**
 * ABOUT US PAGE (A PROPOS)
 * Tells the story of the huilerie, founded in 2001.
 * Highlights the mission, values, and the founders' story.
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SectionReveal from "@/components/SectionReveal";
import { Leaf, Award, ShieldCheck, HeartHandshake } from "lucide-react";
import heroImg from "@/assets/background-main-image.jpg"; 
import brothersImg from "@/assets/brothers.jpg";

const APropos = () => {
  const { t } = useTranslation();

  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Leaf className="w-8 h-8 text-primary" />;
      case 1: return <Award className="w-8 h-8 text-primary" />;
      case 2: return <ShieldCheck className="w-8 h-8 text-primary" />;
      case 3: return <HeartHandshake className="w-8 h-8 text-primary" />;
      default: return <Leaf className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] lg:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImg} 
            alt="Paysage Kabylie" 
            className="w-full h-full object-cover grayscale-[40%]"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block border border-primary/30 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-primary mb-6"
          >
            {t("about.hero.badge")}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]"
          >
            {t("about.hero.title")}
          </motion.h1>
        </div>
      </section>

      {/* The Brothers' Story Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto -mt-20 relative z-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <SectionReveal>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-[3/4] border border-border/50">
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
              <img 
                src={brothersImg} 
                alt="Les deux frères fondateurs" 
                className="w-full h-full object-cover"
              />
            </div>
          </SectionReveal>
          
          <SectionReveal delay={0.2}>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">
              {t("about.story.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8">
              {t("about.story.title")}
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">
                {t("about.story.desc1")}
              </p>
              <p>
                {t("about.story.desc2")}
              </p>
              <p className="border-l-4 border-primary/30 pl-6 italic">
                {t("about.story.desc3")}
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 lg:py-32 bg-secondary/20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">
                {t("about.mission.title")}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t("about.mission.desc")}
              </p>
            </div>
          </SectionReveal>

          <div className="mt-20">
            <SectionReveal>
              <h3 className="text-3xl font-bold text-center mb-16">{t("about.values.title")}</h3>
            </SectionReveal>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(t("about.values.items", { returnObjects: true }) as string[]).map((item, i) => {
                const [title, desc] = item.split(" — ");
                return (
                  <SectionReveal key={i} delay={i * 0.1}>
                    <div className="bg-background border border-border/50 rounded-3xl p-8 hover:border-primary/50 transition-colors group h-full flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        {getIcon(i)}
                      </div>
                      <h4 className="text-xl font-bold mb-3">{title}</h4>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default APropos;
