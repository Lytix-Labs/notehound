import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SummaryInfo: React.FC<{ id: string }> = ({ id }) => {
  const summaryData = {
    name: "Some Recording",
    date: new Date(),
    duration: 5000,
    summary: `# Meeting Summary

## Action Items
1. **Follow-Up Meeting**: SPEAKER_00 and SPEAKER_02 agreed to meet in Boston in the future to discuss further developments and ideas.
2. **Idea Sharing**: Both parties agreed to share new ideas with each other as they arise.

## Introduction and Background
- **SPEAKER_00** and **SPEAKER_01** exchanged greetings and apologies for any delays.
- **SPEAKER_00** asked if **SPEAKER_01** was a member of a program, to which **SPEAKER_01** responded that they were usually a civil clerk at Williamsburg.
- **SPEAKER_00** and **SPEAKER_02** discussed their experiences in Boston, with **SPEAKER_02** mentioning they were born and raised there and went to school in Boston.

## Discussion on Software and Program
- **SPEAKER_00** expressed appreciation for the kindness of others and mentioned their support for the school and helping students learn about software.
- **SPEAKER_02** agreed and appreciated the responsiveness, indicating a shared interest in educational opportunities.

## Investment and Fund Management
- **SPEAKER_00** discussed the challenges and strategies involved in managing funds and investments, mentioning the importance of being hands-on in building productivity functions.
- **SPEAKER_02** elaborated on the complexities of fund management, including dealing with various strategic events and the importance of honesty in their operations.

## Company and Product Development
- **SPEAKER_02** provided a detailed history of their company's development, starting with a consumer-facing donation app and transitioning to analytics and AI observability.
- They discussed the challenges and learnings from their initial project and the shift towards a technical problem-solving approach.
- **SPEAKER_02** mentioned their focus on product-based analytics for chat-based apps and the importance of understanding user interactions beyond traditional click-through rates.

## Model Management and Technical Challenges
- **SPEAKER_02** talked about the difficulties in managing multiple models and the need for a simple framework to consolidate them.
- They discussed the potential of open-sourcing internal tools and the importance of cost management and model analytics.
- **SPEAKER_00** and **SPEAKER_02** explored the idea of a serverless GPU architecture to manage model hosting more efficiently.

## Customer Research and Validation
- **SPEAKER_02** emphasized the importance of customer research and validation to ensure they are working on the right problems.
- They shared insights from their interactions with customers and the need to balance abstraction and control in their tools.

## Future Plans and Collaboration
- **SPEAKER_00** and **SPEAKER_02** discussed their plans to potentially return for demo day in the YC Summer Batch and start fundraising.
- They agreed to keep each other updated on their progress and share learnings and experiences.

## Conclusion
- **SPEAKER_00** and **SPEAKER_02** expressed mutual appreciation for the conversation and looked forward to future interactions and collaborations.

This summary captures the key points and discussions from the meeting, highlighting the main topics and action items for follow-up.`,
  };

  return (
    <div className="bg-slate-800 w-screen h-screen overflow-y-scroll">
      <div className="flex flex-col items-center justify-center pt-5 w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{summaryData.name}</CardTitle>
            <CardDescription className="text-center">
              {summaryData.date.toLocaleDateString()} -{" "}
              {(summaryData.duration / 60).toFixed(2)} minutes
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="mx-1 mb-2 mt-3">
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
                    <li className="mb-2 list-item list-inside">{children}</li>
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
        </Card>
      </div>
    </div>
  );
};

export default SummaryInfo;
