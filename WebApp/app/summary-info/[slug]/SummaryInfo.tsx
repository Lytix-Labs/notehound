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
        return;
      }

      parsed["date"] = new Date(parsed.date);
      setSummaryData(parsed);
    });
  }, [id]);

  return (
    <>
      <div className="bg-[#17181c] w-screen h-screen overflow-y-scroll">
        <Sheet open={openSettings} onOpenChange={setOpenSettings}>
          <SummarySettings id={id} />
        </Sheet>
        <div className="flex flex-col items-center justify-center pt-5 w-full">
          <div className="flex items-center justify-center">
            {(summaryData || processingResult) && (
              <div>
                {/* Back button */}
                <Button
                  variant="link"
                  className="flex"
                  onClick={() => router.back()}
                >
                  <MdArrowBackIosNew size={35} color="white" />
                </Button>
              </div>
            )}
            {summaryData && (
              <Card>
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
            {processingResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Processing</CardTitle>
                  <CardDescription className="text-center">
                    Still processing, check back later
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
            {(summaryData || processingResult) && (
              <div>
                {/* Settings button */}
                <Button variant="link" onClick={() => setOpenSettings(true)}>
                  <RiSettings5Fill size={35} color="white" />
                </Button>
              </div>
            )}
          </div>
          <Card className="mx-1 mb-2 mt-3">
            {summaryData === undefined ? (
              <div className=" px-5 pl-7 py-5 flex items-center justify-center">
                <Loading />
              </div>
            ) : (
              <div className="p-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p({ children }) {
                      return (
                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                          {children}
                        </p>
                      );
                    },
                    h1({ children }) {
                      return (
                        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                          {children}
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
                          {children}
                        </h3>
                      );
                    },
                    ol({ children }) {
                      return (
                        <ol className="list-inside list-decimal">{children}</ol>
                      );
                    },
                    ul({ children }) {
                      return (
                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                          {children}
                        </ul>
                      );
                    },
                    li({ children }) {
                      return (
                        <li className="mb-2 list-item list-inside">
                          {children}
                        </li>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="relative border-s-4 border-gray-800 bg-slate-200 pl-2 ps-4 sm:ps-6">
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {summaryData.summary}
                </ReactMarkdown>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default SummaryInfo;
