import ChatInterface from "@/components/ChatInterface";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data, error } = await supabase
    .from("crawl_status")
    .select("completed_at")
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching last crawl date:", error);
  }

  const lastCrawledAt = data?.completed_at || null;

  return <ChatInterface lastCrawledAt={lastCrawledAt} />;
}
