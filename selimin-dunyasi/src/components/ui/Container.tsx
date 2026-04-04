import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
};

export function Container({ className, size = "md", children, ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4", sizeMap[size], className)} {...props}>
      {children}
    </div>
  );
}
