"use client";

import { useActionState } from "react";

import { useActionToast } from "@/hooks/use-action-toast";
import { weekdayOptions } from "@/lib/schedules";
import { cn } from "@/lib/utils";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

type ActionState = {
  error?: string;
  success?: string;
};

type ScheduleRowData = {
  id?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakStart?: string | null;
  breakEnd?: string | null;
  isActive: boolean;
};

const initialState: ActionState = {};

function DoctorScheduleRow({
  doctorId,
  schedule,
  saveAction,
  disableAction,
  canEditDoctorId,
}: {
  doctorId?: string;
  schedule: ScheduleRowData;
  saveAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  disableAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  canEditDoctorId?: boolean;
}) {
  const [saveState, saveFormAction, isSaving] = useActionState(saveAction, initialState);
  const [disableState, disableFormAction, isDisabling] = useActionState(disableAction, initialState);

  useActionToast(saveState, {
    successTitle: "Графік збережено",
    errorTitle: "Не вдалося зберегти графік",
  });

  useActionToast(disableState, {
    successTitle: "День вимкнено",
    errorTitle: "Не вдалося вимкнути день",
  });

  const feedback = saveState.error || saveState.success ? saveState : disableState;

  return (
    <div
      className={cn(
        "rounded-[1.15rem] border p-3 shadow-[0_12px_28px_-30px_rgba(15,23,42,0.16)]",
        schedule.isActive
          ? "border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]"
          : "border-dashed border-slate-200 bg-slate-50/80",
      )}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[0.98rem] font-semibold tracking-[-0.02em] text-slate-950">
            {weekdayOptions.find((option) => option.value === schedule.weekday)?.label}
          </p>
          <p className="text-sm text-slate-500">
            {schedule.isActive
              ? `${schedule.startTime}–${schedule.endTime} · слот ${schedule.slotDurationMinutes} хв`
              : "День вимкнений, записи не відкриваються"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex h-7 items-center rounded-full px-3 text-[0.76rem] font-medium",
              schedule.isActive ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-700",
            )}
          >
            {schedule.isActive ? "Робочий день" : "Вихідний"}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 xl:grid-cols-[minmax(0,1fr)_auto]">
        <form action={saveFormAction} className="grid gap-2 xl:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.72fr))_auto]">
          {canEditDoctorId && doctorId ? <input type="hidden" name="doctorId" value={doctorId} /> : null}
          <input type="hidden" name="weekday" value={String(schedule.weekday)} />

          <label className="grid gap-1 xl:col-span-1">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">Статус дня</span>
            <span className="flex h-9 items-center gap-2 rounded-lg border border-input bg-white px-3 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={schedule.isActive} />
              День доступний для запису
            </span>
          </label>

          <label className="grid gap-1">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">Початок</span>
            <input
              name="startTime"
              type="time"
              required
              defaultValue={schedule.startTime}
              className="h-9 rounded-lg border border-input bg-white px-3"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">Кінець</span>
            <input
              name="endTime"
              type="time"
              required
              defaultValue={schedule.endTime}
              className="h-9 rounded-lg border border-input bg-white px-3"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">Слот, хв</span>
            <input
              name="slotDurationMinutes"
              type="number"
              min="5"
              step="5"
              required
              defaultValue={schedule.slotDurationMinutes}
              className="h-9 rounded-lg border border-input bg-white px-3"
            />
          </label>

          <div className="flex items-end">
            <Button type="submit" size="sm" disabled={isSaving} className="w-full rounded-full px-4">
              {isSaving ? "Зберігаю…" : "Зберегти день"}
            </Button>
          </div>

          <details className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 xl:col-span-5">
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-700">
              Перерва та додатково
            </summary>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">Початок перерви</span>
                <input
                  name="breakStart"
                  type="time"
                  defaultValue={schedule.breakStart ?? ""}
                  className="h-9 rounded-lg border border-input bg-white px-3"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">Кінець перерви</span>
                <input
                  name="breakEnd"
                  type="time"
                  defaultValue={schedule.breakEnd ?? ""}
                  className="h-9 rounded-lg border border-input bg-white px-3"
                />
              </label>
            </div>
            <div className="mt-3">
              <ActionFeedback
                error={feedback.error}
                success={feedback.success}
                errorTitle="Не вдалося зберегти графік"
                successTitle="Графік оновлено"
              />
            </div>
          </details>
        </form>

        <form action={disableFormAction} className="xl:flex xl:items-start">
          {canEditDoctorId && doctorId ? <input type="hidden" name="doctorId" value={doctorId} /> : null}
          <input type="hidden" name="weekday" value={String(schedule.weekday)} />
          <Button type="submit" variant="outline" size="sm" disabled={isDisabling} className="w-full rounded-full px-4 xl:min-w-44">
            {isDisabling ? "Вимикаю…" : "Зробити вихідним"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function DoctorScheduleManager({
  doctorId,
  schedules,
  saveAction,
  disableAction,
  title,
  description,
  canEditDoctorId,
}: {
  doctorId?: string;
  schedules: ScheduleRowData[];
  saveAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  disableAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  title?: string;
  description?: string;
  canEditDoctorId?: boolean;
}) {
  const scheduleMap = new Map(schedules.map((schedule) => [schedule.weekday, schedule]));

  return (
    <div className="grid gap-3">
      {title || description ? (
        <div>
          {title ? <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h3> : null}
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      ) : null}
      {weekdayOptions.map((weekday) => {
        const schedule = scheduleMap.get(weekday.value);

        return (
          <DoctorScheduleRow
            key={weekday.value}
            doctorId={doctorId}
            canEditDoctorId={canEditDoctorId}
            saveAction={saveAction}
            disableAction={disableAction}
            schedule={{
              weekday: weekday.value,
              startTime: schedule?.startTime ?? "09:00",
              endTime: schedule?.endTime ?? "18:00",
              slotDurationMinutes: schedule?.slotDurationMinutes ?? 30,
              breakStart: schedule?.breakStart ?? null,
              breakEnd: schedule?.breakEnd ?? null,
              isActive: schedule?.isActive ?? false,
            }}
          />
        );
      })}
    </div>
  );
}
