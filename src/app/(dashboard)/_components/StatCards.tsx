"use client";

import { getBalanceStats } from "@/actions/user/get";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { dateToUTCDate, formatter } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TOverviewSchema } from "@/lib/zodSchema";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { LucideIcon, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useCallback } from "react";
import CountUp from "react-countup";
import { toast } from "sonner";

type Props = {
  userSettings: UserSettings;
  dateRange: TOverviewSchema;
};

const StatCards = ({ userSettings, dateRange }: Props) => {
  const statsQuery = useQuery({
    queryKey: ["overview", "stats", dateRange.from, dateRange.to],
    queryFn: async () =>
      await getBalanceStats({
        from: dateToUTCDate(dateRange.from),
        to: dateToUTCDate(dateRange.to),
      }),
  });

  if (statsQuery.data && !statsQuery.data?.success)
    toast.error(statsQuery.data?.message);

  const statsData = statsQuery?.data?.data;
  const income = statsData?.income || 0;
  const expense = statsData?.expense || 0;
  const balance = income - expense;

  return (
    <section className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      <StatCard
        value={income}
        title="Income"
        icon={TrendingUp}
        currency={userSettings.currency}
        isLoading={statsQuery.isFetching}
        iconClassName="text-emerald-500 bg-emerald-400/10"
      />
      <StatCard
        value={expense}
        title="Expense"
        icon={TrendingDown}
        currency={userSettings.currency}
        isLoading={statsQuery.isFetching}
        iconClassName="text-rose-500 bg-rose-400/10"
      />
      <StatCard
        value={balance}
        title="Balance"
        icon={Wallet}
        currency={userSettings.currency}
        isLoading={statsQuery.isFetching}
        iconClassName="text-violet-500 bg-violet-400/10"
      />
    </section>
  );
};

export default StatCards;

type StatCardProps = {
  isLoading: boolean;
  currency: string;
  value: number;
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
};

const StatCard = ({
  value,
  currency,
  title,
  icon: Icon,
  isLoading,
  iconClassName,
}: StatCardProps) => {
  const formattingFn = useCallback(
    (value: number) => {
      return formatter(currency).format(value);
    },
    [currency]
  );

  return (
    <SkeletonWrapper isLoading={isLoading} className="flex-1 w-full">
      <Card className="flex h-24 w-full items-center gap-3 p-4">
        <Icon
          className={cn("size-12 items-center rounded-lg p-2", iconClassName)}
        />
        <div>
          <p className="text-muted-foreground capitalize">{title}</p>
          <CountUp
            preserveValue
            redraw={false}
            end={value}
            formattingFn={formattingFn}
            decimals={2}
            className="text-lg sm:text-xl md:text-2xl font-semibold"
          />
        </div>
      </Card>
    </SkeletonWrapper>
  );
};
