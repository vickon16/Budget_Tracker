"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { TOverviewSchema } from "@/lib/zodSchema";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import TransactionTable from "../_components/transaction/TransactionTable";

const TransactionsPage = () => {
  const [dateRange, setDateRange] = useState<TOverviewSchema>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <>
      <section className="bg-card">
        <div
          className="container flex flex-wrap items-center justify-between gap-6 py-8
    "
        >
          <p className="text-lg sm:text-xl md:text-3xl font-bold">
            Transactions History
          </p>
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
      </section>

      <section className="container">
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </section>
    </>
  );
};

export default TransactionsPage;
