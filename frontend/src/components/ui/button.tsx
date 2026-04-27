"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

const baseClassName =
  "inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-md px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5e89]/30";

const primaryClassName =
  "border border-[#063655] bg-[#0b5e89] text-white hover:bg-[#063655]";

const inverseClassName =
  "border border-[#052b46] bg-[#052b46] text-white hover:bg-[#063655]";

const secondaryClassName =
  "border border-[#d9d6cd] bg-white text-[#303833] hover:bg-[#f1f0eb]";

const variantClassNames = {
  primary: primaryClassName,
  inverse: inverseClassName,
  secondary: secondaryClassName,
} as const;

export type ButtonVariant = keyof typeof variantClassNames;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className = "", variant = "primary", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClassName} ${variantClassNames[variant]} ${className}`.trim()}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
