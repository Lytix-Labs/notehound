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

const SummarySettings: React.FC<{ id: string }> = ({ id }) => {
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

  return (
    <SheetContent className="h-full  items-center justify-center">
      <SheetHeader>
        <SheetTitle>Summary Settings</SheetTitle>
        <SheetDescription>
          <Button variant="destructive" onClick={deleteSummary}>
            Delete
          </Button>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  );
};

export default SummarySettings;
