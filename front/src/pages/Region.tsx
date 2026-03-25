/**
 * REGION PAGE (REGION)
 * Highlights the landscape, people, and history of Kabylie.
 * Features a landscape gallery with zoom functionality.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionReveal from "@/components/SectionReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import heroImg from "@/assets/background-main-image.jpg";
import oliveImg2 from "@/assets/olive-img-2.jpg";
import oliveImg5 from "@/assets/olive-img-5.jpg";

const Region = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [heroImg, oliveImg5, oliveImg2];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Paysage de Kabylie"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-12 left-6 lg:left-10 z-10 max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-background leading-[0.95]"
          >
            {t("region.hero.title")}
          </motion.h1>
        </div>
      </section>

      {/* La Terre */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <BackButton className="mb-2" />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <SectionReveal>
            <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
              {t("region.earth.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("region.earth.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("region.earth.desc1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("region.earth.desc2")}
            </p>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <div className="overflow-hidden rounded-2xl">
              <motion.img
                src={oliveImg2}
                alt="Oliveraie de Kabylie"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Les Hommes */}
      <section className="bg-primary py-20 lg:py-32 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-8 max-w-xl">
              {t("region.people.title")}
            </h2>
            <p className="text-primary-foreground/70 max-w-2xl leading-relaxed mb-4">
              {t("region.people.desc1")}
            </p>
            <p className="text-primary-foreground/70 max-w-2xl leading-relaxed">
              {t("region.people.desc2")}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <SectionReveal delay={0.2}>
            <div className="overflow-hidden rounded-2xl">
              <motion.img
                src="https://i.pinimg.com/1200x/bc/3f/82/bc3f82cb30f0f51d3b0e1e69b5e5264b.jpg"
                alt="Histoire de Kabylie"
                className="w-full h-[350px] lg:h-[450px] object-cover grayscale-[30%]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </SectionReveal>
          <SectionReveal>
            <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
              {t("region.history.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("region.history.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("region.history.desc1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("region.history.desc2")}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Galerie */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">{t("region.gallery.title")}</h2>
        </SectionReveal>
        <div className="grid md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <SectionReveal key={i} delay={i * 0.1}>
              <div 
                className="overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => setSelectedImage(img)}
              >
                <motion.img
                  layoutId={`gallery-image-${img}`}
                  src={img}
                  alt="Kabylie"
                  className="w-full h-[300px] object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* Zoom Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 lg:top-10 lg:right-10 w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-foreground hover:bg-foreground/20 hover:rotate-90 transition-all z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              layoutId={`gallery-image-${selectedImage}`}
              src={selectedImage}
              alt="Zoomed Kabylie"
              className="w-full max-w-6xl max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Region;
