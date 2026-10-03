import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import TestimonialCard from "./TestimonialCard";
import { TESTIMONIALS } from "../../data/homeContent";

function TestimonialsSection() {
  return (
    <section className="mt-20 bg-beige/60 lg:mt-28">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Avis clients"
          title={
            <>
              Ils ont goûté, <em className="font-normal text-rose-dark">ils ont adoré.</em>
            </>
          }
          align="center"
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <Reveal key={testimonial.name} delay={i * 0.1} className="h-full">
              <TestimonialCard {...testimonial} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
