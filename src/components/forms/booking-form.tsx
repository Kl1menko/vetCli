"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PawPrint,
} from "lucide-react";

import { createAppointmentAction } from "@/server/actions/appointments";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState = { success: "", error: "" };

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

type ConfirmedBooking = {
  petName: string;
  serviceName: string;
  serviceDuration: number;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
};

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function BookingForm({ pets = [], services = [], doctors = [] }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createAppointmentAction(formData);
      return result.ok ? { success: result.message, error: "" } : { success: "", error: result.message };
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
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const selectedService = services.find((service) => service.id === selectedServiceId);
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedSlot?.doctorId)
    ?? doctors.find((doctor) => doctor.id === doctorPreferenceId);
  const canLoadSlots = Boolean(selectedServiceId && doctorPreferenceId && selectedDate);
  const serviceDuration = selectedService?.durationMinutes ?? 30;
  const selectedCalendarDay = calendarDays.find((day) => day.date === selectedDate);
  const nextAvailableDay = calendarDays.find((day) => day.slotCount > 0);
  const hasAvailableDaysInWeek = calendarDays.some((day) => day.slotCount > 0);
  const availableDays = calendarDays.filter((day) => day.slotCount > 0);
  const progressItems = [
    { label: "Пацієнт", complete: Boolean(selectedPetId) },
    { label: "Послуга", complete: Boolean(selectedServiceId) },
    { label: "Час", complete: Boolean(selectedSlot) },
  ];
  const progressCompleteCount = progressItems.filter((item) => item.complete).length;
  const isStepOneReady = Boolean(selectedPetId && selectedServiceId && doctorPreferenceId);
  const selectedWeekStart = new Date(`${weekStart}T12:00:00`);
  const selectedWeekEnd = new Date(selectedWeekStart);
  selectedWeekEnd.setDate(selectedWeekEnd.getDate() + 6);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedServiceId, doctorPreferenceId, selectedDate]);

  useEffect(() => {
    if (!state.success || !selectedSlot || !selectedPet || !selectedService) {
      return;
    }

    setConfirmedBooking({
      petName: selectedPet.name,
      serviceName: selectedService.name,
      serviceDuration,
      doctorName: selectedSlot.doctorName,
      doctorSpecialization: selectedSlot.doctorSpecialization,
      date: selectedDate,
      time: selectedSlot.time,
    });
  }, [selectedDate, selectedPet, selectedService, selectedSlot, serviceDuration, state.success]);

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
          throw new Error("Не вдалося завантажити час прийому.");
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
        setSlotsError(error instanceof Error ? error.message : "Не вдалося завантажити час прийому.");
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

  function renderCalendarDay(dateOption: CalendarDay) {
    const weekday = formatWeekday(dateOption.date);
    const day = formatDay(dateOption.date);
    const isSelected = selectedDate === dateOption.date;

    return (
      <button
        key={dateOption.date}
        type="button"
        onClick={() => setSelectedDate(dateOption.date)}
        className={cn(
          "w-full min-w-0 rounded-[1rem] border px-3 py-3 text-left transition-all md:rounded-[1.2rem] md:px-3.5 md:py-3.5",
          isSelected
            ? "border-[#1f57f2] bg-[linear-gradient(135deg,#1f57f2_0%,#4a79ff_100%)] text-white shadow-[0_18px_36px_-22px_rgba(31,87,242,0.42)]"
            : "border-[#d8e1ff] bg-[linear-gradient(180deg,rgba(243,246,255,0.98)_0%,rgba(255,255,255,1)_100%)] hover:-translate-y-0.5 hover:border-[#9ab4ff] hover:shadow-[0_18px_34px_-24px_rgba(31,87,242,0.22)]",
        )}
      >
        <p className="text-xs uppercase tracking-[0.18em] opacity-75">{weekday}</p>
        <p className="mt-1 text-[0.95rem] font-semibold tracking-[-0.03em] md:text-base">{day}</p>
        <p className="mt-2 text-xs opacity-85">
          {dateOption.slotCount ? `${dateOption.slotCount} варіантів часу` : "Немає вільного часу"}
        </p>
        {dateOption.firstAvailableSlot ? <p className="mt-1 text-xs opacity-70">від {dateOption.firstAvailableSlot}</p> : null}
      </button>
    );
  }

  function resetBookingFlow() {
    setConfirmedBooking(null);
    setSelectedDate(getTomorrowDate());
    setWeekStart(getTomorrowDate());
    setSelectedSlot(null);
    setSlots([]);
    setCalendarDays([]);
    setSlotsError("");
  }

  if (confirmedBooking) {
    return (
      <Card className="overflow-hidden border-[#d6def9] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(244,247,255,0.98)_100%)] shadow-[0_34px_100px_-58px_rgba(15,23,42,0.42)]">
        <CardContent className="grid gap-5 px-4 py-5 md:px-6 md:py-6">
          <div className="grid gap-4 rounded-[1.7rem] border border-[#dce4ff] bg-[linear-gradient(135deg,rgba(243,246,255,0.98)_0%,rgba(255,255,255,0.96)_52%,rgba(235,241,255,0.98)_100%)] p-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#1f57f2_0%,#4a79ff_100%)] text-white shadow-[0_18px_36px_-18px_rgba(31,87,242,0.6)]">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#5770bf]">Запис оформлено</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950 md:text-3xl">
                    Онлайн-запис успішно створено
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    Заявка вже в системі. Клініка підтвердить її, а деталі видно в кабінеті.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#d8e1ff] bg-[linear-gradient(180deg,rgba(22,50,119,0.98)_0%,rgba(31,87,242,0.92)_100%)] p-5 text-white shadow-[0_26px_70px_-36px_rgba(15,23,42,0.46)]">
              <p className="text-xs uppercase tracking-[0.2em] text-white/65">Деталі запису</p>
              <div className="mt-4 grid gap-3 text-sm">
                <p><span className="text-white/60">Тварина:</span> <span className="font-medium">{confirmedBooking.petName}</span></p>
                <p><span className="text-white/60">Послуга:</span> <span className="font-medium">{confirmedBooking.serviceName}</span> · {confirmedBooking.serviceDuration} хв</p>
                <p><span className="text-white/60">Лікар:</span> <span className="font-medium">{confirmedBooking.doctorName}</span></p>
                <p className="text-white/70">{confirmedBooking.doctorSpecialization}</p>
                <p>
                  <span className="text-white/60">Дата і час:</span>{" "}
                  <span className="font-medium">
                    {new Date(`${confirmedBooking.date}T12:00:00`).toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {confirmedBooking.time}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetBookingFlow}
              className={cn(
                buttonVariants(),
                "rounded-full bg-[linear-gradient(135deg,#1f57f2_0%,#4a79ff_100%)] px-6 text-white shadow-[0_18px_34px_-20px_rgba(31,87,242,0.6)]",
              )}
            >
              Створити ще один запис
            </button>
            <Link
              href="/cabinet/appointments"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-[#d2dcfb] bg-white px-6")}
            >
              Перейти в мої записи
            </Link>
          </div>

          <ActionFeedback success={state.success} successTitle="Готово" className="border-[#d8e4ff] bg-[#f5f8ff]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-[#d7def7] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,248,255,0.98)_100%)] shadow-[0_34px_100px_-58px_rgba(15,23,42,0.42)]">
      <CardContent className="p-3 md:p-6">
        {!pets.length ? (
          <p className="text-sm text-muted-foreground">
            Увійдіть як клієнт і додайте хоча б одну тварину.
          </p>
        ) : null}

        <form action={formAction} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <input type="hidden" name="petId" value={selectedPetId} />
          <input
            type="hidden"
            name="doctorId"
            value={selectedSlot?.doctorId ?? (doctorPreferenceId === "ANY" ? "" : doctorPreferenceId)}
          />
          <input type="hidden" name="serviceId" value={selectedServiceId} />
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="time" value={selectedSlot?.time ?? ""} />

          <div className="grid gap-4 xl:min-w-0">
            <div className="grid gap-2 rounded-[1.1rem] border border-[#dce3fa] bg-white/90 p-2 shadow-[0_18px_44px_-38px_rgba(15,23,42,0.18)] md:grid-cols-2 md:rounded-[1.4rem] md:p-2.5">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={cn(
                  "flex h-[5.25rem] items-center justify-between rounded-[0.9rem] px-3 py-2.5 text-left transition md:h-[5.75rem] md:rounded-[1rem] md:px-4",
                  currentStep === 1 ? "bg-[#1f57f2] text-white shadow-[0_16px_34px_-22px_rgba(31,87,242,0.5)]" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <span>
                  <span className="block text-[0.68rem] uppercase tracking-[0.22em] opacity-70">Крок 1</span>
                  <span className="mt-1 block text-[0.96rem] font-semibold leading-5 md:text-[1.02rem]">Дані запису</span>
                </span>
                {Boolean(selectedPetId && selectedServiceId) ? <CheckCircle2 className="size-4 shrink-0" /> : null}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isStepOneReady) {
                    setCurrentStep(2);
                  }
                }}
                className={cn(
                  "flex h-[5.25rem] items-center justify-between rounded-[0.9rem] px-3 py-2.5 text-left transition md:h-[5.75rem] md:rounded-[1rem] md:px-4",
                  currentStep === 2 ? "bg-[#1f57f2] text-white shadow-[0_16px_34px_-22px_rgba(31,87,242,0.5)]" : "text-slate-600 hover:bg-slate-50",
                  !isStepOneReady && currentStep !== 2 ? "opacity-55" : "",
                )}
              >
                <span>
                  <span className="block text-[0.68rem] uppercase tracking-[0.22em] opacity-70">Крок 2</span>
                  <span className="mt-1 block text-[0.96rem] font-semibold leading-5 md:text-[1.02rem]">День і час</span>
                </span>
                {selectedSlot ? <CheckCircle2 className="size-4 shrink-0" /> : <Clock3 className="size-4 shrink-0" />}
              </button>
            </div>

            {currentStep === 1 ? (
              <section className="grid gap-4 rounded-[1.2rem] border border-[#dce3fa] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(246,248,255,0.9)_100%)] p-4 shadow-[0_20px_52px_-42px_rgba(15,23,42,0.18)] md:rounded-[1.6rem] md:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[1rem] bg-[#e8efff] text-[#1f57f2]">
                    <PawPrint className="size-4" />
                  </div>
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#5b72b3]">Крок 1</p>
                    <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Кого записуємо</h2>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="petId" className="text-sm font-semibold text-slate-900">Тварина</Label>
                    <select
                      id="petId"
                      value={selectedPetId}
                      onChange={(event) => setSelectedPetId(event.target.value)}
                      className="h-11 min-w-0 rounded-[1rem] border border-[#d8e0f8] bg-white px-3.5 text-[0.96rem] outline-none transition focus:border-[#1f57f2]"
                    >
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="serviceId" className="text-sm font-semibold text-slate-900">Послуга</Label>
                      <select
                        id="serviceId"
                        value={selectedServiceId}
                        onChange={(event) => setSelectedServiceId(event.target.value)}
                        className="h-11 min-w-0 rounded-[1rem] border border-[#d8e0f8] bg-white px-3.5 text-[0.96rem] outline-none transition focus:border-[#1f57f2]"
                      >
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} · {service.durationMinutes} хв
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="doctorId" className="text-sm font-semibold text-slate-900">Лікар</Label>
                      <select
                        id="doctorId"
                        value={doctorPreferenceId}
                        onChange={(event) => setDoctorPreferenceId(event.target.value)}
                        className="h-11 min-w-0 rounded-[1rem] border border-[#d8e0f8] bg-white px-3.5 text-[0.96rem] outline-none transition focus:border-[#1f57f2]"
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
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {selectedPet ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e6f3] bg-[linear-gradient(180deg,rgba(247,250,255,0.98)_0%,rgba(255,255,255,1)_100%)] px-3.5 py-2 text-[0.86rem] font-medium text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)]">
                      <span className="size-2 rounded-full bg-[#0f8f9a]" />
                      {selectedPet.name}
                    </span>
                  ) : null}
                  {selectedService ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e6f3] bg-[linear-gradient(180deg,rgba(247,250,255,0.98)_0%,rgba(255,255,255,1)_100%)] px-3.5 py-2 text-[0.86rem] font-medium text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)]">
                      <span className="size-2 rounded-full bg-[#1f57f2]" />
                      {selectedService.name} · {selectedService.durationMinutes} хв
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e6f3] bg-[linear-gradient(180deg,rgba(247,250,255,0.98)_0%,rgba(255,255,255,1)_100%)] px-3.5 py-2 text-[0.86rem] font-medium text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)]">
                    <span className="size-2 rounded-full bg-slate-400" />
                    {doctorPreferenceId === "ANY" ? "Лікаря підбере система" : "Обраний конкретний лікар"}
                  </span>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setCurrentStep(2)} className="h-11 rounded-full px-5 text-sm" disabled={!isStepOneReady}>
                    Далі до часу
                  </Button>
                </div>
              </section>
            ) : null}

            {currentStep === 2 ? (
              <section className="grid gap-4 rounded-[1.2rem] border border-[#dce3fa] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,249,255,0.94)_100%)] p-4 shadow-[0_20px_52px_-42px_rgba(15,23,42,0.18)] md:rounded-[1.6rem] md:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[1rem] bg-[#edf2ff] text-[#1f57f2]">
                    <CalendarDays className="size-4" />
                  </div>
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#5b72b3]">Крок 2</p>
                    <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Коли Вам зручно</h2>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1rem] border border-[#dde4fa] bg-white/80 p-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="grid gap-1">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#5b72b3]">Обрано</p>
                    <p className="text-sm text-slate-700 md:text-[0.95rem]">
                      {selectedPet?.name ?? "Тварина"} · {selectedService?.name ?? "Послуга"} · {selectedDoctor?.fullName ?? "Лікар"}
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="h-10 rounded-full px-4 text-sm">
                    Змінити дані
                  </Button>
                </div>

                <div className="grid gap-3 rounded-[1rem] border border-[#dde4fa] bg-[linear-gradient(180deg,rgba(247,249,255,0.95)_0%,rgba(255,255,255,0.98)_100%)] p-3.5 md:rounded-[1.3rem] md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#5b72b3]">Тиждень</p>
                      <p className="mt-1 text-[0.98rem] font-semibold tracking-[-0.03em] text-slate-950 md:text-lg">
                        {selectedWeekStart.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                        {" — "}
                        {selectedWeekEnd.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => shiftWeek(-1)} className="h-9 rounded-full px-3 text-[0.82rem]">
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => shiftWeek(1)} className="h-9 rounded-full px-3 text-[0.82rem]">
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem]">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">Доступні дні</p>
                        <span className="rounded-full bg-[#e8efff] px-2.5 py-1 text-[0.72rem] font-semibold text-[#1f57f2]">
                          {availableDays.length}
                        </span>
                      </div>
                      {availableDays.length ? (
                        <div className="grid min-h-[10.5rem] grid-cols-2 gap-2 md:min-h-[11.25rem] md:grid-cols-3 xl:min-h-[16rem] xl:grid-cols-5">
                          {availableDays.map((dateOption) => renderCalendarDay(dateOption))}
                        </div>
                      ) : (
                        <div className="rounded-[1rem] border border-dashed border-[#d8e1ff] bg-white/90 px-3 py-4 text-sm text-slate-500">
                          На цьому тижні вільного часу немає.
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1rem] border border-slate-200/80 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-950">Дата</p>
                      <input
                        id="booking-date"
                        type="date"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        className="mt-2 h-10 w-full rounded-[0.85rem] border border-[#d8e0f8] bg-white px-3 text-[0.92rem] outline-none transition focus:border-[#1f57f2]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1rem] border border-dashed border-[#d8e1ff] bg-[linear-gradient(180deg,rgba(245,248,255,0.94)_0%,rgba(255,255,255,0.98)_100%)] p-3.5 md:rounded-[1.3rem] md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4 text-[#1f57f2]" />
                      <p className="font-medium text-slate-950">Доступний час</p>
                    </div>
                    {selectedService ? (
                      <p className="rounded-full border border-[#dde4fa] bg-white px-2.5 py-1 text-[0.72rem] text-slate-600">
                        {selectedService.durationMinutes} хв
                      </p>
                    ) : null}
                  </div>

                  {isLoadingSlots ? <p className="text-sm text-slate-500">Шукаю доступний час…</p> : null}
                  {slotsError ? <ActionFeedback error={slotsError} errorTitle="Не вдалося завантажити час" /> : null}

                  {!isLoadingSlots && !slotsError && slots.length ? (
                    <>
                      {selectedSlot ? (
                        <div className="grid gap-1.5 rounded-[1rem] border border-[#d8e1ff] bg-[linear-gradient(180deg,rgba(239,244,255,0.96)_0%,rgba(248,250,255,0.98)_100%)] px-3 py-3">
                          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-500">Обраний час</p>
                          <p className="text-base font-semibold text-slate-950">
                            {formatLongDate(selectedDate)} · {selectedSlot.time}
                          </p>
                          <p className="text-sm text-slate-600">{selectedSlot.doctorName}</p>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
                        {slots.map((slot) => {
                          const isSelected =
                            selectedSlot?.time === slot.time && selectedSlot?.doctorId === slot.doctorId;

                          return (
                            <button
                              key={`${slot.time}-${slot.doctorId}`}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              aria-pressed={isSelected}
                              className={cn(
                                "min-w-0 rounded-[0.95rem] border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                isSelected
                                  ? "border-[#1f57f2] bg-[linear-gradient(180deg,#1f57f2_0%,#2450c9_100%)] text-white shadow-[0_18px_36px_-20px_rgba(31,87,242,0.42)]"
                                  : "border-[#d8e1ff] bg-white text-slate-900 hover:border-[#9eb7ff]",
                              )}
                            >
                              <p className="text-[1rem] font-semibold tracking-[-0.05em]">{slot.time}</p>
                              <p className={cn("mt-1 truncate text-[0.72rem]", isSelected ? "text-white/75" : "text-slate-500")}>
                                {doctorPreferenceId === "ANY" ? slot.doctorName : "Обраний лікар"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {!isLoadingSlots && !slotsError && !slots.length && selectedCalendarDay?.slotCount === 0 && nextAvailableDay ? (
                    <div className="rounded-[1rem] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,249,235,0.96)_0%,rgba(255,255,255,1)_100%)] p-4">
                      <p className="text-sm font-semibold text-slate-900">На цю дату вільного часу немає.</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Найближчий день: {formatLongDate(nextAvailableDay.date)}
                        {nextAvailableDay.firstAvailableSlot ? ` від ${nextAvailableDay.firstAvailableSlot}` : ""}.
                      </p>
                      <Button type="button" onClick={() => setSelectedDate(nextAvailableDay.date)} className="mt-3 h-10 rounded-full px-4 text-sm">
                        Обрати найближчий день
                      </Button>
                    </div>
                  ) : null}

                  {!isLoadingSlots && !slotsError && !slots.length && !hasAvailableDaysInWeek ? (
                    <div className="rounded-[1rem] border border-[#dde4fa] bg-white/90 p-4">
                      <p className="text-sm font-semibold text-slate-950">На цьому тижні вільного часу немає.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" onClick={() => shiftWeek(1)} className="h-10 rounded-full px-4 text-sm">
                          Наступний тиждень
                        </Button>
                        {doctorPreferenceId !== "ANY" ? (
                          <Button type="button" variant="outline" onClick={() => setDoctorPreferenceId("ANY")} className="h-10 rounded-full px-4 text-sm">
                            Будь-який лікар
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>

          <div className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
            <section className="grid gap-3 rounded-[1.25rem] border border-[#193d97]/10 bg-[linear-gradient(180deg,rgba(18,46,116,0.98)_0%,rgba(31,87,242,0.92)_100%)] p-3.5 text-white shadow-[0_28px_80px_-42px_rgba(15,23,42,0.56)] md:gap-4 md:rounded-[1.7rem] md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.2em] text-white/60">Підсумок</p>
                  <p className="mt-1.5 text-[1rem] font-semibold tracking-[-0.04em] text-white md:text-2xl">
                    {progressCompleteCount === 3 ? "Можна підтвердити" : currentStep === 1 ? "Спершу оберіть дані" : "Оберіть день і час"}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[0.72rem] font-semibold text-white/80 md:px-3 md:py-1.5 md:text-sm">
                  {progressCompleteCount}/3
                </div>
              </div>

              <div className="grid gap-2">
                {progressItems.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center justify-between rounded-[0.9rem] border px-3 py-2 text-[0.88rem] md:rounded-[1rem] md:px-4 md:py-2.5 md:text-sm",
                      item.complete ? "border-white/10 bg-white/8 text-white" : "border-white/8 bg-black/8 text-white/65",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.complete ? <CheckCircle2 className="size-4 text-[#d7e3ff]" /> : <span>Очікує</span>}
                  </div>
                ))}
              </div>

              <div className="grid gap-2 rounded-[1rem] border border-white/10 bg-white/7 p-3 text-[0.88rem] md:gap-2.5 md:p-4 md:text-sm">
                <p><span className="text-white/55">Тварина:</span> <span className="font-medium">{selectedPet?.name ?? "Не обрано"}</span></p>
                <p><span className="text-white/55">Послуга:</span> <span className="font-medium">{selectedService?.name ?? "Не обрано"}</span></p>
                <p><span className="text-white/55">Лікар:</span> <span className="font-medium">{selectedDoctor?.fullName ?? "Не обрано"}</span></p>
                <p>
                  <span className="text-white/55">Дата і час:</span>{" "}
                  <span className="font-medium">
                    {selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("uk-UA") : "Не обрано"}
                    {selectedSlot ? ` · ${selectedSlot.time}` : ""}
                  </span>
                </p>
              </div>
            </section>

            <section className="grid gap-3 rounded-[1.25rem] border border-[#dde4fa] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,255,0.96)_100%)] p-3.5 shadow-[0_20px_52px_-42px_rgba(15,23,42,0.18)] md:gap-4 md:rounded-[1.7rem] md:p-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="comment" className="text-[0.88rem] font-semibold text-slate-900 md:text-sm">
                  Коментар
                </Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder="Симптоми або побажання до прийому"
                  className="min-h-20 rounded-[0.9rem] border-[#dbe3fb] bg-white px-3 py-2.5 md:min-h-28 md:rounded-[1.1rem] md:px-4 md:py-3"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending || !pets.length || !selectedSlot}
                className="h-10 rounded-[0.95rem] bg-[linear-gradient(135deg,#1f57f2_0%,#4a79ff_100%)] text-sm shadow-[0_18px_36px_-20px_rgba(31,87,242,0.55)] hover:opacity-95 md:h-12 md:rounded-[1.2rem] md:text-base"
              >
                {isPending ? "Створюю запис…" : "Підтвердити запис"}
              </Button>

              {!selectedSlot ? <p className="text-sm text-slate-500">Оберіть доступний час.</p> : null}
              <ActionFeedback error={state.error} errorTitle="Не вдалося створити запис" className="border-[#f5c6cc] bg-[#fff5f6]" />
            </section>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
