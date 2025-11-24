import { test, expect } from "@playwright/test";
import { supabase } from "@/lib/supabase";

test.describe("Supabase Client Integration", () => {
  test.only("should connect to Supabase and perform a query", async () => {
    // Perform a lightweight count query on the 'documents' table
    // "head: true" means we only want the metadata (count), not the actual rows
    const { count, error } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    // If there's a connection or auth error, this will be non-null
    if (error) {
      console.error("Supabase connection error:", error);
    }

    expect(error).toBeNull();
    // The count should be a number (0 or greater)
    expect(typeof count).toBe("number");
  });
});
