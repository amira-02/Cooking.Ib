import { useState } from "react";
import { CalendarDays, Mail, Phone, User } from "lucide-react";
import AuthInput from "../auth/AuthInput";
import PrimaryButton from "../auth/PrimaryButton";
import { isValidPhone } from "../../utils/validation";
import { formatLongDate } from "../../utils/orderStatus";

export interface PreOrderValues {
  firstName: string;
  lastName: string;
  phone: string;
  requestedPickupDate: string;
  customerNote: string;
}

interface PreOrderFormProps {
  initial: Omit<PreOrderValues, "requestedPickupDate" | "customerNote">;
  email: string;
  earliestDate: string;
  latestDate: string;
  minLeadDays: number;
  submitting: boolean;
  onSubmit: (values: PreOrderValues) => void;
}

const NOTE_MAX = 1000;
type Field = keyof PreOrderValues;

function PreOrderForm({ initial, email, earliestDate, latestDate, minLeadDays, submitting, onSubmit }: PreOrderFormProps) {
  const [values, setValues] = useState<PreOrderValues>({ ...initial, requestedPickupDate: "", customerNote: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const rules: Record<Field, string | null> = {
    firstName: values.firstName.trim() ? null : "Veuillez saisir votre prénom.",
    lastName: values.lastName.trim() ? null : "Veuillez saisir votre nom.",
    phone: isValidPhone(values.phone) ? null : "Veuillez saisir un numéro valide (ex : 06 12 34 56 78).",
    requestedPickupDate: !values.requestedPickupDate
      ? "Choisissez la date à laquelle vous souhaitez retirer votre commande."
      : values.requestedPickupDate < earliestDate || values.requestedPickupDate > latestDate
        ? `Choisissez une date entre le ${formatLongDate(earliestDate)} et le ${formatLongDate(latestDate)}.`
        : null,
    customerNote: values.customerNote.length > NOTE_MAX ? `${NOTE_MAX} caractères maximum.` : null,
  };
  const errorOf = (f: Field) => (touched[f] ? rules[f] : null);

  function bind(name: Exclude<Field, "customerNote">) {
    return {
      name,
      value: values[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [name]: e.target.value })),
      onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
      error: errorOf(name),
      valid: Boolean(touched[name]) && !rules[name],
      disabled: submitting,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fields = Object.keys(rules) as Field[];
    setTouched(Object.fromEntries(fields.map((f) => [f, true])));
    if (fields.some((f) => rules[f])) return;
    onSubmit({ ...values, firstName: values.firstName.trim(), lastName: values.lastName.trim(), phone: values.phone.trim(), customerNote: values.customerNote.trim() });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="mb-1 font-sans text-[15px] font-semibold text-ink">Vos informations</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthInput label="Prénom" icon={User} autoComplete="given-name" placeholder="Votre prénom" {...bind("firstName")} />
          <AuthInput label="Nom" autoComplete="family-name" placeholder="Votre nom" {...bind("lastName")} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthInput label="Email" icon={Mail} type="email" value={email} readOnly disabled title="Adresse de votre compte : les confirmations y seront envoyées" />
          <AuthInput label="Téléphone" icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="Votre numéro de téléphone" {...bind("phone")} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-1 font-sans text-[15px] font-semibold text-ink">Retrait souhaité</legend>
        <div>
          <AuthInput
            label="Date souhaitée"
            icon={CalendarDays}
            type="date"
            min={earliestDate}
            max={latestDate}
            {...bind("requestedPickupDate")}
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-light">
            C'est une <strong className="font-medium text-ink">demande</strong> : nous confirmerons cette date ou vous proposerons d'autres disponibilités.
            Prévoyez au moins {minLeadDays} jour{minLeadDays > 1 ? "s" : ""} de délai pour la préparation.
          </p>
        </div>

        <div>
          <label htmlFor="customerNote" className="mb-1.5 block text-[13px] font-medium text-ink">
            Informations complémentaires <span className="font-normal text-ink-light">(facultatif)</span>
          </label>
          <textarea
            id="customerNote"
            rows={4}
            maxLength={NOTE_MAX}
            value={values.customerNote}
            onChange={(e) => setValues((v) => ({ ...v, customerNote: e.target.value }))}
            disabled={submitting}
            placeholder="Une précision concernant votre commande ? (ex : inscription « Joyeux anniversaire Léa » sur le gâteau)"
            className="w-full resize-y rounded-xl border border-[#EADBCB] bg-white px-4 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-light/55 focus:border-ink focus:ring-4 focus:ring-rose/25 disabled:bg-cream/70 sm:text-[15px]"
          />
          <p className="mt-1 text-right text-xs text-ink-light">
            {values.customerNote.length}/{NOTE_MAX}
          </p>
        </div>
      </fieldset>

      <PrimaryButton type="submit" loading={submitting} loadingText="Envoi…">
        Envoyer ma précommande
      </PrimaryButton>
    </form>
  );
}

export default PreOrderForm;
