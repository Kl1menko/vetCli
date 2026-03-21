"use client";

import { useActionState, useState } from "react";

import { createAdminAppointmentFormAction, type AdminActionState } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

type OwnerOption = {
  id: string;
  fullName: string;
};

type PetOption = {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
};

type DoctorOption = {
  id: string;
  fullName: string;
};

type ServiceOption = {
  id: string;
  name: string;
};

const initialState: AdminActionState = {};

export function AdminAppointmentCreateForm({
  owners,
  pets,
  doctors,
  services,
  selectedDate,
  selectedDoctorId,
  selectedServiceId,
}: {
  owners: OwnerOption[];
  pets: PetOption[];
  doctors: DoctorOption[];
  services: ServiceOption[];
  selectedDate: string;
  selectedDoctorId?: string;
  selectedServiceId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createAdminAppointmentFormAction, initialState);
  const [ownerId, setOwnerId] = useState(owners[0]?.id ?? "");
  const ownerPets = pets.filter((pet) => pet.ownerId === ownerId);
  const [petId, setPetId] = useState(ownerPets[0]?.id ?? "");
  const selectedPetId = ownerPets.some((pet) => pet.id === petId) ? petId : (ownerPets[0]?.id ?? "");

  useActionToast(state, {
    successTitle: "Запис створено",
    errorTitle: "Не вдалося створити запис",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <select
        name="ownerId"
        value={ownerId}
        onChange={(event) => {
          const nextOwnerId = event.target.value;
          const nextOwnerPets = pets.filter((pet) => pet.ownerId === nextOwnerId);

          setOwnerId(nextOwnerId);
          setPetId(nextOwnerPets[0]?.id ?? "");
        }}
        className="h-10 rounded-lg border border-input px-3"
      >
        {owners.map((owner) => (
          <option key={owner.id} value={owner.id}>
            {owner.fullName}
          </option>
        ))}
      </select>
      <select
        name="petId"
        value={selectedPetId}
        onChange={(event) => setPetId(event.target.value)}
        className="h-10 rounded-lg border border-input px-3"
        disabled={!ownerPets.length}
      >
        {ownerPets.length ? (
          ownerPets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} · {pet.ownerName}
            </option>
          ))
        ) : (
          <option value="">У цього клієнта немає активних тварин</option>
        )}
      </select>
      <select name="doctorId" className="h-10 rounded-lg border border-input px-3" defaultValue={selectedDoctorId}>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.fullName}
          </option>
        ))}
      </select>
      <select name="serviceId" className="h-10 rounded-lg border border-input px-3" defaultValue={selectedServiceId}>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
      <input name="date" type="date" defaultValue={selectedDate} className="h-10 rounded-lg border border-input px-3" />
      <input name="startTime" type="time" required className="h-10 rounded-lg border border-input px-3" />
      <textarea name="comment" placeholder="Коментар адміністратора" className="min-h-24 rounded-lg border border-input px-3 py-2" />

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося створити запис"
        successTitle="Запис створено"
      />

      <Button type="submit" disabled={isPending || !ownerPets.length || !selectedPetId}>
        {isPending ? "Створюю запис…" : "Створити запис"}
      </Button>
    </form>
  );
}
