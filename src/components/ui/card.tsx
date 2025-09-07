import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const Card: React.FC<CardProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm ring-1 ring-black/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-5 border-b border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <h3
    className={`text-base font-semibold leading-6 text-gray-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);
