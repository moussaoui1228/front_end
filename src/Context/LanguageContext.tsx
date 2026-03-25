import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "fr" | "en" | "kab";

const translations = {
  fr: {
    nav: { home: "Accueil", story: "Notre Histoire", values: "Nos Valeurs", terroir: "Terroir", contact: "Contact" },
    hero: {
      title: "every drop tells the story of the land",
      subtitle: "Huile d'olive premium : élaborée avec soin dans les oliveraies de Kabylie",
      cta: "Découvrir",
    },
    story: {
      title: "Notre Histoire",
      p1: "Nichée dans les paysages majestueux de Kabylie, notre aventure a commencé avec une passion pour la qualité et un profond respect pour la nature. Inspirés par des générations d'oléiculteurs, nous avons entrepris de produire une huile d'olive biologique premium qui reflète le riche patrimoine de cette belle région.",
      p2: "Chaque bouteille de notre huile d'olive porte l'essence de notre engagement envers des pratiques agricoles durables et le savoir-faire minutieux qui définit notre approche.",
    },
    valuesSection: {
      title: "Ce qui nous distingue",
      subtitle: "Nos Valeurs",
    },
    values: [
      { num: "01", title: "Authenticité", desc: "Un savoir-faire ancestral transmis de génération en génération dans les montagnes de Kabylie." },
      { num: "02", title: "Qualité", desc: "Des olives cueillies à la main, pressées à froid pour préserver tous les arômes." },
      { num: "03", title: "Tradition", desc: "Le pressage traditionnel à la meule de pierre, respectant les méthodes séculaires." },
      { num: "04", title: "Terroir", desc: "Les oliveraies kabyles bénéficient d'un microclimat unique, entre mer et montagne." },
    ],
    terroir: {
      title: "Notre Terroir",
      desc: "Découvrez le charme unique de la Kabylie, où son altitude, son climat idéal et la beauté époustouflante de ses montagnes se rejoignent pour créer une huile d'olive exceptionnelle.",
      marquee: ["CHARME", "IDÉAL", "EXCEPTIONNEL", "TRADITION", "TERROIR", "AUTHENTICITÉ"],
    },
    newsletter: {
      tags: ["#nouveautés", "#recettes", "#offres exclusives"],
      title: "Rejoignez notre aventure — Abonnez-vous pour des nouvelles exclusives.",
      cta: "S'abonner",
      placeholder: "votre@email.com",
    },
    footer: {
      rights: "Tous droits réservés.",
    },
  },
  en: {
    nav: { home: "Home", story: "Our Story", values: "Our Values", terroir: "Terroir", contact: "Contact" },
    hero: {
      title: "every drop tells the story of the land",
      subtitle: "Premium olive oil: crafted with care in the olive groves of Kabylie",
      cta: "Discover",
    },
    story: {
      title: "Our Story",
      p1: "Nestled in the majestic landscapes of Kabylie, our journey began with a passion for quality and a deep respect for nature. Inspired by generations of olive growers, we set out to produce a premium organic olive oil that reflects the rich heritage of this beautiful region.",
      p2: "Every bottle of our olive oil carries the essence of our commitment to sustainable farming practices and the meticulous craftsmanship that defines our approach.",
    },
    valuesSection: {
      title: "What sets us apart",
      subtitle: "Our Values",
    },
    values: [
      { num: "01", title: "Authenticity", desc: "Ancestral know-how passed down from generation to generation in the mountains of Kabylie." },
      { num: "02", title: "Quality", desc: "Hand-picked olives, cold-pressed to preserve all the aromas." },
      { num: "03", title: "Tradition", desc: "Traditional stone mill pressing, respecting centuries-old methods." },
      { num: "04", title: "Terroir", desc: "Kabyle olive groves benefit from a unique microclimate, between sea and mountain." },
    ],
    terroir: {
      title: "Our Terroir",
      desc: "Discover the unique charm of Kabylie, where its altitude, ideal climate and breathtaking mountain beauty come together to create an exceptional olive oil.",
      marquee: ["CHARM", "IDEAL", "EXCEPTIONAL", "TRADITION", "TERROIR", "AUTHENTICITY"],
    },
    newsletter: {
      tags: ["#news", "#recipes", "#exclusive offers"],
      title: "Join our journey — Subscribe for exclusive news.",
      cta: "Subscribe",
      placeholder: "your@email.com",
    },
    footer: {
      rights: "All rights reserved.",
    },
  },
  kab: {
    nav: { home: "Asebter", story: "Tamacahut-nneɣ", values: "Azalen-nneɣ", terroir: "Akal", contact: "Anermis" },
    hero: {
      title: "every drop tells the story of the land",
      subtitle: "Zzit n uzemmur premium : yettwaxdem s lɛinaya deg yizurar n Leqbayel",
      cta: "Wali",
    },
    story: {
      title: "Tamacahut-nneɣ",
      p1: "Deg yidurar imeqqranen n Leqbayel, tabɣest-nneɣ tebda s tayri n lǧuhed d usirem i tbiɛa. S wayen i d-ǧǧan lejdud-nneɣ, nesbedd-d zzit n uzemmur bio premium i d-yessemlen ayen yelhan n tmurt-agi tamecṭuḥt.",
      p2: "Yal taqerɛet n zzit-nneɣ tesɛa lɛibad n tegnit-nneɣ deg ufellaḥ aɣelsan d tmusni i d-yettilin deg umahil-nneɣ.",
    },
    valuesSection: {
      title: "Ayen i ɣ-d-yemmyazen",
      subtitle: "Azalen-nneɣ",
    },
    values: [
      { num: "01", title: "Tidett", desc: "Tussna n lejdud i d-yettilin seg tasuta ar tayeḍ deg yidurar n Leqbayel." },
      { num: "02", title: "Taɣara", desc: "Azemmur yettwajmeɛ s ufus, yettwaɛṣer s usemmiḍ i wakken ad yeḥrez ṭṭɛam." },
      { num: "03", title: "Lamɛada", desc: "Aɛṣar amensay s uẓru n tmɣart, s ubrid n lejdud." },
      { num: "04", title: "Akal", desc: "Izurar n Leqbayel sɛan anezwi i yiman-nsen, gar yilel d udrar." },
    ],
    terroir: {
      title: "Akal-nneɣ",
      desc: "Ẓer tafawt n Leqbayel, anda tallelt-is, anezwi yelhan d uẓṣṣa n yidurar-is ttmyagaren i wakken ad d-xelqen zzit n uzemmur ur nesɛi amḍiq.",
      marquee: ["TAFAWT", "ANEZWI", "AMEQQRAN", "LAMƐADA", "AKAL", "TIDETT"],
    },
    newsletter: {
      tags: ["#isallen", "#tireccatin", "#asarag uslig"],
      title: "Ddu yid-neɣ — Jerred i yisallen usligen.",
      cta: "Jerred",
      placeholder: "imayl-ik@email.com",
    },
    footer: {
      rights: "Akk izerfan ttwaḥerzen.",
    },
  },
};

type Translations = typeof translations.fr;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
