"use server";

import prisma from "@/lib/prisma";
import {
  TCategorySchema,
  TTransactionSchema,
  categorySchema,
  transactionSchema,
  userSettingsSchema,
} from "@/lib/zodSchema";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createTransaction = async (
  transactionData: TTransactionSchema
) => {
  const session = await auth();
  if (!session || !session?.user?.id) redirect("/auth/login");

  const parsedBody = transactionSchema.safeParse(transactionData);
  if (!parsedBody.success) {
    return {
      success: false,
      message: parsedBody.error.message,
    };
  }

  const { amount, category, date, type, description } = parsedBody.data;
  const categoryRow = await prisma.category.findFirst({
    where: { userId: session.user.id, name: category },
  });

  if (!categoryRow) return { success: false, message: "Category not found" };

  console.log({ categoryRow, user: session.user.id });

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      date,
      type,
      description: description || "",
      userId: session.user.id,
      categoryId: categoryRow.id,
    },
  });

  return {
    success: true,
    transaction,
  };
};

export const updateUserCurrency = async (currency: string) => {
  const session = await auth();
  if (!session || !session?.user?.id) redirect("/auth/login");

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
    where: { userId: session.user.id },
    data: { currency },
  });

  revalidatePath("/dashboard/manage");

  return {
    success: true,
    data: userSettings,
  };
};

export const createCategory = async (categoryData: TCategorySchema) => {
  const session = await auth();
  if (!session || !session?.user?.id) redirect("/auth/login");

  const parsedBody = categorySchema.safeParse(categoryData);
  if (!parsedBody.success) {
    return {
      success: false,
      message: parsedBody.error.message,
    };
  }

  const category = await prisma.category.create({
    data: { ...parsedBody.data, userId: session.user.id },
  });

  revalidatePath("/dashboard/manage");

  return {
    success: true,
    data: category,
  };
};

export const deleteCategory = async (categoryId: string) => {
  const session = await auth();
  if (!session || !session?.user?.id) redirect("/auth/login");

  const category = await prisma.category.findFirst({
    where: { userId: session.user.id, id: categoryId },
  });

  if (!category) return { success: false, message: "Category not found" };

  await prisma.category.delete({
    where: { id: category.id, userId: session.user.id },
  });

  revalidatePath("/dashboard/manage");

  return {
    success: true,
  };
};

export const deleteTransaction = async (transactionId: string) => {
  const session = await auth();
  if (!session || !session?.user?.id) redirect("/auth/login");

  const transaction = await prisma.transaction.findFirst({
    where: { userId: session.user.id, id: transactionId },
  });

  if (!transaction) return { success: false, message: "Transaction not found" };

  await prisma.transaction.delete({
    where: { id: transaction.id, userId: session.user.id },
  });

  revalidatePath("/dashboard/transactions");

  return {
    success: true,
  };
};
