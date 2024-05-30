"use client";

import { getHistoryPeriods } from "@/actions/user/get";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useHistory from "@/hooks/useHistory";
import { monthArray } from "@/lib/constants";
import { Period, TimeFrame } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

const HistoryPeriodSelector = () => {
  const { timeFrame, setTimeFrame } = useHistory();
  const historyPeriods = useQuery({
    queryKey: ["overview", "history", "periods"],
    queryFn: async () => await getHistoryPeriods(),
  });

  return (
    <section className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
        <Tabs
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          className="select-none"
        >
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>

      <div className="flex flex-wrap items-center gap-2">
        <SkeletonWrapper
          isLoading={historyPeriods.isFetching}
          fullWidth={false}
        >
          <YearSelector years={historyPeriods?.data?.data || []} />
        </SkeletonWrapper>
        {timeFrame === "month" && (
          <SkeletonWrapper
            isLoading={historyPeriods.isFetching}
            fullWidth={false}
          >
            <MonthSelector months={historyPeriods?.data?.data || []} />
          </SkeletonWrapper>
        )}
      </div>
    </section>
  );
};

export default HistoryPeriodSelector;

type YearSelectorProps = {
  years: Awaited<ReturnType<typeof getHistoryPeriods>>["data"] | [];
};

const YearSelector = ({ years }: YearSelectorProps) => {
  const { period, setPeriod } = useHistory();

  return (
    <Select
      value={period.year.toString()}
      onValueChange={(value) =>
        setPeriod({ month: period.month, year: parseInt(value) })
      }
    >
      <SelectTrigger className="w-[180px] select-none">
        <SelectValue placeholder="Year" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type MonthSelectorProps = {
  months: Awaited<ReturnType<typeof getHistoryPeriods>>["data"] | [];
};

const MonthSelector = ({ months }: MonthSelectorProps) => {
  const { period, setPeriod } = useHistory();

  return (
    <Select
      value={period.month.toString()}
      onValueChange={(value) =>
        setPeriod({ month: parseInt(value), year: period.year })
      }
    >
      <SelectTrigger className="w-[180px] select-none">
        <SelectValue placeholder="Month" />
      </SelectTrigger>
      <SelectContent>
        {monthArray.map((month) => {
          const monthString = new Date(period.year, month, 1).toLocaleString(
            "default",
            { month: "long" }
          );

          return (
            <SelectItem key={month} value={month.toString()}>
              {monthString}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
