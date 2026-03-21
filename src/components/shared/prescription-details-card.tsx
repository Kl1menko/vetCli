import { cn } from "@/lib/utils";

type PrescriptionDetails = {
  medicationName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

function formatDate(value: Date | null | undefined) {
  return value ? value.toLocaleDateString("uk-UA") : null;
}

function getPeriodLabel(startDate?: Date | null, endDate?: Date | null) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    return `${start} — ${end}`;
  }

  if (start) {
    return `Почати з ${start}`;
  }

  if (end) {
    return `До ${end}`;
  }

  return "Дати не вказані";
}

export function PrescriptionDetailsCard({
  prescription,
  className,
  headerSuffix,
}: {
  prescription: PrescriptionDetails;
  className?: string;
  headerSuffix?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[1.35rem] border border-slate-200 bg-white p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">{prescription.medicationName}</p>
          <p className="mt-1 text-sm text-slate-500">Схема прийому для клієнта</p>
        </div>
        {headerSuffix}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Дозування</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{prescription.dosage || "Лікар не вказав"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Частота</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{prescription.frequency || "Лікар не вказав"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Тривалість</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{prescription.duration || "Не вказано"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Період</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{getPeriodLabel(prescription.startDate, prescription.endDate)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Спосіб прийому та коментар лікаря</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {prescription.instructions || "Окремих інструкцій лікар не додав. Якщо схема виглядає неповною, зверніться до клініки для уточнення."}
        </p>
      </div>
    </div>
  );
}
