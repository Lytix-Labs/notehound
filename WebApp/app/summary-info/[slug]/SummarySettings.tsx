import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import HttpClientInstance from "@/httpClient/HttpClient";
import { useRouter } from "next/navigation";

const SummarySettings: React.FC<{ id: string; summary: string }> = ({
  id,
  summary,
}) => {
  const { toast } = useToast();
  const router = useRouter();

  const deleteSummary = async () => {
    await HttpClientInstance.deleteSummary(id);
    toast({
      title: "Summary deleted 🚀",
      description: "The summary has been deleted",
    });
    router.back();
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary);
    toast({
      title: "Summary copied 🚀",
      description: "The summary has been copied to your clipboard",
    });
  };

  return (
    <SheetContent className="h-full  items-center justify-center">
      <SheetHeader>
        <SheetTitle>Summary Settings</SheetTitle>
        <SheetDescription>
          <div className="flex flex-col gap-2">
            <Button variant="default" onClick={copyToClipboard}>
              Copy To Clipboard
            </Button>
            <Button variant="destructive" onClick={deleteSummary}>
              Delete
            </Button>
          </div>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  );
};

export default SummarySettings;
