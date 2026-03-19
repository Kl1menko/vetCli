import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-[linear-gradient(180deg,#fbfcfd_0%,#ffffff_100%)] px-6 py-8 text-center",
        className,
      )}
    >
      <p className="text-base font-semibold tracking-[-0.02em] text-slate-950">{title}</p>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
