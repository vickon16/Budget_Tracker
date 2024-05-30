"use client";

import { deleteCategory } from "@/actions/user/post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  trigger: React.ReactNode;
  category: Category;
}

const DeleteCategoryDialog = ({ trigger, category }: Props) => {
  const queryClient = useQueryClient();
  const categoryIdentifier = `${category.name}-${category.type}`;
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async (data) => {
      if (!data.success) {
        return toast.error(data.message, {
          id: categoryIdentifier,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      return toast.success("Category deleted successfully", {
        id: categoryIdentifier,
      });
    },
    onError: () => {
      toast.error("Failed to delete category", {
        id: categoryIdentifier,
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this category?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            category
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              toast.loading("Deleting category...", {
                id: categoryIdentifier,
              });

              await deleteMutation.mutateAsync(category.id);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;
