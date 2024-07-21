import { logoutUtils } from "@/AuthUtils/logInOutUtils";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import HttpClientInstance from "@/httpClient/HttpClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SettingsSheet = () => {
  const router = useRouter();
  const logout = async () => {
    await Promise.all([logoutUtils.logout(), HttpClientInstance.logout()]);
    router.push("/");
  };
  return (
    <SheetContent className="h-full  items-center justify-center">
      <SheetHeader>
        <div className="flex items-center gap-2">
          <Image
            src="/lytix-notes-logo.png"
            alt="NoteHound"
            width={50}
            height={50}
          />
          <div className="flex flex-col gap-0">
            <SheetTitle>NoteHound</SheetTitle>
            <SheetDescription className="text-sm text-left">
              by Lytix
            </SheetDescription>
          </div>
        </div>
        <SheetDescription>
          <div className="flex flex-col gap-2">
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  );
};

export default SettingsSheet;
