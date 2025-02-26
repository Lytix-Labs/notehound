"use client";

import Loading from "@/components/Loading";
import {
  setRecordingData,
  setSearchResults,
} from "@/components/Redux/meetingSummary";
import { RootState } from "@/components/Redux/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import HttpClientInstance from "@/httpClient/HttpClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import { AiOutlineUpload } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import "../globals.css";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { MdClose, MdSearch } from "react-icons/md";
import LookbackGraph from "./LookbackGraph";
import MenuBar from "./MenuBar";
import SearchResults from "./SearchResults";
import Summaries from "./Summaries";

export default function Home() {
  const addAudioElement = async (blob: Blob) => {
    /**
     * In the background slowly just keep creeping up
     */
    Promise.resolve().then(async () => {
      let newProgressBarValue = 0;
      while (newProgressBarValue < 100) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 1000 + 500)
        );
        newProgressBarValue = newProgressBarValue + 5 * 1.5;
        setProgressBar(newProgressBarValue);
      }
    });

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
  const [progressBar, setProgressBar] = useState<number>(0);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleFileUpload = async (event: any) => {
    // do something with event data
    setProgressBar(0);
    setFileUploading(true);

    /**
     * In the background slowly just keep creeping up
     */
    Promise.resolve().then(async () => {
      let newProgressBarValue = 0;
      while (newProgressBarValue < 100) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 1000 + 500)
        );
        newProgressBarValue = newProgressBarValue + 5 * 1.5;
        setProgressBar(newProgressBarValue);
      }
    });

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

  const handleSearch = async (event: any) => {
    const newSearchQuery = event.target.value;
    setSearchQuery(newSearchQuery);

    /**
     * Wait for the query to be at least 3 characters long
     */
    if (newSearchQuery.length >= 3) {
      const response = await HttpClientInstance.searchEmbeddings(
        newSearchQuery
      );
      dispatch(setSearchResults({ searchResults: response }));
      console.log(response);
    }
  };

  return (
    <div className="max-h-screen min-h-screen relative  ">
      <Dialog open={fileUploading === true}>
        <DialogContent>
          <p className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-xl">
            Uploading meeting...
          </p>
          <Progress value={progressBar} />
        </DialogContent>
      </Dialog>
      <MenuBar />
      <div className="bg-[#17181c] max-h-screen min-h-screen">
        <div className="flex flex-col   pt-5 w-full pb-20 bg-[#17181c] max-h-screen overflow-y-scroll">
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
                <div className="flex items-center justify-center gap-1">
                  <MdSearch size={25} />
                  <Input
                    placeholder="Search across your summaries"
                    onChange={handleSearch}
                    value={searchQuery}
                  />
                  {searchQuery !== "" && (
                    <Button
                      variant={"link"}
                      className="p-0 m-0"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                    >
                      <MdClose size={15} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
          {searchQuery !== "" ? (
            <div className="px-3 py-1 w-full ">
              <SearchResults searchQuery={searchQuery} />
            </div>
          ) : (
            <>
              <LookbackGraph />

              {recordingData && <Summaries recordingData={recordingData} />}
            </>
          )}
        </div>
        <input
          onChange={handleFileUpload}
          multiple={false}
          ref={fileInputRef}
          type="file"
          hidden
        />
      </div>
    </div>
  );
}
