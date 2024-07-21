"use client";

import Loading from "@/components/Loading";
import { setRecordingData } from "@/components/Redux/meetingSummary";
import { RootState } from "@/components/Redux/store";
import ShadCNLineGraph, {
  ShadCNLineGraphDataPoint,
} from "@/components/ShadCNLineGraph/ShadCNLineGraph";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import HttpClientInstance from "@/httpClient/HttpClient";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import { AiOutlineUpload } from "react-icons/ai";
import { IoRecordingSharp } from "react-icons/io5";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import "../globals.css";

export default function Home() {
  const addAudioElement = async (blob: Blob) => {
    const response = await HttpClientInstance.uploadAudio(blob);
    router.push(`/summary-info/${response["id"]}`);
  };
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const recordingData = useSelector(
    (state: RootState) => state.meetingSummary.recordingData
  );

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [fileUploading, setFileUploading] = useState<boolean>(false);

  const handleFileUpload = async (event: any) => {
    // do something with event data
    setFileUploading(true);

    try {
      if (!fileInputRef.current || !fileInputRef.current.files) {
        return;
      }

      const file = fileInputRef.current.files[0];
      if (file) {
        const response = await HttpClientInstance.uploadAudio(file);
        router.push(`/summary-info/${response["id"]}`);

        /**
         * Update all notes
         */
        const allNotes = await HttpClientInstance.getAllNotes();
        dispatch(setRecordingData(allNotes["allNotes"]));
      }
    } finally {
      setFileUploading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(async () => {
      const response = await HttpClientInstance.getAllNotes();
      dispatch(setRecordingData({ recordingData: response["allNotes"] }));
    });
  }, []);

  return (
    <div className="bg-[#17181c] min-h-screen">
      <div className="flex flex-col items-center justify-center pt-5 w-full pb-20 bg-[#17181c]">
        <div className="w-full">
          <Card className="flex my-1 mx-3">
            <div className="p-3 flex items-center justify-center w-full  ">
              {isRecording === false && (
                <div className="flex items-center justify-center gap-2 w-full ">
                  <Image
                    src="/lytix-notes-logo.png"
                    alt="Lytix Logo"
                    width={75}
                    height={75}
                  />
                </div>
              )}

              <div className="py-1 flex gap-1 items-center justify-center w-full flex-col ">
                <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-2xl text-black w-full">
                  NoteHound
                </h1>
                {fileUploading === false ? (
                  <>
                    <div
                      className={`flex w-full ${
                        isRecording === true
                          ? "items-center justify-center"
                          : "items-center justify-start"
                      }`}
                    >
                      <div
                        onClick={() => {
                          if (isRecording === false) {
                            setIsRecording(true);
                          } else {
                            setIsRecording(false);
                          }
                        }}
                      >
                        <AudioRecorder
                          onRecordingComplete={addAudioElement}
                          audioTrackConstraints={{
                            noiseSuppression: true,
                            echoCancellation: true,
                            // autoGainControl,
                            // channelCount,
                            // deviceId,
                            // groupId,
                            // sampleRate,
                            // sampleSize,
                          }}
                          onNotAllowedOrFound={(err) => console.table(err)}
                          downloadOnSavePress={false}
                          downloadFileExtension="webm"
                          mediaRecorderOptions={{
                            audioBitsPerSecond: 128000,
                          }}
                          showVisualizer={true}
                        />
                      </div>

                      {isRecording === false && (
                        <Button
                          variant={"ghost"}
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                        >
                          <AiOutlineUpload size={25} />
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <Loading />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="w-full px-2">
          <Card className="my-1  p-1 mx-1">
            <div className="w-full">
              <ShadCNLineGraph
                title={"Past Week"}
                subHeader="Data on your meeting habits"
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
                          <div className="">
                            <p className="font-semibold w-full h-full text-wrap flex text-left ">
                              {item.name}
                            </p>
                            <p className="text-muted-foreground italic text-sm">
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
      </div>
      <input
        onChange={handleFileUpload}
        multiple={false}
        ref={fileInputRef}
        type="file"
        hidden
      />
    </div>
  );
}
