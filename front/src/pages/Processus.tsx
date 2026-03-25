/**
 * PROCESS PAGE (PROCESSUS)
 * Explains how our olive oil is made using a 8-step sticky scroll animation.
 * Includes a quality guide for different types of olive oil.
 */

import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { X, Play, ChevronDown, Award, Zap, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionReveal from "@/components/SectionReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

// Data for the 8-step production process
const getSteps = (t: any) => [
    {
        num: "01",
        title: t("process.step1.title"),
        desc: t("process.step1.desc"),
        video: "/VID-20260306-WA0332 (1).mp4",
    },
    {
        num: "02",
        title: t("process.step2.title"),
        desc: t("process.step2.desc"),
        video: "/VID-20260306-WA0601.mp4",
    },
    {
        num: "03",
        title: t("process.step3.title"),
        desc: t("process.step3.desc"),
        video: "/VID-20260306-WA0604.mp4",
    },
    {
        num: "04",
        title: t("process.step4.title"),
        desc: t("process.step4.desc"),
        video: "/VID-20260306-WA0607.mp4",
    },
    {
        num: "05",
        title: t("process.step5.title"),
        desc: t("process.step5.desc"),
        video: "/VID-20260307-WA0000.mp4",
    },
    {
        num: "06",
        title: t("process.step6.title"),
        desc: t("process.step6.desc"),
        video: "/VID-20260306-WA0332 (1).mp4",
    },
    {
        num: "07",
        title: t("process.step7.title"),
        desc: t("process.step7.desc"),
        video: "/VID-20260306-WA0601.mp4",
    },
    {
        num: "08",
        title: t("process.step8.title"),
        desc: t("process.step8.desc"),
        video: "/VID-20260306-WA0604.mp4",
    },
];

const Processus = () => {
    const { t } = useTranslation();
    const [videoOpen, setVideoOpen] = useState(false);
    const steps = getSteps(t);

    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Use spring for smoother value changes
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [selectedVideo, setSelectedVideo] = useState<{ src: string; title: string, desc: string } | null>(null);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const unsubscribe = smoothProgress.on("change", (v) => {
            const index = Math.min(
                Math.floor(v * steps.length),
                steps.length - 1
            );
            setActiveStep(index);
        });
        return () => unsubscribe();
    }, [smoothProgress, steps.length]);

    const openVideo = (src: string, titleKey: string, descKey: string) => {
        setSelectedVideo({
            src,
            title: t(titleKey),
            desc: t(descKey)
        });
        setVideoOpen(true);
    };

    return (
        <div className="min-h-screen bg-background selection:bg-primary/30">
            <Navbar />

            {/* Content-Focused Hero */}
            <section className="pt-32 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
                <BackButton />
                <SectionReveal>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        {t("process.hero.badge")}
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 text-balance uppercase">
                        {t("process.hero.title")}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
                        {t("process.hero.desc")}
                    </p>
                    
                    <button
                        onClick={() => openVideo("/VID-20260306-WA0332 (1).mp4", "process.video.title", "process.video.desc")}
                        className="group flex items-center gap-6"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/20">
                            <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                            {t("process.hero.button")}
                        </span>
                    </button>
                </SectionReveal>
            </section>



            {/* 8-Step Sticky Scroll Section */}
            <section ref={containerRef} className="relative h-[800vh]">
                <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                    <div className="container px-6 mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            {/* Text Panel */}
                            <div className="relative h-[400px] flex flex-col justify-center order-2 lg:order-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-6xl md:text-9xl font-black text-primary/10 tabular-nums">
                                                {steps[activeStep].num}
                                            </span>
                                            <div className="h-px flex-1 bg-primary/20" />
                                        </div>
                                        <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.8]">
                                            {steps[activeStep].title}
                                        </h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                            {steps[activeStep].desc}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Progress Indicator */}
                                <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
                                    {steps.map((_, i) => (
                                        <div 
                                            key={i}
                                            className={`w-1 transition-all duration-700 rounded-full ${
                                                i === activeStep ? "h-10 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "h-3 bg-primary/10"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Video Panel with Seamless Cross-fade */}
                            <div className="relative aspect-[4/5] lg:aspect-square group flex items-center justify-center order-1 lg:order-2">
                                <div className="absolute inset-0 bg-primary/5 rounded-[3rem] rotate-2 scale-105" />
                                <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl border border-border/50 bg-black">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStep}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, ease: "easeInOut" }}
                                            className="w-full h-full"
                                        >
                                            <video
                                                src={steps[activeStep].video}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Standards Section */}
            <section className="py-32 bg-secondary/10 relative">
                <div className="container px-6 mx-auto">
                    <SectionReveal>
                        <div className="text-center max-w-3xl mx-auto mb-20 uppercase">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">
                                {t("process.quality_guide.badge")}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                                {t("process.quality_guide.title")}
                            </h2>
                            <p className="text-muted-foreground text-lg normal-case">
                                {t("process.quality_guide.desc")}
                            </p>
                        </div>
                    </SectionReveal>

                    <div className="grid md:grid-cols-3 gap-8">
                        {["extra_virgin", "virgin", "lampante"].map((key, i) => (
                            <SectionReveal key={key} delay={i * 0.1}>
                                <div className="bg-background border border-border/50 p-10 rounded-[2.5rem] h-full flex flex-col hover:border-primary/30 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors">
                                        <Award className="w-20 h-20" />
                                    </div>
                                    <h4 className="text-2xl font-black mb-2 uppercase tracking-tighter">
                                        {t(`process.quality_guide.${key}.name`)}
                                    </h4>
                                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
                                        <Zap className="w-3 h-3" />
                                        {t(`process.quality_guide.${key}.stats`)}
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t(`process.quality_guide.${key}.desc`)}
                                    </p>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>
                </div>
            </section>


            {/* Video Modal */}
            <AnimatePresence>
                {videoOpen && selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setVideoOpen(false)}
                    >
                        <button className="absolute top-6 right-6 text-foreground hover:rotate-90 transition-transform">
                            <X className="w-10 h-10" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-black/40 backdrop-blur-md rounded-[3rem] w-full max-w-6xl aspect-video relative overflow-hidden border border-white/5 shadow-2xl shadow-black/80"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <video
                                src={selectedVideo.src}
                                autoPlay
                                controls
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{selectedVideo.title}</h3>
                                <p className="text-white/60 text-sm max-w-xl italic">{selectedVideo.desc}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default Processus;

