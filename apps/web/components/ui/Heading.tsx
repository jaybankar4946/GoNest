export function Heading({
  children,
  size = "lg",
}: {
  children: React.ReactNode;
  size?: "lg" | "md" | "sm";
}) {

const sizes={
lg:"text-4xl md:text-5xl font-semibold tracking-tight",
md:"text-3xl font-semibold",
sm:"text-xl font-semibold"
};

return (
<h2 className={sizes[size]}>
{children}
</h2>
);

}
