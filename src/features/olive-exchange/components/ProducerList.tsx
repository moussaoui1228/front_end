import { ProducerProfile } from "../types";
import ProducerCard from "./ProducerCard";

interface ProducerListProps {
  producers: ProducerProfile[];
  onSelectProducer: (p: ProducerProfile) => void;
}

export default function ProducerList({ producers, onSelectProducer }: ProducerListProps) {
  if (producers.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Aucun producteur disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {producers.map((p) => (
        <ProducerCard key={p.id} producer={p} onSelect={onSelectProducer} />
      ))}
    </div>
  );
}
