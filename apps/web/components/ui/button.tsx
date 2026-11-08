import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet" | "danger";
  children: ReactNode;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`button button-${variant} ${className}`} {...props} />;
}
