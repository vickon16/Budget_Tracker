"use client";

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
import { TimeFrame } from "@/types";
import { useMemo } from "react";

const HistoryPeriodSelector = () => {
  const { timeFrame, setTimeFrame } = useHistory();

  return (
    <section className="flex flex-col sm:flex-row sm:items-center gap-4">
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

      <div className="flex items-center gap-2">
        <YearSelector />
        {timeFrame === "month" && <MonthSelector />}
      </div>
    </section>
  );
};

export default HistoryPeriodSelector;

const YearSelector = () => {
  const { period, setPeriod } = useHistory();

  const years = useMemo(() => {
    const years = Array.from(
      { length: new Date().getFullYear() - 2000 + 1 },
      (_, i) => 2000 + i
    );
    return years.reverse();
  }, []);

  return (
    <Select
      value={period.year.toString()}
      onValueChange={(value) =>
        setPeriod({ month: period.month, year: parseInt(value) })
      }
    >
      <SelectTrigger className="max-w-[180px] select-none">
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

const MonthSelector = () => {
  const { period, setPeriod } = useHistory();

  return (
    <Select
      value={period.month.toString()}
      onValueChange={(value) =>
        setPeriod({ month: parseInt(value), year: period.year })
      }
    >
      <SelectTrigger className="max-w-[180px] select-none">
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
