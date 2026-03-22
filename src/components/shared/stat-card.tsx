"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

function parseAnimatedValue(value: string) {
  const match = value.match(/^(\d+)(.*)$/);

  if (!match) {
    return null;
  }

  return {
    target: Number(match[1]),
    suffix: match[2],
  };
}

export function StatCard({ label, value, hint }: StatCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animatedValue = useMemo(() => parseAnimatedValue(value), [value]);

  useEffect(() => {
    if (!animatedValue || hasAnimated || !ref.current) {
      return;
    }

    const metric = animatedValue;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        const duration = 900;
        const start = performance.now();

        function tick(timestamp: number) {
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          const nextValue = Math.round(metric.target * eased);
          setDisplayValue(`${nextValue}${metric.suffix}`);

          if (progress < 1) {
            window.requestAnimationFrame(tick);
            return;
          }

          setHasAnimated(true);
        }

        window.requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [animatedValue, hasAnimated]);

  return (
    <Card
      ref={ref}
      className="border border-[#d9e4ff] bg-white shadow-[0_24px_50px_-38px_rgba(15,23,42,0.14)]"
    >
      <CardContent className="flex min-h-[10.5rem] flex-col items-center justify-center gap-2.5 px-6 py-6 text-center sm:min-h-[11rem] sm:gap-3 sm:px-7 sm:py-6 md:min-h-[9.5rem]">
        <span className="text-[0.95rem] font-medium tracking-[-0.01em] text-slate-500 sm:text-sm">{label}</span>
        <span className="text-[3rem] font-semibold leading-none tracking-[-0.06em] text-[#102749] sm:text-5xl md:text-[3.25rem]">
          {animatedValue ? displayValue : value}
        </span>
        <p className="max-w-[18rem] text-[0.95rem] leading-5 text-slate-500 sm:max-w-[20rem] sm:text-sm sm:leading-6">{hint}</p>
      </CardContent>
    </Card>
  );
}
