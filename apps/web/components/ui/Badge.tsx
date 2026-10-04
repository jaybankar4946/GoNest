type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning";
};

export default function Badge({
  children,
  variant = "primary",
}: BadgeProps) {
  const styles = {
    primary: "bg-blue-50 text-blue-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-orange-50 text-orange-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${styles[variant]}
      `}
    >
      {children}
    </span>
  );
}
