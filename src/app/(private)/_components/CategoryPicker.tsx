"use client";

import { getCategories } from "@/actions/user/get";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransactionType } from "@/types";
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  type: TransactionType;
  onChange: (category: string) => void;
}

const CategoryPicker = ({ type, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data } = useQuery({
    queryKey: ["categories", type],
    queryFn: async () => await getCategories(type),
    enabled: !!type,
  });

  const categoriesData = data?.data;

  const selectedCategory = useMemo(() => {
    return data?.data?.find((category) => category.name === value);
  }, [data?.data, value]);

  if (data && !data?.success) {
    return <p className="text-destructive">{data?.message}</p>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <span role="img">{selectedCategory.icon}</span>
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            "Select a category"
          )}

          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command onSubmit={(e) => e.preventDefault()}>
          <CommandInput placeholder="Search Category" />
          <CreateCategoryDialog
            type={type}
            closeCategoryDialog={() => setOpen(false)}
          />
          <CommandEmpty>
            <p>Category Not Found</p>
            <p className="text-xs text-muted-foreground">
              Tip : Create a new category
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {categoriesData &&
                categoriesData.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      onChange(category.name);
                      setValue(category.name);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span role="img">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <Check
                      className={cn("ml-auto size-4 opacity-0 ", {
                        "opacity-100": category.name === value,
                      })}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryPicker;
