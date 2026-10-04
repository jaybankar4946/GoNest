import React from "react";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        mx-auto
        w-full
        max-w-[1280px]
        px-5
        md:px-8
        lg:px-10
        ${className}
      `}
    >
      {children}
    </div>
  );
}
