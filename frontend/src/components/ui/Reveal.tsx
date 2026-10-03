import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_SOFT } from "./motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

// Apparition douce (fondu + léger glissement) quand l'élément entre dans l'écran
function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE_SOFT, delay }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
