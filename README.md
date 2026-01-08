# Site Search Chatbot

A Next.js chatbot application that crawls a specific website and allows users to ask questions based on its content using RAG (Retrieval-Augmented Generation).

## Setup

1.  **Clone the repository.**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
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
