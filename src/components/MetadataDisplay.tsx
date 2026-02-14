import { FC, useEffect, useState } from "react";

interface MetadataDisplayProps {
  variant?: "welcome" | "chat";
  lastCrawledAt?: string | null;
}

const MetadataDisplay: FC<MetadataDisplayProps> = ({
  variant = "welcome",
  lastCrawledAt,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerClasses =
    variant === "welcome"
      ? "mt-4 flex flex-col items-center gap-1 text-xs text-gray-400"
      : "mb-2 flex flex-col items-end gap-1 text-[10px] text-gray-400";

  const formattedDate =
    mounted && lastCrawledAt
      ? new Date(lastCrawledAt).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : lastCrawledAt
        ? "Loading..."
        : "Never";

  return (
    <div className={containerClasses}>
      <p>
        Searching:{" "}
        <span className="font-mono">{process.env.NEXT_PUBLIC_TARGET_URL}</span>
      </p>
      <p>
        Last crawled: <span className="font-mono">{formattedDate}</span>
      </p>
      <p>
        Answered by:{" "}
        <span className="font-mono">{process.env.NEXT_PUBLIC_CHAT_MODEL}</span>
      </p>
    </div>
  );
};

export default MetadataDisplay;
