/**
 * LANDING PAGE (INDEX)
 * The main entry point of the website.
 * Features a video hero, storytelling sections, and a newsletter signup.
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionReveal from "@/components/SectionReveal";
import RotatingBadge from "@/components/RotatingBadge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import Testimonials from "@/components/Testimonials";
import backgroundVideo from "@/assets/backgroundVideo.mp4";

// Helper function to structure our "Values" data for the grid
const getValues = (t: any) => [
  { num: "01", title: t("home.values.item1.title"), desc: t("home.values.item1.desc") },
  { num: "02", title: t("home.values.item2.title"), desc: t("home.values.item2.desc") },
  { num: "03", title: t("home.values.item3.title"), desc: t("home.values.item3.desc") },
  { num: "04", title: t("home.values.item4.title"), desc: t("home.values.item4.desc") },
];

const Index = () => {
  const { t } = useTranslation();
  const values = getValues(t);

  // We use "returnObjects: true" to fetch arrays directly from our translation files
  const marqueeWords = t("home.region.marquee", { returnObjects: true }) as string[];
  const newsletterTags = t("home.newsletter.tags", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar with increased transparency and reduced height */}
      <Navbar
        className="!bg-background/100 backdrop-blur-sm h-[52px] lg:h-[60px]"
      />

      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <img
              src="https://i.pinimg.com/1200x/ab/0b/d2/ab0bd249514ef37d5ae4bca85d7129f2.jpg"
              alt="Oliveraie de Kabylie"
              className="w-full h-full object-cover"
            />
          </video>

          <div className="absolute inset-0 bg-foreground/30" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col justify-end pb-16 lg:pb-24 px-6 lg:px-10 max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-background/80 text-sm tracking-widest uppercase mb-4"
          >
            {t("home.hero.subtitle")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-background leading-[0.95] max-w-3xl"
          >
            {t("home.hero.title")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute right-6 lg:right-10 bottom-16 lg:bottom-24"
          >
            <RotatingBadge />
          </motion.div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionReveal>
          <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-10">
            {t("home.story.badge")}
          </span>
        </SectionReveal>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <SectionReveal>
            <p className="text-2xl md:text-3xl lg:text-4xl leading-snug">
              <span className="font-bold">{t("home.story.text1_bold")}</span>{" "}
              <span className="text-muted-foreground font-normal">
                {t("home.story.text1")}
              </span>
            </p>
            <p className="text-lg text-muted-foreground mt-8 leading-relaxed">
              {t("home.story.text2")}
            </p>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <div className="overflow-hidden rounded-2xl">
              <motion.img
                src="https://i.pinimg.com/1200x/ec/7c/b1/ec7cb1d813b6354554aaf43fed14cd19.jpg"
                alt="Récolte des olives"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Ce qui nous distingue */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-16">
          <SectionReveal>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-lg">{t("home.values.title")}</h2>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <span className="hidden md:inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground">
              {t("home.values.badge")}
            </span>
          </SectionReveal>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <SectionReveal>
            <div className="overflow-hidden rounded-2xl">
              <motion.img
                src="https://i.pinimg.com/1200x/1d/7b/29/1d7b29cf80b321cd321bf469376d3dca.jpg"
                alt="Olives fraîches"
                className="w-full h-[350px] lg:h-[450px] object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </SectionReveal>

          <div className="flex flex-col">
            {values.map((v, i) => (
              <SectionReveal key={v.num} delay={i * 0.1}>
                <div className="border-b border-foreground/10 py-5 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                      {v.num}
                    </span>
                    <h3 className="text-lg font-semibold flex-1">{v.title}</h3>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-45 duration-300" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 pl-14 max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500">
                    {v.desc}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Région — location section */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block border border-foreground/60 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-8">
            {t("home.region.badge")}
          </span>
          <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed">
            {t("home.region.desc_start")}<span className="font-bold">{t("home.region.desc_bold")}</span>{t("home.region.desc_end")}
          </p>
        </div>

        {/* Circular image overlapping marquee */}
        <div className="relative">
          {/* Scrolling marquee text - behind the image */}
          <div className="relative w-screen -ml-6 lg:-ml-10 flex items-center h-[280px] md:h-[340px] lg:h-[400px]">
            <motion.div
              className="flex gap-16 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-16 items-center">
                  {marqueeWords.map((word: string, i: number) => (
                    <span key={word + i} className="text-4xl md:text-7xl lg:text-8xl font-bold text-foreground/20 uppercase tracking-wider select-none">
                      {word}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Circular image - overlapping the marquee */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <Link to="/region" className="group relative pointer-events-auto ">
              <div className="w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border border-foreground/20 bg-background shadow-lg">
                <motion.img
                  src="https://i.pinimg.com/736x/7a/98/7b/7a987bf3933dd838604bff3d6b370cc4.jpg"
                  alt="Paysage de Kabylie"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              {/* Outer ring */}
              <div className="absolute -inset-3 rounded-full border border-foreground/20 pointer-events-none" />
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Newsletter CTA */}
      <section className="bg-accent py-20 lg:py-28 px-6 lg:px-10 rounded-3xl h-[370px] flex items-center mx-[20px] mb-20">
        <div className="max-w-3xl mx-auto text-center w-full">
          <SectionReveal>
            <div className="flex gap-3 justify-center mb-6">
              {newsletterTags.map((tag: string) => (
                <span key={tag} className="border border-accent-foreground/20 rounded-full px-3 py-1 text-xs text-accent-foreground/70">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
              {t("home.newsletter.title")}
            </h2>
            <div className="flex max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder={t("home.newsletter.placeholder")}
                className="flex-1 bg-background rounded-full px-6 py-3 text-sm outline-none border-0"
              />
              <MagneticButton className="bg-foreground text-background rounded-full px-8 py-3 text-sm font-semibold hover:bg-foreground/90 transition-colors">
                {t("home.newsletter.button")}
              </MagneticButton>
            </div>
          </SectionReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;