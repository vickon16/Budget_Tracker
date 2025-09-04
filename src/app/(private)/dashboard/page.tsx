import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateTransactionsDialog from "../_components/CreateTransactionsDialog";
import Overview from "../_components/Overview";
import History from "../_components/History";
import { auth } from "@/server/auth";
import { getUserSettings } from "@/actions/user/get";

const DashboardPage = async () => {
  const session = await auth();
  if (!session || !session?.user?.id) redirect("/auth/login");

  const userSettings = await getUserSettings();
  if (!userSettings?.success || !userSettings?.data) redirect("/wizard");

  return (
    <div className="bg-card py-8">
      <div className="container flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <p className="text-lg sm:text-xl md:text-3xl font-bold">
            <span className="font-semibold text-base">Hello,</span>{" "}
            {session.user.name}!
          </p>

          <p className="text-muted-foreground text-sm max-w-prose">
            Our Budget Tracking Application helps you keep track of your various
            income sources, ensuring you have a clear picture of your total
            earnings. It allows you to record and categorize your expenses,
            helping you understand where your money is going.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CreateTransactionsDialog
            trigger={
              <Button
                variant={"outline"}
                className="border-emerald-500 bg-emerald-950 text-white hover:text-white hover:bg-emerald-700"
              >
                New Income
              </Button>
            }
            type="income"
          />
          <CreateTransactionsDialog
            trigger={
              <Button
                variant={"outline"}
                className="border-rose-500 bg-rose-950 text-white hover:text-white hover:bg-rose-700"
              >
                New Expense
              </Button>
            }
            type="expense"
          />
        </div>
      </div>

      <Overview userSettings={userSettings.data} />
      <History userSettings={userSettings.data} />
    </div>
  );
};

export default DashboardPage;
