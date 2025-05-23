"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DataTableViewOptions } from "./view-options";
import { useState } from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter room..."
          value={value}
          onChange={(event) =>
          {
            setValue(event.target.value);
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          }
          className="h-8 w-[250px] lg:w-[350px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              setValue("");
              table.resetColumnFilters()}}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
