"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  InitialTableState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  metricNames: string[];
  metricMetadataKeysToData: { [key: string]: string[] };
  toFilterKeyToData?: { [key: string]: { title: string; keys: string[] } };
  hoverCursor?: string;
  onClickOverride?: (row: Row<TData>) => void;
  initialState?: InitialTableState;
  dataTableFaucetFilters?: React.ReactNode[];
  hideMetricValueFilter?: boolean;
  hideViewOptions?: boolean;
  onRowSelectedChange?: (rows: Row<TData>[]) => void;
  RenderNestedTable?: (rowId: string) => React.ReactNode;
  extractId?: (row: Row<TData>) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  metricNames,
  metricMetadataKeysToData,
  hoverCursor = "zoom-in",
  onClickOverride,
  initialState,
  dataTableFaucetFilters = [],
  toFilterKeyToData = {},
  hideMetricValueFilter = false,
  hideViewOptions = false,
  onRowSelectedChange,
  RenderNestedTable = undefined,
  extractId = undefined,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  React.useEffect(() => {
    if (initialState?.columnFilters) {
      setColumnFilters(initialState.columnFilters);
    }
  }, [initialState?.columnFilters]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns: [
      ...(RenderNestedTable !== undefined
        ? ([
            {
              header: ({ table }) => {
                return <div className="w-[0px]"></div>;
              },
              id: "dropdown",
              cell: ({ row }) => (
                <div
                  className="flex items-center justify-center"
                  onClick={() => {
                    row.toggleSelected(!row.getIsSelected());
                  }}
                >
                  {row.getIsSelected() === true ? (
                    <ChevronDownIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </div>
              ),
              enableSorting: false,
              enableHiding: false,
            },
          ] as ColumnDef<TData, TValue>[])
        : []),
      ...columns,
    ],
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: initialState,
    enableRowSelection: true,
    onRowSelectionChange: (value) => {
      setRowSelection(value);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4 pb-30">
      <DataTableToolbar
        table={table}
        metricNames={metricNames}
        metricMetadataKeysToData={metricMetadataKeysToData}
        toFilterKeyToData={toFilterKeyToData}
        dataTableFaucetFilters={dataTableFaucetFilters}
        hideMetricValueFilter={hideMetricValueFilter}
        hideViewOptions={hideViewOptions}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      if (onClickOverride) {
                        onClickOverride(row);
                      }
                    }}
                    style={{
                      cursor: hoverCursor,
                      zIndex: 1,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} style={{ zIndex: 10 }}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
