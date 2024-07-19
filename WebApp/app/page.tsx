"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import { IoRecordingSharp } from "react-icons/io5";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import "./globals.css";

export default function Home() {
  const addAudioElement = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;

    audio.controls = true;
    console.log(`>>>src, ${url}`, audio, blob);
    // document.body.appendChild(audio);
  };
  const router = useRouter();

  const [recordingStarted, setRecordingStarted] = useState(false);

  const recodingData = [
    { id: "123", name: "Some recording", date: new Date() },
  ];

  return (
    <div className="bg-slate-800 w-screen h-screen">
      <div className="flex flex-col items-center justify-center pt-5 w-full">
        <Card>
          <div className="p-3 flex items-center justify-center flex-col">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Record
            </h1>
            <div className="py-1">
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
                downloadOnSavePress={true}
                downloadFileExtension="webm"
                mediaRecorderOptions={{
                  audioBitsPerSecond: 128000,
                }}
                showVisualizer={true}
              />
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
              <div className="">
                {recodingData.map((item) => {
                  return (
                    <Button
                      key={item.id}
                      variant={"ghost"}
                      className="p-0.5 m-1 w-full"
                      onClick={() => {
                        router.push(`/summary-info/${item.id}`);
                      }}
                    >
                      <div className="flex items-center justify-center w-full rounded-md border border-gray-400  gap-2">
                        <MdOutlineKeyboardArrowRight />
                        <p className="font-semibold ">{item.name}</p>
                        <p className="text-muted-foreground">
                          [{item.date.toLocaleString()}]
                        </p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
