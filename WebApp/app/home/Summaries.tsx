import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import dayjs from "dayjs";
import router from "next/router";
import { IoRecordingSharp } from "react-icons/io5";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const Summaries: React.FC<{
  recordingData:
    | {
        id: string;
        name: string;
        date: Date;
        processing: boolean;
      }[]
    | [];
}> = ({ recordingData }) => {
  return (
    <div className="w-full px-3 my-1 ">
      <Card>
        <div className="flex items-center justify-center gap-2 p-2">
          <IoRecordingSharp size={20} />

          <h2 className="scroll-m-20  text-xl font-semibold tracking-tight first:mt-0">
            Summaries
          </h2>
        </div>
        <Separator />
        <div className=" flex items-start justify-center flex-col w-full h-full">
          {recordingData === undefined ? (
            <div className="w-full flex items-center justify-center py-5">
              <Loading />
            </div>
          ) : (
            <>
              {recordingData.map((item) => {
                return (
                  <Button
                    key={item.id}
                    variant={"ghost"}
                    size="noPadding"
                    className="h-full w-full p-1 "
                    onClick={() => {
                      router.push(`/summary-info/${item.id}`);
                    }}
                  >
                    <div className="flex items-center justify-start w-full rounded-md border border-gray-400  gap-2 p-1 ">
                      <MdOutlineKeyboardArrowRight
                        size={30}
                        className="min-w-[10%]"
                      />
                      <div className=" flex flex-col w-full">
                        <p className="font-semibold w-full h-full text-wrap flex text-left ">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground italic text-xs text-left">
                          {dayjs(item.date).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                      {item.processing && (
                        <div className="w-full h-full flex justify-end items-end">
                          <div className="inline-block pr-2">
                            <Loading size="sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
              {recordingData.length === 0 && (
                <div className="w-full flex items-center justify-center py-5">
                  <p className="text-muted-foreground">
                    Start by taking your first recording
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Summaries;
