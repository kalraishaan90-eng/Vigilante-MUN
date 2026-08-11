import React from "react";
import { twMerge } from "tailwind-merge";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({
  as: Component = "section",
  children,
  className,
  id,
  ...props
}) => {
  return (
    <Component
      id={id}
      className={twMerge("w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16", className)}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Section;
