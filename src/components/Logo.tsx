import { cn } from "@/lib/utils";
import { PiggyBank } from "lucide-react";
import Link from "next/link";

type Props = {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
};

const LogoComponent = ({ className, textClassName, iconClassName }: Props) => {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-1 md:gap-2", className)}
    >
      <PiggyBank
        className={cn(
          "stroke size-7 sm:size-9 md:size-11 stroke-emerald-500 stroke-[1.5]",
          iconClassName
        )}
      />
      <p
        className={cn(
          "bg-gradient-to-r from-emerald-500 to-rose-500 bg-clip-text text-transparent text-lg sm:text-xl md:text-3xl font-bold leading-tight tracking-tighter ",
          textClassName
        )}
      >
        BudgetTracker
      </p>
    </Link>
  );
};

export default LogoComponent;
