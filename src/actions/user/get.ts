"use server";

import { formatter } from "@/lib/constants";
import prisma from "@/lib/prisma";
import {
  THistoryDataSchema,
  TOverviewSchema,
  historyDataSchema,
  overviewSchema,
  transactionSchema,
} from "@/lib/zodSchema";
import { TransactionType } from "@/types";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export const getUserSettings = async () => {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) redirect("/auth/login");

    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: { currency: "USD", userId: session.user.id },
      });
    }

    return { success: true, data: userSettings };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to get user settings",
    };
  }
};

export const getCategories = async (type?: TransactionType) => {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) redirect("/auth/login");

    let categories;

    if (!type) {
      categories = await prisma.category.findMany({
        where: { userId: session.user.id },
        orderBy: { name: "asc" },
      });
    } else {
      const validator = transactionSchema
        .pick({ type: true })
        .safeParse({ type });
      if (!validator.success)
        return { success: false, message: validator.error.message };

      categories = await prisma.category.findMany({
        where: { userId: session.user.id, type },
        orderBy: { name: "asc" },
      });
    }

    return { success: true, data: categories };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to get categories",
    };
  }
};

export const getBalanceStats = async (statParams: TOverviewSchema) => {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) redirect("/auth/login");

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
        userId: session?.user?.id,
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
  } catch (error) {
    return {
      success: false,
      message: "Failed to get balance statistics",
    };
  }
};

export const getCategoriesStats = async (statParams: TOverviewSchema) => {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) redirect("/auth/login");

    const validator = overviewSchema.safeParse(statParams);
    if (!validator.success)
      return {
        success: false,
        message: validator.error.message,
      };

    const { from, to } = validator.data;

    const grouped = await prisma.category.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        icon: true,
        type: true,
        Transaction: {
          where: { date: { gte: from, lte: to } },
          select: { amount: true },
        },
      },
    });

    // transform: sum transaction amounts per category
    const stats = grouped
      .map((c) => ({
        categoryId: c.id,
        name: c.name,
        icon: c.icon,
        type: c.type,
        totalAmount: c.Transaction.reduce((sum, t) => sum + t?.amount || 0, 0),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to get categories stats",
    };
  }
};

export const getHistoryData = async (historyData: THistoryDataSchema) => {
  try {
    const session = await auth();
    if (!session) redirect("/auth/login");

    const validator = historyDataSchema.safeParse(historyData);
    if (!validator.success)
      return {
        success: false,
        message: validator.error.message,
      };

    const { timeFrame, month, year } = validator.data;

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user?.id },
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
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to get history data",
    };
  }
};

export const getTransactionHistory = async (
  transactionParams: TOverviewSchema
) => {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) redirect("/auth/login");

    const validator = overviewSchema.safeParse(transactionParams);
    if (!validator.success)
      return {
        success: false,
        message: validator.error.message,
      };

    const { from, to } = validator.data;

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings)
      return {
        success: false,
        message: "User settings not found",
      };

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
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
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to get transaction history",
    };
  }
};
