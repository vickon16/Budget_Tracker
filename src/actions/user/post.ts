"use server";

import prisma from "@/lib/prisma";
import {
  TCategorySchema,
  TTransactionSchema,
  categorySchema,
  transactionSchema,
  userSettingsSchema,
} from "@/lib/zodSchema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const updateUserCurrency = async (currency: string) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const parsedBody = userSettingsSchema
    .pick({ currency: true })
    .safeParse({ currency });
  if (!parsedBody.success) {
    return {
      success: false,
      message: parsedBody.error.message,
    };
  }

  const userSettings = await prisma.userSettings.update({
    where: { userId: user.id },
    data: { currency },
  });

  revalidatePath("/manage");

  return {
    success: true,
    data: userSettings,
  };
};

export const createCategory = async (categoryData: TCategorySchema) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const parsedBody = categorySchema.safeParse(categoryData);
  if (!parsedBody.success) {
    return {
      success: false,
      message: parsedBody.error.message,
    };
  }

  const category = await prisma.category.create({
    data: { ...parsedBody.data, userId: user.id },
  });

  revalidatePath("/manage");

  return {
    success: true,
    data: category,
  };
};

export const createTransaction = async (
  transactionData: TTransactionSchema
) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const parsedBody = transactionSchema.safeParse(transactionData);
  if (!parsedBody.success) {
    return {
      success: false,
      message: parsedBody.error.message,
    };
  }

  const { amount, category, date, type, description } = parsedBody.data;
  const categoryRow = await prisma.category.findFirst({
    where: { userId: user.id, name: category },
  });

  if (!categoryRow) return { success: false, message: "Category not found" };

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      date,
      type,
      description: description || "",
      userId: user.id,
      category: categoryRow.name,
      categoryIcon: categoryRow.icon,
    },
  });

  await prisma.$transaction([
    // update month aggregate table
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(), // function that recreates the date without the timezone
          month: date.getUTCMonth(), // function that recreates the date without the timezone
          year: date.getUTCFullYear(), // function that recreates the date without the timezone
        },
      },
      create: {
        userId: user.id,
        transactionId: transaction.id,
        day: date.getUTCDate(), // function that recreates the date without the timezone
        month: date.getUTCMonth(), // function that recreates the date without the timezone
        year: date.getUTCFullYear(), // function that recreates the date without the timezone
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),

    // update year aggregate table
    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(), // function that recreates the date without the timezone
          year: date.getUTCFullYear(), // function that recreates the date without the timezone
        },
      },
      create: {
        userId: user.id,
        transactionId: transaction.id,
        month: date.getUTCMonth(), // function that recreates the date without the timezone
        year: date.getUTCFullYear(), // function that recreates the date without the timezone
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),
  ]);

  return {
    success: true,
  };
};

export const deleteCategory = async (categoryId: string) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const category = await prisma.category.findFirst({
    where: { userId: user.id, id: categoryId },
  });

  if (!category) return { success: false, message: "Category not found" };

  await prisma.category.delete({
    where: { id: category.id, userId: user.id },
  });

  revalidatePath("/manage");

  return {
    success: true,
  };
};

export const deleteTransaction = async (transactionId: string) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const transaction = await prisma.transaction.findFirst({
    where: { userId: user.id, id: transactionId },
  });

  if (!transaction) return { success: false, message: "Transaction not found" };

  await prisma.$transaction([
    prisma.transaction.delete({
      where: { id: transaction.id, userId: user.id },
    }),
    // update month history
    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),

    // update year history
    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ]);

  revalidatePath("/transactions");

  return {
    success: true,
  };
};
