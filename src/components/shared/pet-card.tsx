import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bird,
  CalendarDays,
  Cat,
  Dog,
  Fish,
  PawPrint,
  Rabbit,
  ShieldCheck,
  Syringe,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PetCardProps = {
  href?: string;
  headerActions?: ReactNode;
  name: string;
  species: string;
  breed: string;
  note: string;
  allergies?: string | null;
  chronicConditions?: string | null;
  nextVaccinationLabel?: string | null;
  upcomingAppointmentsCount?: number;
};

function getSpeciesPresentation(species: string): {
  Icon: LucideIcon;
  shellClassName: string;
  badgeClassName: string;
} {
  const normalizedSpecies = species.trim().toLowerCase();

  if (normalizedSpecies.includes("кіш")) {
    return {
      Icon: Cat,
      shellClassName: "border-[#cdd8f1] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] shadow-[0_24px_40px_-34px_rgba(31,87,242,0.22)]",
      badgeClassName: "bg-[#e9f0ff] text-[#1f57f2]",
    };
  }

  if (normalizedSpecies.includes("соб")) {
    return {
      Icon: Dog,
      shellClassName: "border-[#cbe4e7] bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfb_100%)] shadow-[0_24px_40px_-34px_rgba(18,131,111,0.24)]",
      badgeClassName: "bg-[#e3f6f4] text-[#12836f]",
    };
  }

  if (normalizedSpecies.includes("крол")) {
    return {
      Icon: Rabbit,
      shellClassName: "border-[#e6d8ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbf7ff_100%)] shadow-[0_24px_40px_-34px_rgba(147,51,234,0.18)]",
      badgeClassName: "bg-[#f2e9fb] text-[#8b5cf6]",
    };
  }

  if (normalizedSpecies.includes("птах")) {
    return {
      Icon: Bird,
      shellClassName: "border-[#d7e5cb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fdf4_100%)] shadow-[0_24px_40px_-34px_rgba(101,163,13,0.2)]",
      badgeClassName: "bg-[#ebf7d8] text-[#5b8f10]",
    };
  }

  if (normalizedSpecies.includes("риб")) {
    return {
      Icon: Fish,
      shellClassName: "border-[#cde4f4] bg-[linear-gradient(180deg,#ffffff_0%,#f3faff_100%)] shadow-[0_24px_40px_-34px_rgba(14,116,144,0.2)]",
      badgeClassName: "bg-[#e4f3fb] text-[#0f7490]",
    };
  }

  return {
    Icon: PawPrint,
    shellClassName: "border-[#d9e4ef] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfe_100%)] shadow-[0_24px_40px_-34px_rgba(51,65,85,0.16)]",
    badgeClassName: "bg-[#eaf3f7] text-[#0f8f9c]",
  };
}

export function PetCard({
  href,
  headerActions,
  name,
  species,
  breed,
  note,
  allergies,
  chronicConditions,
  nextVaccinationLabel,
  upcomingAppointmentsCount,
}: PetCardProps) {
  const { Icon, shellClassName, badgeClassName } = getSpeciesPresentation(species);

  return (
    <Card className={cn("h-full min-w-0 overflow-hidden rounded-[2rem]", shellClassName)}>
      <CardHeader className="gap-4 pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-[1.2rem] sm:size-12", badgeClassName)}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="break-words text-[1.9rem] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-[1.55rem] md:text-[1.75rem]">
                {name}
              </CardTitle>
              <p className="text-sm leading-6 text-slate-500 break-words">
                {species} · {breed}
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:shrink-0">
            {headerActions}
            {href ? (
              <Link
                href={href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-10 w-full rounded-full border-slate-300/90 bg-white/90 px-4 text-center text-slate-800 hover:border-slate-400 hover:bg-white sm:h-11 sm:min-w-[148px] sm:px-5",
                )}
              >
                Картка
              </Link>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-4 pt-0 text-sm text-slate-500">
        <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/72 px-4 py-3 text-slate-600">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-[1rem]", badgeClassName)}>
            <ShieldCheck className="size-4" />
          </div>
          <span className="leading-6">
            {chronicConditions || allergies ? "Є медичні позначки для прийому" : "Алергії та хронічні стани не вказані"}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <span className="leading-6">{chronicConditions || "Хронічні стани не зазначені"}</span>
          </div>
          <div className="flex items-start gap-3">
            <Syringe className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <span className="leading-6">{nextVaccinationLabel ?? "Наступна вакцинація ще не запланована"}</span>
          </div>
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <span className="leading-6">
              {upcomingAppointmentsCount ? `Майбутніх записів: ${upcomingAppointmentsCount}` : "Майбутніх записів поки немає"}
            </span>
          </div>
        </div>
        <p className="border-t border-white/70 pt-4 text-[0.95rem] leading-7 text-slate-600">{note}</p>
      </CardContent>
    </Card>
  );
}
