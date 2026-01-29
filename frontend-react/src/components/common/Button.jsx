import { twMerge } from "tailwind-merge";

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}) {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50";

  const variants = {
    primary: "bg-primary text-white hover:opacity-90",
    secondary:
      "bg-surface-light text-text-main border border-border-light hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={twMerge(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
