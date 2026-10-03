import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  panelClassName?: string;
}

// Menu déroulant générique : se ferme au clic extérieur et avec Échap
export function Dropdown({ trigger, children, align = "right", panelClassName = "w-56" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full z-40 mt-2 max-w-[calc(100vw-2rem)] rounded-xl border border-[#F1E6DA] bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(74,48,40,0.25)] ${
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            } ${panelClassName}`}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SelectMenuProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  icon?: ReactNode;
  label: string;
  align?: "left" | "right";
}

// Sélecteur stylé (période, statut…)
export function SelectMenu<T extends string>({ value, options, onChange, icon, label, align = "right" }: SelectMenuProps<T>) {
  const current = options.find((o) => o.value === value);
  return (
    <Dropdown
      align={align}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#EADBCB] bg-white px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30"
        >
          {icon}
          <span className="truncate">{current?.label}</span>
          <ChevronDown size={14} className={`text-ink-light transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    >
      {(close) => (
        <ul role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-cream"
              >
                {option.label}
                {option.value === value && <Check size={14} className="text-rose-dark" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  );
}
