import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    const variantClass =
      variant === "primary"
        ? "bg-black text-white"
        : variant === "secondary"
          ? "bg-zinc-100 text-zinc-900"
          : "bg-transparent text-zinc-700";

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${variantClass} ${className}`}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ${className}`} {...props} />
);
