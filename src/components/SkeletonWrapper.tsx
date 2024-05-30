import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
  isLoading: boolean;
  fullWidth?: boolean;
};
const SkeletonWrapper = ({
  className,
  children,
  isLoading,
  fullWidth,
}: Props) => {
  if (!isLoading) return children;

  return (
    <Skeleton
      className={cn("", className, {
        "w-full": fullWidth,
      })}
    >
      <div className="opacity-0">{children}</div>
    </Skeleton>
  );
};

export default SkeletonWrapper;
