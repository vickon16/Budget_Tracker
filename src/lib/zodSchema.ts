import * as z from "zod";
import { MAX_DATE_RANGE_DAYS, currencies } from "./constants";
import { differenceInDays } from "date-fns";

export const userSettingsSchema = z.object({
  userId: z.string(),
  currency: z.custom((value) => {
    const found = currencies.some((c) => c.value === value);
    if (!found) throw new Error(`Invalid currency ${value}`);
    return value;
  }),
});

export type TUserSettingSchema = z.infer<typeof userSettingsSchema>;

export const transactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.enum(["income", "expense"]),
});

export type TTransactionSchema = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().min(3).max(20),
  icon: z.string().max(20),
  type: z.enum(["income", "expense"]),
});

export type TCategorySchema = z.infer<typeof categorySchema>;

export const overviewSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((args) => {
    const days = differenceInDays(args.to, args.from);
    const isValidRange = days >= 0 && days <= MAX_DATE_RANGE_DAYS;
    if (!isValidRange) throw new Error(`Invalid date range`);
    return isValidRange;
  });

export type TOverviewSchema = z.infer<typeof overviewSchema>;

export const historyDataSchema = z.object({
  timeFrame: z.enum(["year", "month"]),
  month: z.coerce.number().min(0).max(11).default(0),
  year: z.coerce.number().min(2000).max(3000),
});

export type THistoryDataSchema = z.infer<typeof historyDataSchema>;
