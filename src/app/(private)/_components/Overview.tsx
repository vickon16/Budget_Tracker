"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { TOverviewSchema } from "@/lib/zodSchema";
import { UserSettings } from "@prisma/client";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import CategoriesStats from "./CategoriesStats";
import StatCards from "./StatCards";

type Props = {
  userSettings: UserSettings;
};

const Overview = ({ userSettings }: Props) => {
  const [dateRange, setDateRange] = useState<TOverviewSchema>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <section className="container space-y-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg sm:text-xl lg:text-3xl font-bold">Overview</h2>

        <div className="flex items-center gap-3">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values) => {
              const { from, to } = values.range;
              // We update the date range only if both date are set

              if (!from || !to) return;
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                return toast.error(
                  "The Selected Date Range is too large. Max date range allowed in days rand is " +
                    MAX_DATE_RANGE_DAYS
                );
              }

              setDateRange({ from, to });
            }}
          />
        </div>
      </div>

      <StatCards userSettings={userSettings} dateRange={dateRange} />

      <CategoriesStats userSettings={userSettings} dateRange={dateRange} />
    </section>
  );
};

export default Overview;
