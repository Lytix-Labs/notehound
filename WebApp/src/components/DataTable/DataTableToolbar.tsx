"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./DataTableViewOptions";

import { DataTableFacetedFilter } from "./DataTableFaucetedFilter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  metricNames: string[];
  metricMetadataKeysToData: { [key: string]: string[] };
  dataTableFaucetFilters?: React.ReactNode[];
  toFilterKeyToData?: { [key: string]: { title: string; keys: string[] } };
  hideMetricValueFilter?: boolean;
  hideViewOptions?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  metricNames,
  metricMetadataKeysToData,
  dataTableFaucetFilters = [],
  toFilterKeyToData = {},
  hideMetricValueFilter = false,
  hideViewOptions = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        /> */}
        {dataTableFaucetFilters.map((d) => {
          return d;
        })}
        {/* {table.getColumn("userIdentifier") && (
          <DataTableFacetedFilter
            column={table.getColumn("userIdentifier")}
            title="User Identifier"
            options={metricNames.map((name) => ({ label: name, value: name }))}
          />
        )} */}

        {table.getColumn("metricValue") && hideMetricValueFilter === false && (
          <DataTableFacetedFilter
            column={table.getColumn("metricValue")}
            title="Metric Value"
            options={metricNames.map((name) => ({ label: name, value: name }))}
          />
        )}

        {Object.entries(toFilterKeyToData).map(([key, values]) => {
          return (
            <div key={key}>
              {table.getColumn(key) && (
                <DataTableFacetedFilter
                  key={key}
                  column={table.getColumn(key)}
                  title={values.title}
                  options={values.keys.map((value) => ({
                    label: value,
                    value: `${value}`,
                  }))}
                />
              )}
            </div>
          );
        })}
        {Object.entries(metricMetadataKeysToData).map(([key, values]) => {
          return (
            <div key={key}>
              {table.getColumn(key) && (
                <DataTableFacetedFilter
                  key={key}
                  column={table.getColumn(key)}
                  title={key}
                  options={values.map((value) => ({
                    label: value,
                    value: `${value}`,
                  }))}
                />
              )}
            </div>
          );
        })}
        {/* {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {!hideViewOptions && <DataTableViewOptions table={table} />}
    </div>
  );
}
