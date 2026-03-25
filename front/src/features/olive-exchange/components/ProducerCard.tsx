import { motion } from "framer-motion";
import { Star, MapPin, Droplets } from "lucide-react";
import { ProducerProfile } from "../types";

interface ProducerCardProps {
  producer: ProducerProfile;
  onSelect: (producer: ProducerProfile) => void;
}

export default function ProducerCard({ producer, onSelect }: ProducerCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group rounded-lg border border-border bg-card p-5 cursor-pointer transition-shadow hover:shadow-lg"
      onClick={() => onSelect(producer)}
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          {producer.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{producer.name}</h3>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" /> {producer.location}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {producer.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-secondary p-2">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
            <Star className="w-3 h-3 text-accent" /> Note
          </div>
          <span className="text-sm font-semibold text-foreground">{producer.rating}</span>
        </div>
        <div className="rounded-md bg-secondary p-2">
          <div className="text-xs text-muted-foreground mb-0.5">Taux</div>
          <span className="text-sm font-semibold text-foreground">{producer.conversionRate}:1</span>
        </div>
        <div className="rounded-md bg-secondary p-2">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
            <Droplets className="w-3 h-3" /> Prix
          </div>
          <span className="text-sm font-semibold text-foreground">{producer.processingPricePerKg} DA</span>
        </div>
      </div>
    </motion.div>
  );
}
