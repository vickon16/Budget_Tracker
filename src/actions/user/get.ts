"use server";

import { formatter, monthArray } from "@/lib/constants";
import prisma from "@/lib/prisma";
import {
  THistoryDataSchema,
  TOverviewSchema,
  historyDataSchema,
  overviewSchema,
  transactionSchema,
} from "@/lib/zodSchema";
import { TransactionType } from "@/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const getUserSettings = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    userSettings = await prisma.userSettings.create({
      data: { currency: "USD", userId: user.id },
    });
  }

  revalidatePath("/");
  return { success: true, data: userSettings };
};

export const getCategories = async (type?: TransactionType) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let categories;

  if (!type) {
    categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });
  } else {
    const validator = transactionSchema
      .pick({ type: true })
      .safeParse({ type });
    if (!validator.success)
      return { success: false, message: validator.error.message };

    categories = await prisma.category.findMany({
      where: { userId: user.id, type },
      orderBy: { name: "asc" },
    });
  }

  revalidatePath("/manage");
  return { success: true, data: categories };
};

export const getBalanceStats = async (statParams: TOverviewSchema) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const validator = overviewSchema.safeParse(statParams);
  if (!validator.success)
    return {
      success: false,
      message: validator.error.message,
    };

  const { from, to } = validator.data;

  const total = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId: user.id,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: { amount: true },
  });

  const incomeStatType =
    total.find((t) => t.type === "income")?._sum.amount || 0;
  const expenseStatType =
    total.find((t) => t.type === "expense")?._sum.amount || 0;

  return {
    success: true,
    data: { income: incomeStatType, expense: expenseStatType },
  };
};

export const getCategoriesStats = async (statParams: TOverviewSchema) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const validator = overviewSchema.safeParse(statParams);
  if (!validator.success)
    return {
      success: false,
      message: validator.error.message,
    };

  const { from, to } = validator.data;

  const stats = await prisma.transaction.groupBy({
    by: ["type", "categoryId"],
    where: {
      userId: user.id,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  return {
    success: true,
    data: stats,
  };
};

export const getHistoryData = async (historyData: THistoryDataSchema) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const validator = historyDataSchema.safeParse(historyData);
  if (!validator.success)
    return {
      success: false,
      message: validator.error.message,
    };

  const { timeFrame, month, year } = validator.data;

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
  });

  // Group transactions based on the timeFrame (year or month)
  const historyMap = new Map<
    string,
    {
      expense: number;
      income: number;
      year: number;
      month: number;
      day: number;
    }
  >();

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    const transactionYear = transactionDate.getFullYear();
    const transactionMonth = transactionDate.getMonth();

    // Skip transactions that don't match the filter criteria
    if (timeFrame === "year" && transactionYear !== year) return;
    if (
      timeFrame === "month" &&
      (transactionYear !== year || transactionMonth !== month)
    )
      return;

    let key: string;

    if (timeFrame === "year") {
      // For year timeframe, group by month
      key = `${transactionYear}-${transactionMonth}`;

      if (!historyMap.has(key)) {
        historyMap.set(key, {
          expense: 0,
          income: 0,
          year: transactionYear,
          month: transactionMonth,
          day: 1,
        });
      }
    } else {
      // For month timeframe, group by day (we'll still use month-day as key)
      const day = transactionDate.getDate();
      key = `${transactionYear}-${transactionMonth}-${day}`;

      if (!historyMap.has(key)) {
        historyMap.set(key, {
          expense: 0,
          income: 0,
          year: transactionYear,
          month: transactionMonth,
          day: day,
        });
      }
    }

    const entry = historyMap.get(key)!;

    // Sum up the transaction amount based on type
    if (transaction.type === "expense") {
      entry.expense += transaction.amount;
    } else if (transaction.type === "income") {
      entry.income += transaction.amount;
    }
  });

  // Convert the map values to an array for the response
  const history = Array.from(historyMap.values());

  return {
    success: true,
    data: history || [],
  };
};

export const getTransactionHistory = async (
  transactionParams: TOverviewSchema
) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const validator = overviewSchema.safeParse(transactionParams);
  if (!validator.success)
    return {
      success: false,
      message: validator.error.message,
    };

  const { from, to } = validator.data;

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings)
    return {
      success: false,
      message: "User settings not found",
    };

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: from,
        lte: to,
      },
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const mappedTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: formatter(userSettings.currency).format(transaction.amount),
  }));

  return { success: true, data: mappedTransactions };
};
