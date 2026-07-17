import React from "react";

export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`
        py-12
        md:py-16
        lg:py-20
        ${className}
      `}
    >
      {children}
    </section>
  );
}
