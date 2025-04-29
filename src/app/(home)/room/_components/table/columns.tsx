/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leave-balance/table/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LeaveBalanceModel } from "@/lib/schemas/leave-balance";
import { DataTableColumnHeader } from "@/components/leave-balance/table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<LeaveBalanceModel>[] = [
  {
    accessorKey: "leaveType.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại nghỉ phép" />
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng số ngày" />
    ),
  },
  {
    accessorKey: "used",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đã sử dụng" />
    ),
  },
  {
    accessorKey: "remaining",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Còn lại" />
    ),
  },
  {
    accessorKey: "carried",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chuyển tiếp" />
    ),
  },
  {
    accessorKey: "accrued",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tích lũy" />
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const balance = row.original;
      const handleEdit = (table.options.meta as any).handleEdit;
      const handleDelete = (table.options.meta as any).handleDelete;
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(balance)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(balance.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
