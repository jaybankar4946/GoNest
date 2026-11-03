"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

export function ProjectImage({
  sources,
  alt,
  className = "",
  imageClassName = "",
  fallbackLabel = "Project photo pending",
}: {
  sources: Array<string | null | undefined>;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackLabel?: string;
}) {
  const candidates = Array.from(new Set(sources.filter((value): value is string =>
    typeof value === "string" && /^https:\/\//i.test(value)
  )));
  const signature = candidates.join("|");
  const [failed, setFailed] = useState<string[]>([]);

  useEffect(() => setFailed([]), [signature]);

  const current = candidates.find((source) => !failed.includes(source));

  return (
    <div className={"relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 " + className}>
      {current ? (
        <img
          src={current}
          alt={alt}
          loading="lazy"
          className={imageClassName || "h-full w-full object-cover"}
          onError={() => setFailed((items) => items.includes(current) ? items : [...items, current])}
        />
      ) : (
        <div className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-2 px-4 text-center text-slate-400">
          <Building2 className="h-10 w-10" aria-hidden="true" />
          <span className="text-xs font-semibold">{fallbackLabel}</span>
        </div>
      )}
    </div>
  );
}
