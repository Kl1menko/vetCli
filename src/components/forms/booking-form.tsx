"use client";

import type { CSSProperties } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, PawPrint, Stethoscope } from "lucide-react";

import { createAppointmentAction } from "@/server/actions/appointments";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";

const initialState = { message: "" };

type BookingFormProps = {
  pets?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string; durationMinutes: number }>;
  doctors?: Array<{ id: string; fullName: string; specialization: string }>;
};

type SlotOption = {
  time: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
};

type CalendarDay = {
  date: string;
  slotCount: number;
  firstAvailableSlot: string | null;
};

const DEFAULT_TIMELINE_START = "09:00";
const DEFAULT_TIMELINE_END = "18:00";
const TIMELINE_STEP_MINUTES = 30;
const TIMELINE_PIXELS_PER_MINUTE = 1.35;

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatGridLabel(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function buildTimelineScale(startMinutes: number, endMinutes: number, stepMinutes: number) {
  const items: string[] = [];

  for (let cursor = startMinutes; cursor <= endMinutes; cursor += stepMinutes) {
    items.push(formatGridLabel(cursor));
  }

  return items;
}

export function BookingForm({ pets = [], services = [], doctors = [] }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createAppointmentAction(formData);
      return { message: result.message };
    },
    initialState,
  );
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? "");
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [doctorPreferenceId, setDoctorPreferenceId] = useState("ANY");
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
  const [weekStart, setWeekStart] = useState(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  useActionToast(
    state.message
      ? {
          success: state.message,
        }
      : {},
    {
      successTitle: "Онлайн-запис створено",
    },
  );

  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const selectedService = services.find((service) => service.id === selectedServiceId);
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedSlot?.doctorId)
    ?? doctors.find((doctor) => doctor.id === doctorPreferenceId);
  const canLoadSlots = Boolean(selectedServiceId && doctorPreferenceId && selectedDate);
  const serviceDuration = selectedService?.durationMinutes ?? TIMELINE_STEP_MINUTES;
  const selectedCalendarDay = calendarDays.find((day) => day.date === selectedDate);
  const nextAvailableDay = calendarDays.find((day) => day.slotCount > 0);
  const hasAvailableDaysInWeek = calendarDays.some((day) => day.slotCount > 0);
  const availableDays = calendarDays.filter((day) => day.slotCount > 0);
  const unavailableDays = calendarDays.filter((day) => day.slotCount === 0);

  const {
    timelineScale,
    timelineDuration,
    timelineStartMinutes,
    timelineHeight,
    slotTimelineItems,
  } = useMemo(() => {
    const fallbackStart = toMinutes(DEFAULT_TIMELINE_START);
    const fallbackEnd = toMinutes(DEFAULT_TIMELINE_END);
    const slotMinutes = slots.map((slot) => toMinutes(slot.time));
    const earliestSlot = slotMinutes.length ? Math.min(...slotMinutes) : fallbackStart;
    const latestSlot = slotMinutes.length
      ? Math.max(...slotMinutes.map((slotMinute) => slotMinute + serviceDuration))
      : fallbackEnd;
    const normalizedStart = Math.floor((earliestSlot - TIMELINE_STEP_MINUTES) / TIMELINE_STEP_MINUTES) * TIMELINE_STEP_MINUTES;
    const normalizedEnd = Math.ceil((latestSlot + TIMELINE_STEP_MINUTES) / TIMELINE_STEP_MINUTES) * TIMELINE_STEP_MINUTES;
    const startMinutes = Math.max(7 * 60, Math.min(fallbackStart, normalizedStart));
    const endMinutes = Math.min(21 * 60, Math.max(fallbackEnd, normalizedEnd));
    const duration = Math.max(endMinutes - startMinutes, TIMELINE_STEP_MINUTES * 4);
    const groupedByTime = Map.groupBy(slots, (slot) => slot.time);

    return {
      timelineScale: buildTimelineScale(startMinutes, endMinutes, TIMELINE_STEP_MINUTES),
      timelineDuration: duration,
      timelineStartMinutes: startMinutes,
      timelineHeight: Math.max(duration * TIMELINE_PIXELS_PER_MINUTE, 420),
      slotTimelineItems: slots.map((slot) => {
        const groupedSlots = groupedByTime.get(slot.time) ?? [slot];
        const laneIndex = groupedSlots.findIndex((groupedSlot) => groupedSlot.doctorId === slot.doctorId);
        const laneCount = groupedSlots.length;
        const top = (toMinutes(slot.time) - startMinutes) * TIMELINE_PIXELS_PER_MINUTE;
        const height = Math.max(serviceDuration * TIMELINE_PIXELS_PER_MINUTE, 52);
        const laneWidth = 100 / laneCount;

        return {
          slot,
          top,
          height,
          left: `calc(${laneIndex * laneWidth}% + 4px)`,
          width: `calc(${laneWidth}% - 8px)`,
          laneCount,
        };
      }),
    };
  }, [serviceDuration, slots]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedServiceId, doctorPreferenceId, selectedDate]);

  useEffect(() => {
    if (!canLoadSlots) {
      setSlots([]);
      setCalendarDays([]);
      setSlotsError("");
      return;
    }

    const controller = new AbortController();

    async function loadSlots() {
      setIsLoadingSlots(true);
      setSlotsError("");

      try {
        const query = new URLSearchParams({
          doctorId: doctorPreferenceId,
          serviceId: selectedServiceId,
          date: selectedDate,
          weekStart,
          days: "7",
        });
        const response = await fetch(`/api/booking/slots?${query.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити слоти.");
        }

        const data = (await response.json()) as {
          slots?: SlotOption[];
          calendar?: CalendarDay[];
        };
        setSlots(data.slots ?? []);
        setCalendarDays(data.calendar ?? []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSlots([]);
        setCalendarDays([]);
        setSlotsError(error instanceof Error ? error.message : "Не вдалося завантажити слоти.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadSlots();

    return () => controller.abort();
  }, [canLoadSlots, doctorPreferenceId, selectedDate, selectedServiceId, weekStart]);

  function shiftWeek(offset: number) {
    const nextWeekStart = new Date(`${weekStart}T12:00:00`);
    nextWeekStart.setDate(nextWeekStart.getDate() + offset * 7);
    const normalized = nextWeekStart.toISOString().slice(0, 10);
    setWeekStart(normalized);
    setSelectedDate(normalized);
  }

  function formatWeekday(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("uk-UA", { weekday: "short" });
  }

  function formatDay(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
  }

  function formatLongDate(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("uk-UA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function renderCalendarDay(dateOption: CalendarDay, mode: "available" | "unavailable") {
    const weekday = formatWeekday(dateOption.date);
    const day = formatDay(dateOption.date);
    const isSelected = selectedDate === dateOption.date;

    return (
      <button
        key={dateOption.date}
        type="button"
        onClick={() => setSelectedDate(dateOption.date)}
        className={cn(
          "rounded-2xl border px-4 py-3 text-left transition-all",
          mode === "available" &&
            (isSelected
              ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_-20px_rgba(8,145,178,0.9)]"
              : "border-emerald-200/80 bg-[linear-gradient(180deg,rgba(240,253,250,0.98)_0%,rgba(255,255,255,1)_100%)] hover:border-primary/35 hover:bg-emerald-50/80"),
          mode === "unavailable" &&
            (isSelected
              ? "border-slate-400 bg-slate-700 text-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.55)]"
              : "border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(255,255,255,1)_100%)] text-slate-500 hover:border-slate-300 hover:bg-slate-50"),
        )}
      >
        <p className="text-xs uppercase tracking-[0.16em] opacity-75">{weekday}</p>
        <p className="mt-1 font-medium">{day}</p>
        <p className="mt-2 text-xs opacity-80">
          {dateOption.slotCount ? `${dateOption.slotCount} слотів` : "Немає вільного часу"}
        </p>
        {dateOption.firstAvailableSlot ? (
          <p className="mt-1 text-xs opacity-70">від {dateOption.firstAvailableSlot}</p>
        ) : null}
      </button>
    );
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,251,251,0.98)_100%)] shadow-[0_30px_90px_-52px_rgba(15,23,42,0.4)]">
      <CardHeader className="gap-3 border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(113,204,196,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.88))]">
        <CardTitle className="text-2xl">Онлайн-запис без дзвінка в реєстратуру</CardTitle>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Обери тварину, послугу, лікаря і день. Система покаже тільки реальні вільні слоти з урахуванням графіка, блокувань і тривалості послуги.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {!pets.length ? (
          <p className="text-sm text-muted-foreground">
            Для реального запису авторизуйся як клієнт і додай хоча б одну тварину в кабінеті.
          </p>
        ) : null}

        <form action={formAction} className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <input type="hidden" name="petId" value={selectedPetId} />
          <input type="hidden" name="serviceId" value={selectedServiceId} />
          <input type="hidden" name="doctorId" value={selectedSlot?.doctorId ?? (doctorPreferenceId === "ANY" ? "" : doctorPreferenceId)} />
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="time" value={selectedSlot?.time ?? ""} />

          <div className="grid gap-6">
            <section className="grid gap-4 rounded-3xl border border-border/70 bg-background/80 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PawPrint className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Крок 1</p>
                  <p className="text-sm text-muted-foreground">Кого записуємо</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => setSelectedPetId(pet.id)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition-all",
                      selectedPetId === pet.id
                        ? "border-primary bg-primary/8 shadow-[0_10px_30px_-20px_rgba(8,145,178,0.7)]"
                        : "border-border/70 bg-background hover:border-primary/30 hover:bg-muted/50",
                    )}
                  >
                    <p className="font-medium">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">Картка доступна в кабінеті</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-border/70 bg-background/80 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Stethoscope className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Крок 2</p>
                  <p className="text-sm text-muted-foreground">Що і в кого</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="serviceId">Послуга</Label>
                  <select
                    id="serviceId"
                    value={selectedServiceId}
                    onChange={(event) => setSelectedServiceId(event.target.value)}
                    className="h-11 rounded-2xl border border-input bg-background px-4"
                  >
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} · {service.durationMinutes} хв
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="doctorId">Лікар</Label>
                  <select
                    id="doctorId"
                    value={doctorPreferenceId}
                    onChange={(event) => setDoctorPreferenceId(event.target.value)}
                    className="h-11 rounded-2xl border border-input bg-background px-4"
                  >
                    <option value="ANY">Будь-який доступний лікар</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName} · {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-border/70 bg-background/80 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Крок 3</p>
                  <p className="text-sm text-muted-foreground">Обери день і слот</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => shiftWeek(-1)}>
                  <ChevronLeft />
                  Попередній тиждень
                </Button>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {new Date(`${weekStart}T12:00:00`).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                    {" — "}
                    {new Date(new Date(`${weekStart}T12:00:00`).setDate(new Date(`${weekStart}T12:00:00`).getDate() + 6)).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasAvailableDaysInWeek
                      ? `У цьому тижні доступні ${calendarDays.reduce((sum, day) => sum + day.slotCount, 0)} слотів`
                      : "У поточному тижні вільних слотів поки немає"}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => shiftWeek(1)}>
                  Наступний тиждень
                  <ChevronRight />
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.6rem] border border-emerald-200/70 bg-[linear-gradient(180deg,rgba(240,253,250,0.8)_0%,rgba(255,255,255,1)_100%)] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Вільні дні</p>
                      <p className="text-xs text-muted-foreground">
                        Тут є хоча б один реальний доступний слот.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {availableDays.length}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {availableDays.length ? (
                      availableDays.map((dateOption) => renderCalendarDay(dateOption, "available"))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/90 px-4 py-5 text-sm text-muted-foreground sm:col-span-2 xl:col-span-4">
                        На цьому тижні зараз немає жодного дня з вільними слотами.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.86)_0%,rgba(255,255,255,1)_100%)] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Без вільного часу</p>
                      <p className="text-xs text-muted-foreground">
                        Ці дні можна переглянути, але всі слоти вже зайняті або недоступні.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {unavailableDays.length}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {unavailableDays.length ? (
                      unavailableDays.map((dateOption) => renderCalendarDay(dateOption, "unavailable"))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/90 px-4 py-5 text-sm text-muted-foreground sm:col-span-2 xl:col-span-4">
                        Усі дні в поточному тижні мають доступний час.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-date">Інша дата вручну</Label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-11 rounded-2xl border border-input bg-background px-4"
                />
                <p className="text-xs text-muted-foreground">
                  Системний календар браузера не вміє кольором показувати доступність, тому орієнтуйся на блоки вище: там дні вже розділені на вільні й зайняті.
                </p>
              </div>

              <div className="grid gap-4 rounded-3xl border border-dashed border-border/80 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-primary" />
                    <div>
                      <p className="font-medium">Day-grid доступності</p>
                      <p className="text-xs text-muted-foreground">
                        Натисни на блок у часовій сітці, щоб обрати реальний слот.
                      </p>
                    </div>
                  </div>
                  {selectedService ? (
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {selectedService.durationMinutes} хв
                    </p>
                  ) : null}
                </div>

                {isLoadingSlots ? <p className="text-sm text-muted-foreground">Шукаю доступні слоти…</p> : null}
                {slotsError ? <ActionFeedback error={slotsError} errorTitle="Не вдалося завантажити календар" /> : null}
                {!isLoadingSlots && !slotsError && !slots.length && !selectedCalendarDay ? (
                  <p className="text-sm text-muted-foreground">
                    На цей день для обраної конфігурації вільних слотів немає.
                  </p>
                ) : null}

                {!isLoadingSlots && !slotsError && slots.length ? (
                  <>
                    <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-xs text-muted-foreground md:grid-cols-3">
                      <div>
                        <p className="uppercase tracking-[0.16em] text-muted-foreground/80">Дата</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {formatLongDate(selectedDate)}
                        </p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.16em] text-muted-foreground/80">Режим</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {doctorPreferenceId === "ANY" ? "Будь-який доступний лікар" : selectedDoctor?.fullName ?? "Обраний лікар"}
                        </p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.16em] text-muted-foreground/80">Вільних слотів</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{slots.length}</p>
                      </div>
                    </div>

                    {selectedSlot ? (
                      <div className="grid gap-3 rounded-[1.75rem] border border-primary/15 bg-[linear-gradient(180deg,rgba(227,248,246,0.88)_0%,rgba(246,252,251,0.96)_100%)] px-4 py-4 md:grid-cols-[1.1fr_0.9fr]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Обраний слот</p>
                          <p className="mt-2 text-lg font-semibold text-foreground">
                            {formatLongDate(selectedDate)} · {selectedSlot.time}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedSlot.doctorName} · {selectedSlot.doctorSpecialization}
                          </p>
                        </div>
                        <div className="grid gap-1 text-sm text-muted-foreground">
                          <p>
                            Тривалість: <span className="font-medium text-foreground">{serviceDuration} хв</span>
                          </p>
                          <p>
                            Послуга: <span className="font-medium text-foreground">{selectedService?.name}</span>
                          </p>
                          <p>
                            Пацієнт: <span className="font-medium text-foreground">{selectedPet?.name}</span>
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[2rem] border border-border/70 bg-background p-4">
                      <div className="grid grid-cols-[60px_1fr] gap-3">
                        <div className="relative">
                          {timelineScale.map((time, index) => (
                            <div
                              key={time}
                              className="absolute inset-x-0 flex -translate-y-1/2 justify-end pr-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                              style={{
                                top: `${((toMinutes(time) - timelineStartMinutes) / timelineDuration) * 100}%`,
                              }}
                            >
                              <span className={index === 0 ? "opacity-0" : ""}>{time}</span>
                            </div>
                          ))}
                        </div>

                        <div
                          className="relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,rgba(247,250,250,0.94)_0%,rgba(255,255,255,1)_100%)]"
                          style={{ height: `${timelineHeight}px` }}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(113,204,196,0.14),transparent_28%)]" />
                          {timelineScale.map((time) => (
                            <div
                              key={time}
                              className="absolute inset-x-0 border-t border-dashed border-border/60"
                              style={{
                                top: `${((toMinutes(time) - timelineStartMinutes) / timelineDuration) * 100}%`,
                              }}
                            />
                          ))}

                          {slotTimelineItems.map(({ slot, top, height, left, width, laneCount }) => {
                            const isSelected =
                              selectedSlot?.time === slot.time && selectedSlot?.doctorId === slot.doctorId;
                            const style: CSSProperties = { top, height, left, width };

                            return (
                              <button
                                key={`${slot.time}-${slot.doctorId}`}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                aria-pressed={isSelected}
                                className={cn(
                                  "absolute rounded-[1.35rem] border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-[0_18px_40px_-18px_rgba(8,145,178,0.8)]"
                                    : "border-primary/15 bg-[linear-gradient(180deg,rgba(225,247,244,0.92)_0%,rgba(211,239,236,0.82)_100%)] text-slate-900 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_20px_40px_-24px_rgba(8,145,178,0.45)]",
                                )}
                                style={style}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold">{slot.time}</p>
                                    <p className={cn("mt-1 text-xs", isSelected ? "text-primary-foreground/80" : "text-slate-600")}>
                                      {selectedService?.name}
                                    </p>
                                  </div>
                                  {laneCount > 1 ? (
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em]",
                                        isSelected ? "bg-white/15 text-primary-foreground/80" : "bg-white/70 text-slate-700",
                                      )}
                                    >
                                      {slot.doctorName.split(" ")[0]}
                                    </span>
                                  ) : null}
                                </div>
                                <div className={cn("mt-3 space-y-1 text-xs", isSelected ? "text-primary-foreground/80" : "text-slate-600")}>
                                  <p>{slot.doctorName}</p>
                                  <p>{slot.doctorSpecialization}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {doctorPreferenceId === "ANY" ? (
                      <p className="text-xs text-muted-foreground">
                        Коли один і той самий час доступний у кількох лікарів, слоти показані поруч в одному часовому рядку.
                      </p>
                    ) : null}
                  </>
                ) : null}

                {!isLoadingSlots && !slotsError && !slots.length && selectedCalendarDay?.slotCount === 0 && nextAvailableDay ? (
                  <div className="rounded-[1.75rem] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,249,235,0.96)_0%,rgba(255,255,255,1)_100%)] p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      На {formatLongDate(selectedDate)} вільного часу немає.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Найближчий доступний день у поточному вікні: {formatLongDate(nextAvailableDay.date)}
                      {nextAvailableDay.firstAvailableSlot ? ` від ${nextAvailableDay.firstAvailableSlot}` : ""}.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button type="button" onClick={() => setSelectedDate(nextAvailableDay.date)} className="rounded-2xl">
                        Перейти до найближчого дня
                      </Button>
                      <Button type="button" variant="outline" onClick={() => shiftWeek(1)} className="rounded-2xl">
                        Шукати в наступному тижні
                      </Button>
                    </div>
                  </div>
                ) : null}

                {!isLoadingSlots && !slotsError && !slots.length && !hasAvailableDaysInWeek ? (
                  <div className="rounded-[1.75rem] border border-border/70 bg-background/90 p-5">
                    <p className="text-sm font-semibold text-foreground">У поточному тижні немає вільних слотів.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Спробуй перейти на наступний тиждень або змінити лікаря. Якщо стоїть режим “будь-який доступний лікар”, значить зараз завантаження справді щільне.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button type="button" onClick={() => shiftWeek(1)} className="rounded-2xl">
                        Показати наступний тиждень
                      </Button>
                      {doctorPreferenceId !== "ANY" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDoctorPreferenceId("ANY")}
                          className="rounded-2xl"
                        >
                          Шукати в будь-якого лікаря
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <div className="grid gap-6">
            <section className="grid gap-4 rounded-[2rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(18,52,59,0.98)_0%,rgba(18,62,73,0.96)_100%)] p-6 text-white shadow-[0_24px_80px_-42px_rgba(15,23,42,0.55)]">
              <p className="text-xs uppercase tracking-[0.2em] text-white/65">Підсумок бронювання</p>
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-white/60">Тварина</p>
                  <p className="mt-1 text-base font-medium">{selectedPet?.name ?? "Не обрано"}</p>
                </div>
                <div>
                  <p className="text-white/60">Послуга</p>
                  <p className="mt-1 text-base font-medium">{selectedService?.name ?? "Не обрано"}</p>
                </div>
                <div>
                  <p className="text-white/60">Лікар</p>
                  <p className="mt-1 text-base font-medium">{selectedDoctor?.fullName ?? "Не обрано"}</p>
                  <p className="text-sm text-white/55">
                    {selectedSlot ? selectedSlot.doctorSpecialization : selectedDoctor?.specialization ?? ""}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Дата і час</p>
                  <p className="mt-1 text-base font-medium">
                    {selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("uk-UA") : "Не обрано"}
                    {selectedSlot ? ` · ${selectedSlot.time}` : ""}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-border/70 bg-background/80 p-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="comment">Коментар до запису</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder="Коротко опиши причину звернення, симптоми або побажання до прийому"
                />
              </div>

              <Button type="submit" disabled={isPending || !pets.length || !selectedSlot} className="h-11 rounded-2xl">
                {isPending ? "Створюю запис…" : "Підтвердити онлайн-запис"}
              </Button>

              {!selectedSlot ? (
                <p className="text-sm text-muted-foreground">
                  Щоб продовжити, обери доступний слот у календарі.
                </p>
              ) : null}
              <ActionFeedback success={state.message} successTitle="Запис створено" />
            </section>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
