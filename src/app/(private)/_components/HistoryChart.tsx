"use client";

import { getHistoryData } from "@/actions/user/get";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import useHistory from "@/hooks/useHistory";
import { formatter } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import CountUp from "react-countup";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  userSettings: UserSettings;
};

const HistoryChart = ({ userSettings }: Props) => {
  const { timeFrame, period } = useHistory();
  const { data: historyData, isLoading } = useQuery({
    enabled: !!timeFrame && !!period,
    queryKey: ["overview", "history", timeFrame, period],
    queryFn: async () =>
      await getHistoryData({
        timeFrame,
        month: period.month,
        year: period.year,
      }),
  });

  const formattingCB = useMemo(() => {
    return formatter(userSettings.currency);
  }, [userSettings]);

  const history = historyData?.data;

  return (
    <SkeletonWrapper isLoading={isLoading}>
      {!!history && history.length > 0 ? (
        <ResponsiveContainer
          width={"100%"}
          height={300}
          className="w-full h-full"
        >
          <BarChart className="w-full h-full" data={history} barCategoryGap={5}>
            <defs>
              <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#10b981" stopOpacity={1} />
                <stop offset="1" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ef4444" stopOpacity={1} />
                <stop offset="1" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="5 5"
              strokeOpacity={"0.2"}
              vertical={false}
            />

            <XAxis
              dataKey={(data) => {
                const { year, month, day } = data;
                const date = new Date(year, month, day || 1);
                if (timeFrame === "year") {
                  return date.toLocaleDateString("default", {
                    month: "short",
                  });
                }

                return date.toLocaleDateString("default", {
                  day: "2-digit",
                });
              }}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 5, right: 5 }}
            />

            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <Bar
              dataKey={"income"}
              label="Income"
              fill="url(#incomeBar)"
              radius={4}
              className="cursor-pointer"
            />
            <Bar
              dataKey={"expense"}
              label="Expense"
              fill="url(#expenseBar)"
              radius={4}
              className="cursor-pointer"
            />

            <Tooltip
              cursor={{ opacity: 0.1 }}
              content={(props) => (
                <CustomToolTip formattingCB={formattingCB} {...props} />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
          No data for the selected period
          <p className="text-sm text-muted-foreground">
            Try selecting a different period or add a new transaction
          </p>
        </Card>
      )}
    </SkeletonWrapper>
  );
};

export default HistoryChart;

const CustomToolTip = ({ active, payload, formattingCB }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const { income, expense } = payload[0].payload;

  return (
    <div className="bg-background p-4 min-w-[300px] rounded border">
      <ToolTipRow
        formattingCB={formattingCB}
        label="Expense"
        value={expense}
        bgColor="bg-rose-500"
        textColor="text-rose-500"
      />
      <ToolTipRow
        formattingCB={formattingCB}
        label="Income"
        value={income}
        bgColor="bg-emerald-500"
        textColor="text-emerald-500"
      />
      <ToolTipRow
        formattingCB={formattingCB}
        label="Balance"
        value={income - expense}
        bgColor="bg-gray-100"
        textColor="text-foreground"
      />
    </div>
  );
};

type ToolTipRowProps = {
  label: string;
  formattingCB: Intl.NumberFormat;
  value: number;
  bgColor: string;
  textColor: string;
};

const ToolTipRow = ({
  label,
  formattingCB,
  value,
  bgColor,
  textColor,
}: ToolTipRowProps) => {
  const formattingFn = useCallback(
    (value: number) => {
      return formattingCB.format(value);
    },
    [formattingCB]
  );

  return (
    <div className="flex items-center gap-2">
      <div className={cn("size-4 rounded-full bg-rose-500", bgColor)} />
      <div className="flex w-full justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn(`text-sm font-bold`, textColor)}>
          <CountUp
            preserveValue
            decimals={0}
            formattingFn={formattingFn}
            end={value}
            duration={0.5}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};
