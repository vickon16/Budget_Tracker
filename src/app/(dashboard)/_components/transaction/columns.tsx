"use client";

import { Transaction } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./ColumnHeader";
import { cn } from "@/lib/utils";
import RowActions from "./RowActions";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-center"
        column={column}
        title="Category"
      />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize justify-center">
        {row.original.categoryIcon}{" "}
        <div className="capitalize">{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-center"
        column={column}
        title="Description"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-center text-xs sm:text-sm truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-center"
        column={column}
        title="Date"
      />
    ),
    cell: ({ row }) => {
      const data = new Date(row.original.date);
      const formattedDate = data.toLocaleDateString("default", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return (
        <div className="capitalize text-muted-foreground text-center">
          {formattedDate}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-center"
        column={column}
        title="Type"
      />
    ),
    cell: ({ row }) => (
      <div
        className={cn("capitalize rounded-lg text-center p-2", {
          "bg-emerald-500/10 text-emerald-500": row.original.type === "income",
          "bg-rose-500/10 text-rose-500": row.original.type === "expense",
        })}
      >
        {row.original.type}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-center"
        column={column}
        title="Amount"
      />
    ),
    cell: ({ row }) => (
      <p className="text-md rounded-lg bg-gray-400/10 p-2 text-center font-medium">
        {row.original.amount}
      </p>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <RowActions transaction={row.original} />,
  },
];
