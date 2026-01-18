# Site Search Chatbot

A Next.js chatbot application that crawls a specific website and allows users to ask questions based on its content using RAG (Retrieval-Augmented Generation).

## Setup

1.  **Clone the repository.**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Database Setup (Supabase)**:
    -   Create a new project on [Supabase](https://supabase.com/).
    -   Go to the **SQL Editor** in your Supabase project.
    -   Open the files in the `supabase/` directory and copy-paste their contents into the SQL Editor in this order:
        1.  `schema.sql`: Sets up the core `documents` table and `vector` extension.
        2.  `match_documents.sql`: Creates the vector search function.
        3.  `migrations/20251225_smart_ingestion.sql`: Sets up the `crawled_pages` table for smart updates.
    -   Click the **"Run selected"** green button for each script to execute the SQL.
4.  **Configure Environment Variables**:
    -   Copy `.env.local.example` to `.env.local`.
    -   Fill in the required values (Supabase, Together AI, Cron Secret, Target URL).

## Automated Ingestion (Cron Job)

The application includes an automated ingestion system that crawls the target website daily to keep the search index up-to-date. It uses "Smart Ingestion" to skip unchanged pages (based on `Last-Modified` headers and content checksums).

### Testing Automation Locally

You can test the ingestion process locally by simulating the Cron Job request:

1.  Start the local server:
    ```bash
    npm run dev
    ```
2.  In a separate terminal, run the following `curl` command (replace `YOUR_SECRET` with the `CRON_SECRET` from your `.env.local`):
    ```bash
    curl -X GET http://localhost:3000/api/ingest \
         -H "Authorization: Bearer YOUR_SECRET"
    ```

This will trigger the crawler, which will:
-   Visit the `TARGET_URL`.
-   Check for updates.
-   Populate/Update the database with new content.

### First Deployment & Initial Ingestion

When you first deploy to Vercel:

1.  **Deploy** the project.
2.  **Configure Environment Variables** in the Vercel Dashboard (match your `.env.local` settings, ensuring `CRON_SECRET` and `TARGET_URL` are set).
3.  **Trigger Initial Ingestion**:
    -   Go to your project in Vercel.
    -   Navigate to the **Cron Jobs** tab.
    -   Find the `/api/ingest` job.
    -   Click the **"Run"** button.

This manually triggers the ingestion process on the production infrastructure immediately, populating your production database without waiting for the scheduled daily run.

### Forcing Re-ingestion (Clearing History)

Because the system uses "Smart Ingestion," it skips pages that haven't verifiably changed. If you need to force a complete re-ingestion of the website (e.g., after changing the embedding logic or chunking strategy), you must clear the crawl history:

1.  Open the **SQL Editor** in your Supabase Dashboard.
2.  Run the following query (also saved in `supabase/clear-crawl-history.sql`):
    ```sql
    TRUNCATE TABLE crawled_pages;
    ```
3.  Trigger the ingestion process again using the `curl` command (local) or the Vercel Cron Job "Run" button (production).
