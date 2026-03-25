import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface RotatingBadgeProps {
  text?: string;
  to?: string;
}

const RotatingBadge = ({ text, to = "/boutique" }: RotatingBadgeProps) => {
  const { t } = useTranslation();
  const displayText = text || t("rotating_badge.text");

  return (
    <Link to={to} className="relative inline-flex items-center justify-center w-28 h-28 group">
      <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 120 120">
        <defs>
          <path id="circlePath" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
        </defs>
        <text className="fill-foreground text-[10px] uppercase tracking-[0.3em] font-medium">
          <textPath href="#circlePath">{displayText}</textPath>
        </text>
      </svg>
      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <ArrowUpRight className="w-5 h-5 text-accent-foreground" />
      </div>
    </Link>
  );
};

export default RotatingBadge;
