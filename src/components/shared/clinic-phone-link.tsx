import { clinicProfile } from "@/constants/site";
import { cn } from "@/lib/utils";

type ClinicPhoneLinkProps = {
  className?: string;
  children?: React.ReactNode;
};

export function ClinicPhoneLink({ className, children }: ClinicPhoneLinkProps) {
  return (
    <a
      href={clinicProfile.phoneHref}
      className={cn("transition-colors hover:text-primary", className)}
      aria-label={`Зателефонувати в ${clinicProfile.name} за номером ${clinicProfile.phone}`}
    >
      {children ?? clinicProfile.phone}
    </a>
  );
}
