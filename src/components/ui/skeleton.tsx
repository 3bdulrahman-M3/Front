import * as React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  );
};
