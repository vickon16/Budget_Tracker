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
      categoryId: categoryRow.id,
    },
  });

  return {
    success: true,
    transaction,
  };
};

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

  await prisma.transaction.delete({
    where: { id: transaction.id, userId: user.id },
  });

  revalidatePath("/transactions");

  return {
    success: true,
  };
};
