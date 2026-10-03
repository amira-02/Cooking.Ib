import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  occasion: string;
  rating: number;
  text: string;
}

function TestimonialCard({ name, occasion, rating, text }: TestimonialCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <figure className="flex h-full flex-col rounded-2xl bg-cream p-8 transition-transform duration-500 ease-soft hover:-translate-y-1">
      <div className="flex gap-1 text-gold" aria-label={`${rating} étoiles sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            strokeWidth={0}
            fill="currentColor"
            className={i < rating ? "" : "opacity-25"}
          />
        ))}
      </div>

      <blockquote className="mt-6 flex-1 font-serif text-lg font-light leading-relaxed text-ink">
        « {text} »
      </blockquote>

      <figcaption className="mt-8 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-beige font-serif text-sm text-ink-light"
        >
          {initials}
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-medium text-ink">{name}</span>
          <span className="block text-xs text-ink-light">{occasion}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default TestimonialCard;
