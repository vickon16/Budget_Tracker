"use client";

import { useCallback, useEffect, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TCurrency, currencies } from "@/lib/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserSettings } from "@/actions/user/get";
import SkeletonWrapper from "./SkeletonWrapper";
import { updateUserCurrency } from "@/actions/user/post";
import { toast } from "sonner";

export function CurrencyComboBox() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedCurrency, setSelectedCurrency] = useState<TCurrency | null>(
    null
  );

  const { data, isFetching } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => await getUserSettings(),
  });

  const mutateCurrency = useMutation({
    mutationFn: updateUserCurrency,
  });

  useEffect(() => {
    if (!data?.data) return;
    setSelectedCurrency(
      currencies.find((currency) => currency.value === data?.data.currency) ||
        null
    );
  }, [data?.data]);

  const selectCurrency = useCallback(
    async (currency: TCurrency | null) => {
      if (!currency) return toast.error("Please select a currency");

      toast.loading("Updating currency...", {
        id: "update-currency",
      });

      await mutateCurrency.mutateAsync(currency.value, {
        onSuccess: (data) => {
          if (!data.success) {
            return toast.error(data.message, {
              id: "update-currency",
            });
          }
          toast.success("Currency Updated Successfully", {
            id: "update-currency",
          });
          setSelectedCurrency(currency);
        },
        onError: (error) => {
          toast.error("Error updating currency", {
            id: "update-currency",
          });
        },
      });
    },
    [mutateCurrency]
  );

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={mutateCurrency.isPending}
            >
              {selectedCurrency ? selectedCurrency.label : "Set currency"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <CurrencyList
              setOpen={setOpen}
              setSelectedCurrency={selectCurrency}
            />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    );
  }

  return (
    <SkeletonWrapper isLoading={isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={mutateCurrency.isPending}
          >
            {selectedCurrency ? selectedCurrency.label : "Set currency"}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <CurrencyList
              setOpen={setOpen}
              setSelectedCurrency={selectCurrency}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

function CurrencyList({
  setOpen,
  setSelectedCurrency,
}: {
  setOpen: (open: boolean) => void;
  setSelectedCurrency: (currency: TCurrency | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter currency..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {currencies.map((currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedCurrency(
                  currencies.find((currency) => currency.value === value) ||
                    null
                );
                setOpen(false);
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
