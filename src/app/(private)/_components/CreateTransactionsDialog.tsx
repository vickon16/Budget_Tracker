"use client";

import { createTransaction } from "@/actions/user/post";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TTransactionSchema, transactionSchema } from "@/lib/zodSchema";
import { TransactionType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CategoryPicker from "./CategoryPicker";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

const defaultValues = {
  date: new Date(),
  description: "",
  amount: 0,
  category: undefined,
};

const CreateTransactionsDialog = ({ trigger, type }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<TTransactionSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { ...defaultValues, type },
  });

  const transactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: async (data) => {
      if (!data?.success) {
        return toast.error(data?.message, {
          id: "create-transaction",
        });
      }
      setOpen(false);
      toast.success("Transaction created successfully", {
        id: "create-transaction",
      });

      form.reset({ ...defaultValues, type });
      await queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (error) => {
      toast.error("Transaction creation failed", {
        id: "create-transaction",
      });
    },
  });

  const onSubmit = async (values: TTransactionSchema) => {
    toast.loading("Creating Transaction", {
      id: "create-transaction",
    });

    await transactionMutation.mutateAsync({
      ...values,
      date: values.date,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} key={type}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent key={type}>
        <DialogHeader>
          <DialogTitle>
            Create a new{" "}
            <span
              className={cn("mt-1", {
                "text-emerald-500": type === "income",
                "text-rose-500": type === "expense",
              })}
            >
              {type}
            </span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="amount"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="Your Description"
                    />
                  </FormControl>
                  <FormDescription>
                    Transaction amount (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your Amount" />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3 flex flex-col">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CategoryPicker type={type} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      Select a category for this transaction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <FormField
                name="date"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3 flex flex-col">
                    <FormLabel>Transaction Date</FormLabel>

                    <Popover modal={false}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select A date for this transaction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full !mt-8"
              disabled={transactionMutation.isPending}
            >
              Create {type === "income" ? "Income" : "Expense"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionsDialog;
