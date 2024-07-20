"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import HttpClientInstance from "@/httpClient/HttpClient";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import { AiOutlineUpload } from "react-icons/ai";
import { IoRecordingSharp } from "react-icons/io5";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import "../globals.css";

export default function Home() {
  const addAudioElement = async (blob: Blob) => {
    const response = await HttpClientInstance.uploadAudio(blob);
    router.push(`/summary-info/${response["id"]}`);
  };
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recodingData, setRecodingData] = useState<
    undefined | { id: string; name: string; date: Date }[]
  >(undefined);
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
      }
    } finally {
      setFileUploading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(async () => {
      const response = await HttpClientInstance.getAllNotes();
      // console.log(">>>response", response);
      setRecodingData(response["allNotes"]);
    });
  }, []);

  return (
    <div className="bg-[#17181c] w-screen h-screen">
      <div className="flex flex-col items-center justify-center pt-5 w-full">
        <Card className="">
          <div className="p-3 flex items-center justify-center flex-col">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-black">
              Record
            </h1>
            <div className="py-1 flex gap-1 items-center justify-center w-full">
              {fileUploading === false ? (
                <>
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
                </>
              ) : (
                <div>
                  <Loading />
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="w-full px-1 py-2">
          <Card>
            <div className="flex items-center justify-center gap-2">
              <IoRecordingSharp size={20} />

              <h2 className="scroll-m-20  text-xl font-semibold tracking-tight first:mt-0">
                Summaries
              </h2>
            </div>
            <Separator />
            <div className=" flex items-start justify-center flex-col w-full">
              <div className="w-full">
                {recodingData === undefined ? (
                  <div className="w-full flex items-center justify-center py-5">
                    <Loading />
                  </div>
                ) : (
                  <>
                    {recodingData.map((item) => {
                      return (
                        <Button
                          key={item.id}
                          variant={"ghost"}
                          className="w-full"
                          onClick={() => {
                            router.push(`/summary-info/${item.id}`);
                          }}
                        >
                          <div className="flex items-center justify-start w-full rounded-md border border-gray-400  gap-2">
                            <MdOutlineKeyboardArrowRight />
                            <p className="font-semibold ">{item.name}</p>
                            <p className="text-muted-foreground">
                              [{dayjs(item.date).format("DD/MM/YYYY HH:mm")}]
                            </p>
                          </div>
                        </Button>
                      );
                    })}
                    {recodingData.length === 0 && (
                      <div className="w-full flex items-center justify-center py-5">
                        <p className="text-muted-foreground">
                          Start by taking your first recording
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
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
