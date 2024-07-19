import { Icons } from "./Icons";

const Loading: React.FC<{ size?: "sm" | "lg" }> = ({ size = "lg" }) => {
  const height = size === "sm" ? "h-4" : "h-10";
  const width = size === "sm" ? "w-4" : "w-10";
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="inline-block">
        <Icons.spinner className={`mr-2 ${height} ${width} animate-spin`} />
      </div>
    </div>
  );
};
export default Loading;
