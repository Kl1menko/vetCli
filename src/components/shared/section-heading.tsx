import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center")}>
      {eyebrow ? (
        <span className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </span>
      ) : null}
      <div className="flex max-w-2xl flex-col gap-3">
        <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">{title}</h2>
        {description ? (
          <p className="text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
