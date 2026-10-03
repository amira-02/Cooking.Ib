import { CalendarDays } from "lucide-react";
import { SelectMenu } from "./Dropdown";
import { PERIOD_OPTIONS } from "../../constants";
import type { Period } from "../../types";

function PeriodSelect({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return (
    <SelectMenu
      label="Période"
      value={value}
      onChange={onChange}
      icon={<CalendarDays size={15} className="text-ink-light" />}
      options={PERIOD_OPTIONS}
    />
  );
}

export default PeriodSelect;
