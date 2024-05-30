"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TCategorySchema, categorySchema } from "@/lib/zodSchema";
import { TransactionType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/actions/user/post";
import { toast } from "sonner";
import { Category } from "@prisma/client";
import { useTheme } from "next-themes";

type Props = {
  type: TransactionType;
  closeCategoryDialog?: () => void;
};
const CreateCategoryDialog = ({ type, closeCategoryDialog }: Props) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useForm<TCategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type,
      name: "",
      icon: "",
    },
  });
  const theme = useTheme();

  const categoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async (data) => {
      if (!data.success || !data?.data) {
        return toast.error(data.message, {
          id: "create-category",
        });
      }
      toast.success("Category created successfully", {
        id: "create-category",
      });
      form.reset({ name: "", icon: "", type });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeCategoryDialog && closeCategoryDialog();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        id: "create-category",
      });
    },
  });

  const onSubmit = async (values: TCategorySchema) => {
    if (!values.name || !values.icon)
      return toast.error("Please fill out the required fields");

    toast.loading("Creating category", {
      id: "create-category",
    });
    await categoryMutation.mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
        >
          <PlusSquare className="mr-2 size-4" />
          <span>Create Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Create{" "}
            <span
              className={cn("m-1", {
                "text-emerald-500": type === "income",
                "text-rose-500": type === "expense",
              })}
            >
              {type}
            </span>
            category
          </DialogTitle>
          <DialogDescription>
            Categories are used to group your transactions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your Category Name" />
                  </FormControl>
                  <FormDescription>Category Name (required)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="icon"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="h-[100px] w-full"
                        >
                          {form.watch("icon") ? (
                            <div className="flex flex-col items-center gap-2">
                              <span
                                className="text-2xl sm:text-4xl md:text-5xl"
                                role="img"
                              >
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOff className="size-[48px]" />
                              <p className="text-xs text-muted-foreground">
                                Click to select
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full">
                        <Picker
                          data={data}
                          theme={theme.resolvedTheme}
                          onEmojiSelect={(emoji: { native: string }) => {
                            field.onChange(emoji.native);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    This is how your category would appear in the application
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant={"secondary"}
                  onClick={() =>
                    form.reset({
                      name: "",
                      icon: "",
                    })
                  }
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
