import { Sheet } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RiHome3Fill, RiSettings4Fill } from "react-icons/ri";
import SettingsSheet from "./SettingsSheet";

const MenuBar: React.FC<{}> = () => {
  const [openSettings, setOpenSettings] = useState(false);
  const router = useRouter();
  return (
    <>
      <div className="absolute bottom-0 left-0 w-full bg-white flex pt-2 pb-2">
        <div
          className="flex flex-col items-center justify-center w-full "
          onClick={() => router.push("/home")}
        >
          <RiHome3Fill size={24} />
          <p className="">Home</p>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-2 w-full"
          onClick={() => setOpenSettings(true)}
        >
          <RiSettings4Fill size={24} />
          <p className="text-sm">Settings</p>
        </div>
      </div>
      <Sheet open={openSettings} onOpenChange={setOpenSettings}>
        <SettingsSheet />
      </Sheet>
    </>
  );
};

export default MenuBar;
