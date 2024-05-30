import { getCategories } from "@/actions/user/get";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/types";
import { Trash, TrendingDown, TrendingUp } from "lucide-react";
import CreateCategoryDialog from "./CreateCategoryDialog";
import DeleteCategoryDialog from "./DeleteCategoryDialog";

type CategoryListProps = {
  type: TransactionType;
};

const CategoryList = async ({ type }: CategoryListProps) => {
  const data = await getCategories(type);

  if (!data.data || !data.success) {
    return <NoCategory type={type} />;
  }

  const categoriesData = data.data;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-between flex-wrap md:flex-nowrap gap-3 text-lg">
          <div className="flex items-center gap-3">
            {type === "expense" ? (
              <TrendingDown className="size-8 flex items-center rounded-lg bg-rose-400/10 text-rose-500" />
            ) : (
              <TrendingUp className="size-8 flex items-center rounded-lg bg-emerald-400/10 text-emerald-500" />
            )}
            <div className="space-y-1">
              <div>{type === "expense" ? "Expenses" : "Income"} categories</div>
              <div className="text-sm text-muted-foreground">
                Sorted by name
              </div>
            </div>
          </div>

          <CreateCategoryDialog type={type} />
        </CardTitle>
      </CardHeader>
      <Separator />

      <CardContent className="p-4">
        {categoriesData && categoriesData.length > 0 ? (
          <div className="grid gap-2 justify-center grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
            {categoriesData.map((category) => (
              <div
                key={category.id}
                className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1] w-full"
              >
                <div className="flex flex-col items-center gap-2 p-4">
                  <span className="text-lg sm:text-xl md:text-3xl" role="img">
                    {category.icon}
                  </span>
                  <span>{category.name}</span>
                </div>

                <DeleteCategoryDialog
                  category={category}
                  trigger={
                    <Button
                      className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-rose-500/20"
                      variant={"secondary"}
                    >
                      <Trash className="size-4" />
                      Remove
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <NoCategory type={type} />
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryList;

const NoCategory = ({ type }: { type: TransactionType }) => {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center">
      <p>
        No{" "}
        <span
          className={cn(
            "m-1",
            type === "income" ? "text-emerald-500" : "text-rose-500"
          )}
        >
          {type}
        </span>{" "}
        categories yet
      </p>
      <p className="text-sm text-muted-foreground">Create one to get started</p>
    </div>
  );
};
