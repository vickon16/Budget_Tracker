"use client";

import { getCategoriesStats } from "@/actions/user/get";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatter } from "@/lib/constants";
import { TOverviewSchema } from "@/lib/zodSchema";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = {
  userSettings: UserSettings;
  dateRange: TOverviewSchema;
};

const CategoriesStats = ({ userSettings, dateRange }: Props) => {
  const statsQuery = useQuery({
    queryKey: ["overview", "stats", "categories", dateRange.from, dateRange.to],
    queryFn: async () => await getCategoriesStats(dateRange),
  });

  if (statsQuery.data && !statsQuery.data?.success)
    toast.error(statsQuery.data?.message);

  return (
    <section className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <CategoriesCard
        isLoading={statsQuery.isFetching}
        currency={userSettings.currency}
        type="income"
        data={statsQuery.data?.data || []}
      />
      <CategoriesCard
        isLoading={statsQuery.isFetching}
        currency={userSettings.currency}
        type="expense"
        data={statsQuery.data?.data || []}
      />
    </section>
  );
};

export default CategoriesStats;

type CategoriesCardProps = {
  currency: string;
  type: "income" | "expense";
  data: Awaited<ReturnType<typeof getCategoriesStats>>["data"] | [];
  isLoading: boolean;
};

const CategoriesCard = ({
  type,
  data,
  currency,
  isLoading,
}: CategoriesCardProps) => {
  const filteredData = data?.filter((item) => item.type === type);
  const total =
    filteredData?.reduce((acc, item) => (acc += item?._sum?.amount || 0), 0) ||
    0;

  return (
    <SkeletonWrapper isLoading={isLoading} className="flex-1 w-full">
      <Card className="h-80 w-full">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-base md:text-lg">
            {type === "income" ? "Incomes" : "Expenses"} Category
          </CardTitle>

          <div className="flex items-center justify-between gap-2">
            {filteredData?.length === 0 ? (
              <div className="flex h-60 w-full flex-col items-center justify-center">
                No Data for the selected period
                <p className="text-sm text-muted-foreground">
                  Try selecting a different period or try adding new{" "}
                  {type === "income" ? "incomes" : "expenses"}
                </p>
              </div>
            ) : (
              <ScrollArea className="w-full h-60">
                <div className="w-full flex flex-col gap-4 py-4 px-2">
                  {filteredData?.map((item) => {
                    const amount = item?._sum.amount || 0;
                    const percentage = (amount / total) * 100;

                    return (
                      <div key={item.category} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-gray-400">
                            {item.categoryIcon} {item.category}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {percentage.toFixed(0)}%
                            </span>
                          </span>

                          <span className="text-sm text-gray-400">
                            {formatter(currency).format(amount)}
                          </span>
                        </div>

                        <Progress
                          value={percentage}
                          animated
                          className="h-2"
                          indicator={
                            type === "income" ? "bg-emerald-500" : "bg-rose-500"
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardHeader>
      </Card>
    </SkeletonWrapper>
  );
};
