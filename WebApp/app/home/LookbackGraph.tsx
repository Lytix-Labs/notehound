import ShadCNLineGraph, {
  ShadCNLineGraphDataPoint,
} from "@/components/ShadCNLineGraph/ShadCNLineGraph";
import { Card } from "@/components/ui/card";
import HttpClientInstance from "@/httpClient/HttpClient";
import dayjs from "dayjs";

const LookbackGraph = () => {
  return (
    <div className="w-full px-2">
      <Card className="my-1  p-1 mx-1">
        <div className="w-full">
          <ShadCNLineGraph
            title={"Past Week"}
            subHeader="Data on your summaries"
            generateData={async (
              startTime: dayjs.Dayjs,
              endTime: dayjs.Dayjs | "now"
            ): Promise<{
              chartData: ShadCNLineGraphDataPoint[];
              allKeys: string[];
            }> => {
              const data = await HttpClientInstance.getMeetingData();
              const meetingsOver7Days = data["meetingsOver7Days"];
              const chartData: ShadCNLineGraphDataPoint[] = [];
              for (const meeting of meetingsOver7Days) {
                chartData.push({
                  "Number of summaries": meeting["Number of meetings"],
                  date: dayjs(meeting["date"]).unix(),
                });
                // console.log(`chartData:`, chartData);
              }
              return {
                chartData: chartData,
                allKeys: ["Number of summaries"],
              };
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default LookbackGraph;
