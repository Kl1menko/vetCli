import Image from "next/image";
import Link from "next/link";

import { ClinicPhoneLink } from "@/components/shared/clinic-phone-link";
import { publicNavigation } from "@/constants/navigation";
import { clinicProfile } from "@/constants/site";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="grid w-full gap-10 px-[15px] py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/logo.svg"
              alt={`${clinicProfile.name} logo`}
              width={44}
              height={48}
              className="h-11 w-auto object-contain"
            />
            <div className="text-[2rem] font-semibold leading-[0.9] tracking-[-0.07em] text-[#0f2a4f] sm:text-[2.3rem]">
              Ultra<span className="text-[#1f57f2]">Vet</span>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Сучасна ветклініка у Львові з онлайн-записом, особистим кабінетом власника тварини, медичною історією та прозорою комунікацією після прийому.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Навігація
          </span>
          <div className="flex flex-col gap-2">
            {publicNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Контакти
          </span>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{clinicProfile.address}</p>
            <p>{clinicProfile.hours}</p>
            <p>{clinicProfile.closedDay}</p>
            <p>
              <ClinicPhoneLink>{clinicProfile.phone}</ClinicPhoneLink>
            </p>
            <p>{clinicProfile.email}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
