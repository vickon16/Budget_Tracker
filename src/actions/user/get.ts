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
    by: ["type", "category", "categoryIcon"],
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

export const getHistoryPeriods = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const monthHistory = await prisma.monthHistory.findMany({
    where: { userId: user.id },
    select: { year: true },
    distinct: ["year"], // often used in combination to select in find many queries
    orderBy: { year: "asc" },
  });

  let results = monthHistory.map((mh) => mh.year);

  if (results.length === 0) {
    results = [new Date().getFullYear()]; // return the currency year
  }

  return {
    success: true,
    data: results,
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

  if (timeFrame === "year") {
    const result = await prisma.yearHistory.groupBy({
      by: ["month"],
      where: { userId: user.id, year },
      _sum: { income: true, expense: true },
      orderBy: { month: "asc" },
    });

    // transform the array to fill in other months
    const history = monthArray.map((i) => {
      const defaultFields = { year, month: i };
      const monthData = result.find((m) => m.month === i);

      if (monthData) {
        return {
          ...defaultFields,
          expense: monthData._sum.expense || 0,
          income: monthData._sum.income || 0,
        };
      }

      return { ...defaultFields, expense: 0, income: 0 };
    });

    return { success: true, data: history };
  }

  if (timeFrame === "month") {
    const result = await prisma.monthHistory.groupBy({
      by: ["day"],
      where: { userId: user.id, year, month },
      _sum: { income: true, expense: true },
      orderBy: { day: "asc" },
    });

    // transform the array to fill in other months
    const daysInMonth = getDaysInMonth(new Date(year, month));

    const history = Array.from({ length: daysInMonth }, (_, i) => i).map(
      (iDay) => {
        const defaultFields = { year, month, day: iDay };
        const dayData = result.find((m) => m.day === iDay);

        if (dayData) {
          return {
            ...defaultFields,
            expense: dayData._sum.expense || 0,
            income: dayData._sum.income || 0,
          };
        }

        return { ...defaultFields, expense: 0, income: 0 };
      }
    );

    return { success: true, data: history };
  }
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
    orderBy: { date: "desc" },
  });

  const mappedTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: formatter(userSettings.currency).format(transaction.amount),
  }));

  return { success: true, data: mappedTransactions };
};
