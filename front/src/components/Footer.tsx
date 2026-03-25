import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

const getMenuLinks = (t: any) => [
  { to: "/", label: t("nav.home") },
  { to: "/processus", label: t("nav.process") },
  { to: "/boutique", label: t("nav.shop") },
  { to: "/plats", label: t("nav.dishes") },
  { to: "/region", label: t("nav.region") },
];

const Footer = () => {
  const { t } = useTranslation();
  const menuLinks = getMenuLinks(t);
  const legalLinks = t("footer.legal_links", { returnObjects: true }) as string[];

  return (
    <footer className="bg-foreground text-background rounded-3xl h-[380px] mx-[20px] my-[10px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand + Contact */}
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">TAZDAYTH</h3>
            <p className="text-background/50 text-xs tracking-widest uppercase mb-6">
              {t("footer.subtitle")}
            </p>
            <p className="text-background/60 text-xs font-semibold uppercase tracking-wider mb-2">
              {t("footer.contact")}
            </p>
            <a href="mailto:info@tazdayth.dz" className="text-accent text-sm underline underline-offset-2 block mb-1">
              info@tazdayth.dz
            </a>
            <a href="tel:+213555123456" className="text-accent text-sm underline underline-offset-2 block mb-3">
              +213 555 123 456
            </a>
            <p className="text-sm text-background/80 leading-relaxed max-w-[240px]">
              {t("footer.address")}
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-background/80">{t("footer.menu")}</h4>
            <div className="flex flex-col gap-2.5">
              {menuLinks.map((l) => (
                <Link key={l.to} to={l.to} className="text-sm text-background/60 hover:text-background transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-background/80">{t("footer.legal")}</h4>
            <div className="flex flex-col gap-2.5">
              {legalLinks && Array.isArray(legalLinks) && legalLinks.map((linkTitle: string, index: number) => (
                <span key={index} className="text-sm text-background/60">{linkTitle}</span>
              ))}
            </div>
          </div>

          {/* Réseaux */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-background/80">{t("footer.social")}</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors text-foreground">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors text-foreground">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors text-foreground">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-6 text-center">
          <p className="text-xs text-background/40">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
