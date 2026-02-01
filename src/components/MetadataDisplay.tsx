import { FC } from "react";

interface MetadataDisplayProps {
  variant?: "welcome" | "chat";
}

const MetadataDisplay: FC<MetadataDisplayProps> = ({ variant = "welcome" }) => {
  const containerClasses =
    variant === "welcome"
      ? "mt-4 flex flex-col items-center gap-1 text-xs text-gray-400"
      : "mb-2 flex justify-center gap-4 text-[10px] text-gray-400";

  return (
    <div className={containerClasses}>
      <p>
        Searching:{" "}
        <span className="font-mono">{process.env.NEXT_PUBLIC_TARGET_URL}</span>
      </p>
      <p>
        Answered by:{" "}
        <span className="font-mono">{process.env.NEXT_PUBLIC_CHAT_MODEL}</span>
      </p>
    </div>
  );
};

export default MetadataDisplay;
