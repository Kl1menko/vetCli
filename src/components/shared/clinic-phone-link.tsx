import { clinicProfile } from "@/constants/site";
import { cn } from "@/lib/utils";

type ClinicPhoneLinkProps = {
  className?: string;
  children?: React.ReactNode;
  phone?: string;
  phoneHref?: string;
  clinicName?: string;
};

export function ClinicPhoneLink({
  className,
  children,
  phone = clinicProfile.phone,
  phoneHref = clinicProfile.phoneHref,
  clinicName = clinicProfile.name,
}: ClinicPhoneLinkProps) {
  return (
    <a
      href={phoneHref}
      className={cn("transition-colors hover:text-primary", className)}
      aria-label={`Зателефонувати в ${clinicName} за номером ${phone}`}
    >
      {children ?? phone}
    </a>
  );
}
