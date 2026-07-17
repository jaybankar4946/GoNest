import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        bg-white
        border border-slate-100
        shadow-[0_10px_30px_rgba(15,23,42,0.08)]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
