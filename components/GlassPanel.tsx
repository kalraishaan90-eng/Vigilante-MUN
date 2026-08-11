import React from "react";
import { twMerge } from "tailwind-merge";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        "glass-panel rounded-card p-6 md:p-8 transition-all duration-300 ease-vigilante",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
