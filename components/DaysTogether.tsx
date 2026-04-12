"use client";

import { useEffect, useState } from "react";

export default function DaysTogether({ startDate }: { startDate: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const start = new Date(startDate).getTime();
    setDays(Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
  }, [startDate]);

  if (days === null) return <>···</>;
  return <>{days.toLocaleString("pl-PL")}</>;
}