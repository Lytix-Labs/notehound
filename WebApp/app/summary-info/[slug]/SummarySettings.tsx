import { setRecordingData } from "@/components/Redux/meetingSummary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import HttpClientInstance from "@/httpClient/HttpClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const SummarySettings: React.FC<{
  id: string;
  summary: string;
  title: string;
  duration: number;
  date: Date;
  transcript: { text: string; speaker: string; timestamp: string[] }[];
  setSummaryData: (data: {
    id: string;
    summary: string;
    name: string;
    date: Date;
    duration: number;
    transcript: { text: string; speaker: string; timestamp: string[] }[];
  }) => void;
}> = ({ id, summary, title, date, duration, transcript, setSummaryData }) => {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const [openEditTitle, setOpenEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const deleteSummary = async () => {
    await HttpClientInstance.deleteSummary(id);
    toast({
      title: "Summary deleted 🚀",
      description: "The summary has been deleted",
    });

    /**
     * Req query recordings to display in homepage
     */
    const allNotes = await HttpClientInstance.getAllNotes();
    dispatch(setRecordingData(allNotes["allNotes"]));
    router.replace("/home");
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary);
    toast({
      title: "Summary copied 🚀",
      description: "The summary has been copied to your clipboard",
    });
  };

  const saveNewTitleForSummary = async () => {
    await HttpClientInstance.updateSummary({ id, title: newTitle });
    toast({
      title: "Title updated 🚀",
      description: "The title has been updated",
    });
    setSummaryData({ id, summary, name: newTitle, date, duration, transcript });
    setOpenEditTitle(false);
  };

  useEffect(() => {
    setNewTitle(title);
  }, [title]);

  return (
    <>
      <Dialog open={openEditTitle} onOpenChange={setOpenEditTitle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Title</DialogTitle>
            <DialogDescription>Update the title of this note</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Enter new title"
              onChange={(e) => setNewTitle(e.target.value)}
              value={newTitle}
            />
            <Button variant="default" onClick={() => saveNewTitleForSummary()}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <SheetContent className="h-full  items-center justify-center">
        <SheetHeader>
          <SheetTitle>Summary Settings</SheetTitle>
          <SheetDescription>
            <div className="flex flex-col gap-2">
              <Button variant="default" onClick={() => setOpenEditTitle(true)}>
                ✍️ Update Title
              </Button>
              <Button variant="default" onClick={copyToClipboard}>
                📋 Copy To Clipboard
              </Button>

              <Button variant="destructive" onClick={deleteSummary}>
                Delete
              </Button>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </>
  );
};

export default SummarySettings;
