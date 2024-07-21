"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import HttpClientInstance from "@/httpClient/HttpClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// @ts-ignore
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MdArrowBackIosNew } from "react-icons/md";
import { RiSettings5Fill } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SummarySettings from "./SummarySettings";

const SummaryInfo: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState<
    | undefined
    | {
        name: string;
        date: Date;
        duration: number;
        summary: string;
        transcript: { text: string; speaker: string; timestamp: string[] }[];
      }
  >(undefined);
  const [processingResult, setProcessingResult] = useState<boolean>(false);
  const [openSettings, setOpenSettings] = useState<boolean>(false);

  useEffect(() => {
    Promise.resolve().then(async () => {
      const res = await HttpClientInstance.getSummary(id);
      const parsed = JSON.parse(res);

      if (parsed.processing) {
        setProcessingResult(true);
      }

      parsed["date"] = new Date(parsed.date);
      setSummaryData(parsed);
    });
  }, [id]);

  let transcriptString = "";
  if (summaryData?.transcript) {
    transcriptString = "## Transcript\n";
    summaryData.transcript.map(
      (transcriptItem: {
        text: string;
        speaker: string;
        timestamp: string[];
      }) => {
        let timestampString = "";
        if (transcriptItem["timestamp"]) {
          timestampString = `\n\n**Timestamp** ${transcriptItem["timestamp"][0]}s-${transcriptItem["timestamp"][1]}s`;
        }
        transcriptString += `**Speaker: ${transcriptItem["speaker"]}**${timestampString}\n\n**Message** ${transcriptItem["text"]}\n\n`;
      }
    );
  }

  const markdownComponents = {
    p({ children }: { children: React.ReactNode }) {
      return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
    },
    h1({ children }: { children: React.ReactNode }) {
      return (
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {children}
        </h1>
      );
    },
    h2({ children }: { children: React.ReactNode }) {
      return (
        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          {children}
        </h2>
      );
    },
    h3({ children }: { children: React.ReactNode }) {
      return (
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          {children}
        </h3>
      );
    },
    ol({ children }: { children: React.ReactNode }) {
      return <ol className="list-inside list-decimal">{children}</ol>;
    },
    ul({ children }: { children: React.ReactNode }) {
      return <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>;
    },
    li({ children }: { children: React.ReactNode }) {
      return <li className="mb-2 list-item list-inside">{children}</li>;
    },
    blockquote({ children }: { children: React.ReactNode }) {
      return (
        <blockquote className="relative border-s-4 border-gray-800 bg-slate-200 pl-2 ps-4 sm:ps-6">
          {children}
        </blockquote>
      );
    },
  };

  return (
    <>
      <div className="bg-[#17181c] w-screen h-screen overflow-y-scroll">
        <Sheet open={openSettings} onOpenChange={setOpenSettings}>
          <SummarySettings
            id={id}
            transcript={summaryData?.transcript ?? []}
            summary={summaryData?.summary ?? ""}
            title={summaryData?.name ?? ""}
            duration={summaryData?.duration ?? 0}
            date={summaryData?.date ?? new Date()}
            setSummaryData={setSummaryData}
          />
        </Sheet>
        <div className="flex w-full mt-3">
          <div>
            {/* Back button */}
            <Button
              variant="link"
              className="flex"
              onClick={() => router.replace("/home")}
            >
              <MdArrowBackIosNew size={30} color="white" />
            </Button>
          </div>

          {(summaryData || processingResult) && (
            <div className="flex w-full justify-end">
              {/* Settings button */}
              <Button variant="link" onClick={() => setOpenSettings(true)}>
                <RiSettings5Fill size={30} color="white" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-center mt-3 w-full">
          <div className="flex items-center justify-center">
            {summaryData && !processingResult && (
              <Card className="rounded-sm mx-3">
                <CardHeader>
                  <CardTitle className="text-center">
                    {summaryData.name}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {summaryData.date.toLocaleDateString()} -{" "}
                    {(summaryData.duration / 60).toFixed(2)} minutes
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
            {processingResult && summaryData && (
              <Card className="px-2 py-1 rounded-sm">
                <CardTitle className="text-center">Processing</CardTitle>
                <CardDescription className="text-center">
                  {summaryData.date.toLocaleDateString()} -{" "}
                  {(summaryData.duration / 60).toFixed(2)} minutes
                </CardDescription>
              </Card>
            )}
          </div>
          {/* {summaryData && summaryData.rawAudio && (
            <Card className="mx-3 mb-2 mt-3 rounded-sm">
              <AudioPlayer
                src={summaryData.rawAudio}
                minimal={false}
                width={350}
                trackHeight={75}
                barWidth={1}
                gap={1}
                visualise={true}
                backgroundColor="#FFFFFF"
                barColor="#FFFFFF"
                barPlayedColor="#FFFFFF"
                skipDuration={2}
                showLoopOption={true}
                showVolumeControl={true}

                // seekBarColor="purple"
                // volumeControlColor="blue"
                // hideSeekBar={true}
                // hideTrackKnobWhenPlaying={true}
              />
            </Card>
          )} */}

          <Tabs defaultValue="summary" className="w-full">
            {summaryData && (
              <div
                className=" flex justify-center ounded-md shadow-md h-full my-2"
                style={{}}
              >
                <TabsList className="w">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                </TabsList>
              </div>
            )}
            <TabsContent value="summary">
              <Card className="mx-3 mb-2 mt-3 rounded-sm">
                {summaryData === undefined && !processingResult ? (
                  <div className=" px-5 py-5 flex items-center justify-center">
                    <Loading />
                  </div>
                ) : (
                  <>
                    {processingResult && summaryData ? (
                      <div className=" px-5 py-5 flex items-center justify-center">
                        <div className="max-w-[300px] min-w-[300px]">
                          {/* <Progress
                        value={
                          summaryData?.duration /
                          dayjs().diff(summaryData?.date, "minutes")
                        }
                      /> */}
                          <Loading size="lg" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-1 ">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          // @ts-ignore
                          components={markdownComponents}
                        >
                          {summaryData?.summary ?? "No summary"}
                        </ReactMarkdown>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="transcript">
              <Card className="mx-3 mb-2 mt-3 rounded-sm">
                {transcriptString === "" ? (
                  <div className=" px-5 py-5 flex items-center justify-center">
                    <Loading />
                  </div>
                ) : (
                  <div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      // @ts-ignore
                      components={markdownComponents}
                    >
                      {transcriptString}
                    </ReactMarkdown>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SummaryInfo;
