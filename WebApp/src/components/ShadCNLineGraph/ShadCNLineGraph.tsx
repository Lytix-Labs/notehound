"use client";

import * as React from "react";
import { CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import { Area, AreaChart } from "recharts";
import { RootState } from "../Redux/store";
import LoadingComponent from "./LoadingComponent";
import NoDataComponent from "./NoDataComponent";

export interface ShadCNLineGraphDataPoint {
  date: number; // date in format "YYYY-MM-DD"
  [key: string]: number; // Allow any string key to be a number, but also support the 'date' as a string
}

const ShadCNLineGraph: React.FC<{
  title: string;
  subHeader?: string;
  generateData: (
    startTime: Dayjs,
    endTime: Dayjs | "now"
  ) => Promise<{ chartData: ShadCNLineGraphDataPoint[]; allKeys: string[] }>;
}> = ({ title, subHeader, generateData }) => {
  const [chartData, setChartData] = React.useState<
    undefined | ShadCNLineGraphDataPoint[]
  >(undefined);
  const [allKeys, setAllKeys] = React.useState<string[]>([]);
  const startTime = useSelector(
    (state: RootState) => state.globalTime.startTime
  );
  const endTime = useSelector((state: RootState) => state.globalTime.endTime);
  const refreshData = useSelector(
    (state: RootState) => state.globalTime.refreshData
  );

  React.useEffect(() => {
    Promise.resolve().then(async () => {
      const data = await generateData(startTime, endTime);
      setChartData(data.chartData);
      setAllKeys(data.allKeys);
    });
  }, [startTime, endTime, refreshData, generateData]);

  if (chartData === undefined) {
    return <LoadingComponent title={title} subHeader={subHeader} />;
  }

  if (chartData.length === 0) {
    return <NoDataComponent title={title} subHeader={subHeader} />;
  }

  /**
   * Every entry should have all the keys, just filter out the date
   * key
   */
  //   const allKeys = Object.keys(chartData[0]).filter((key) => key !== "date");

  //   console.log(">>>", allKeys);

  const chartConfig = {};
  allKeys
    .map((key, index) => {
      chartConfig[key] = {
        label: key,
        color: `hsl(var(--chart-${index + 1}))`,
      };
    })
    .flat();

  //   const timeScale = scaleTime()
  //     .domain([
  //       startTime.unix(),
  //       endTime === "now" ? dayjs().unix() : endTime.unix(),
  //     ])
  //     .nice();
  //   console.log(`>>> chartConfig: ${JSON.stringify(chartConfig, null, 2)}`);
  //   const chartConfig = {
  //     visitors: {
  //       label: "Visitors",
  //     },
  //     chart0: {
  //       label: "chart0",
  //       color: "hsl(var(--chart-1))",
  //     },
  //     chart1: {
  //       label: "chart1",
  //       color: "hsl(var(--chart-2))",
  //     },
  //     mobile: {
  //       label: "mobilsse",
  //       color: "hsl(var(--chart-2))",
  //     },
  //   } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          {subHeader && <CardDescription>{subHeader}</CardDescription>}
        </div>
        {/* </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div> */}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              {allKeys.map((key, index) => {
                // console.log(`>>> here: key=${key} index=${index}`);
                return (
                  <linearGradient
                    key={`fill${key}`}
                    id={`fill${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                );
              })}

              {/* <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient> */}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value * 1000);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              //   scale={timeScale}
              //   domain={timeScale.domain().map((date) => date.valueOf())}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    try {
                      const date = payload[0].payload.date;
                      return dayjs(date * 1000)
                        .toDate()
                        .toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                    } catch (err) {
                      return "Date";
                    }
                  }}
                  indicator="dot"
                />
              }
            />
            {allKeys.map((key, index) => {
              return (
                <Area
                  key={key}
                  dataKey={key}
                  type="natural"
                  fill={`url(#fill${key})`}
                  stroke={`var(--color-${key})`}
                  stackId="a"
                />
              );
            })}
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            {/* <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            /> */}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ShadCNLineGraph;
