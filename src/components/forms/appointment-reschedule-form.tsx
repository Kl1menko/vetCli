"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import type { Appointment } from "@prisma/client";

import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import type { AppointmentActionState } from "@/server/actions/appointments";

type SlotOption = {
  time: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
};

type AppointmentRescheduleFormProps = {
  appointment: Pick<Appointment, "id" | "petId" | "serviceId" | "comment" | "doctorId" | "date">;
  doctors: Array<{ id: string; fullName: string; specialization: string }>;
  action: (
    state: AppointmentActionState,
    formData: FormData,
  ) => Promise<AppointmentActionState>;
};

const initialState: AppointmentActionState = {};

export function AppointmentRescheduleForm({
  appointment,
  doctors,
  action,
}: AppointmentRescheduleFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: "Запис перенесено",
    errorTitle: "Не вдалося перенести запис",
  });
  const [doctorPreferenceId, setDoctorPreferenceId] = useState(appointment.doctorId);
  const [selectedDate, setSelectedDate] = useState(appointment.date.toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  useEffect(() => {
    setSelectedSlot(null);
  }, [doctorPreferenceId, selectedDate]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSlots() {
      setIsLoadingSlots(true);
      setSlotsError("");

      try {
        const query = new URLSearchParams({
          doctorId: doctorPreferenceId,
          serviceId: appointment.serviceId,
          date: selectedDate,
          weekStart: selectedDate,
          days: "1",
        });
        const response = await fetch(`/api/booking/slots?${query.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити вільний час.");
        }

        const data = (await response.json()) as { slots?: SlotOption[] };
        setSlots(data.slots ?? []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSlots([]);
        setSlotsError(error instanceof Error ? error.message : "Не вдалося завантажити вільний час.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadSlots();

    return () => controller.abort();
  }, [appointment.serviceId, doctorPreferenceId, selectedDate]);

  return (
    <details className="rounded-[1.2rem] border border-[#d8e5ef] bg-[#f8fbfe] md:rounded-[1.4rem]">
      <summary className="flex cursor-pointer list-none items-center px-3 py-3 md:px-4">
        <div className="flex w-full items-center justify-center gap-2 rounded-full border border-[#cfe0eb] bg-white px-4 py-2.5 text-slate-800 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.3)] transition-colors hover:bg-[#f8fbfe]">
          <CalendarDays className="size-4 text-[#0f9db1]" />
          <span className="text-sm font-medium md:text-base">Перенести запис</span>
        </div>
      </summary>

      <form action={formAction} className="grid gap-4 border-t border-[#d8e5ef] px-3 pt-3 pb-4 md:gap-5 md:px-4 md:pt-4 md:pb-5">
        <input type="hidden" name="appointmentId" value={appointment.id} />
        <input type="hidden" name="petId" value={appointment.petId} />
        <input type="hidden" name="serviceId" value={appointment.serviceId} />
        <input type="hidden" name="doctorId" value={selectedSlot?.doctorId ?? doctorPreferenceId} />
        <input type="hidden" name="date" value={selectedDate} />
        <input type="hidden" name="time" value={selectedSlot?.time ?? ""} />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`reschedule-doctor-${appointment.id}`}>Лікар</Label>
            <select
              id={`reschedule-doctor-${appointment.id}`}
              value={doctorPreferenceId}
              onChange={(event) => setDoctorPreferenceId(event.target.value)}
              className="h-11 w-full rounded-[1rem] border border-[#cfe0eb] bg-white px-4 text-[0.96rem] md:h-12 md:rounded-[1.1rem]"
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName} · {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`reschedule-date-${appointment.id}`}>Дата</Label>
            <input
              id={`reschedule-date-${appointment.id}`}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-11 w-full rounded-[1rem] border border-[#cfe0eb] bg-white px-4 text-[0.96rem] md:h-12 md:rounded-[1.1rem]"
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.2rem] border border-dashed border-[#cfe0eb] bg-white/80 p-3.5 md:rounded-[1.4rem] md:p-4">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-[#0f9db1]" />
            <p className="font-medium">Вільний час</p>
          </div>
          {isLoadingSlots ? <p className="text-sm text-muted-foreground">Шукаю доступний час…</p> : null}
          {slotsError ? <p className="text-sm text-destructive">{slotsError}</p> : null}
          {!isLoadingSlots && !slotsError && !slots.length ? (
            <p className="text-sm text-muted-foreground">На цей день вільного часу немає.</p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={`${slot.time}-${slot.doctorId}`}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  "rounded-[0.95rem] border px-3 py-2.5 text-left text-sm transition-all md:rounded-[1rem]",
                  selectedSlot?.time === slot.time && selectedSlot?.doctorId === slot.doctorId
                    ? "border-[#2f6bff] bg-[#2f6bff] text-white shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]"
                    : "border-[#d8e5ef] bg-white hover:border-[#8fb4ff]",
                )}
              >
                <p className="font-medium">{slot.time}</p>
                <p className="mt-1 text-xs opacity-75">{slot.doctorName}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`reschedule-comment-${appointment.id}`}>Коментар</Label>
          <Textarea
            id={`reschedule-comment-${appointment.id}`}
            name="comment"
            defaultValue={appointment.comment ?? ""}
            className="min-h-22 rounded-[1rem] border-[#cfe0eb] bg-white px-4 py-3 md:min-h-24 md:rounded-[1.1rem]"
          />
        </div>

        <ActionFeedback
          error={state.error}
          success={state.success}
          errorTitle="Не вдалося перенести запис"
          successTitle="Запис перенесено"
        />

        <Button
          type="submit"
          disabled={isPending || !selectedSlot}
          className="h-11 rounded-full bg-[#63bac4] text-white hover:bg-[#4ea8b2] md:h-12"
        >
          {isPending ? "Переношу…" : "Підтвердити перенесення"}
        </Button>
      </form>
    </details>
  );
}
