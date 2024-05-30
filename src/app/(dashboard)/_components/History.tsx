import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Period, TimeFrame } from "@/types";
import { UserSettings } from "@prisma/client";
import { useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import { getHistoryData } from "@/actions/user/get";
import HistoryChart from "./HistoryChart";

type Props = {
  userSettings: UserSettings;
};

const History = ({ userSettings }: Props) => {
  return (
    <section className="container">
      <h2 className="mt-8 text-lg sm:text-xl lg:text-3xl font-bold">History</h2>

      <Card className="w-full mt-2">
        <CardHeader className="gap-2">
          <CardTitle className="flex flex-col justify-between gap-2 md:flex-row">
            <HistoryPeriodSelector />

            <div className="flex h-10 gap-2">
              <Badge
                variant={"outline"}
                className="flex items-center gap-2 text-sm"
              >
                <div className="size-4 rounded-full bg-emerald-500" />
                Income
              </Badge>
              <Badge
                variant={"outline"}
                className="flex items-center gap-2 text-sm"
              >
                <div className="size-4 rounded-full bg-rose-500" />
                Expense
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <HistoryChart userSettings={userSettings} />
        </CardContent>
      </Card>
    </section>
  );
};

export default History;
