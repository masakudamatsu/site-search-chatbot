# Site Search Chatbot

A powerful, open-source RAG (Retrieval-Augmented Generation) chatbot designed to provide a "NotebookLM-like" search experience for any specific website. Unlike generic search bars, it understands natural language queries and provides conversational answers with direct citations to the source pages.

## 🚀 Features

- **Conversational Search**: Ask questions in full sentences and get natural language responses.
- **Accurate Citations**: Every answer includes links back to the source webpages (opening in new tabs).
- **Smart Automated Ingestion**: **The system includes an automated ingestion system that crawls the target website daily to keep the search index up-to-date.** It skips unchanged pages using `Last-Modified` headers and content checksums to minimize costs and maximize efficiency.
- **JavaScript Support**: Uses Playwright to crawl dynamic, JavaScript-rendered content.
- **Open-Source LLMs**: Powered by Together AI's open-source model library.
- **Privacy First**: Configured with `noindex` metadata to keep your test deployments private.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI Orchestration**: [Vercel AI SDK](https://sdk.vercel.ai/) & [LangChain.js](https://js.langchain.com/)
- **Embeddings & LLM**: [Together AI](https://www.together.ai/)
- **Vector Database**: [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
- **Crawler**: [Playwright](https://playwright.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/site-search-chatbot.git
cd site-search-chatbot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup (Supabase)
- Create a new project on [Supabase](https://supabase.com/).
- **Obtain API Keys**:
    - Click **Connect** at the top row of the dashboard. This will show a popup entitled "Connect to your project".
    - Click **API Keys** tab.
    - Copy the **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`; see below).
    - Then, click **API Settings** at the bottom right. This will close the popup and show a page entitled "API Keys".
    - Click **Legacy anon, service_role API keys** tab.
    - Copy the **service_role secret key** (for `SUPABASE_SERVICE_ROLE_KEY`; see below). *Note: Do not use the `anon` key.*
- **Initialize Database**:
    - Go to the **SQL Editor** in your Supabase project.
    - Open the files in the `supabase/` directory and execute them in this order:
        1.  `schema.sql`: Sets up the core `documents` table and `vector` extension.
        2.  `match_documents.sql`: Creates the vector search function.
        3.  `migrations/20251225_smart_ingestion.sql`: Sets up the `crawled_pages` table for smart updates.

### 4. AI & Embeddings Setup (Together AI)
- Sign up for an account at [Together AI](https://www.together.ai/).
- Navigate to **Manage API Keys** page.
- Copy your **API Key** for use in the environment variables (see below).

### 5. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and fill in the required values:
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from Supabase settings)
- `TOGETHER_AI_API_KEY` (from Together AI)
- `CRON_SECRET` (A secret token of your choice for securing the ingest API)
- `NEXT_PUBLIC_TARGET_URL` (The website URL you want to crawl and search)
- `NEXT_PUBLIC_CHAT_MODEL` (The LLM model to use; see [Together AI documentation](https://docs.together.ai/docs/serverless-models#chat-models) for model names such as `openai/gpt-oss-20b`)

### 6. Testing Ingestion Locally
You can manually trigger the ingestion process to verify your setup:
1. Start the local server: `npm run dev`
2. In a separate terminal, run:
```bash
curl -X GET http://localhost:3000/api/ingest \
     -H "Authorization: Bearer CRON_SECRET"
```
where `CRON_SECRET` is replaced with the value specified in `.env.local`.

## 🏗️ Development Workflow

This project is optimized for AI-augmented development using [Cline](https://cline.bot/) (or similar AI agents).

### Memory Bank & AI Rules
- **`.clinerules/`**: Contains project-specific rules that guide the AI's behavior, ensuring consistent coding standards and TDD workflows.
- **`memory-bank/`**: Maintains the project's state, context, and architectural decisions. AI agents use these files to "remember" the project across sessions.

### Running Tests
The project follows a strict Test-Driven Development (TDD) approach.
- **Vitest (Unit/Integration)**: `npm run test:vitest`
- **Playwright (E2E)**: `npm run test:playwright` (or `npm test` for Chromium only)
- **Full Regression**: `npm run test:regression`

### Forcing Re-ingestion
To force a complete re-ingestion (clearing the "Smart Ingestion" history), run this SQL in your Supabase dashboard:
```sql
TRUNCATE TABLE crawled_pages;
```

## 🌐 Production Deployment with Vercel

1. **Deploy to Vercel**: Connect your GitHub repository to Vercel.
2. **Configure Environment Variables**: Add all variables from your `.env.local` to the Vercel project settings.
3. **First Deployment & Initial Ingestion**: 
   Since the production database starts empty, you must trigger the first crawl manually:
   - Go to the **Cron Jobs** tab in your Vercel project dashboard.
   - Locate the `/api/ingest` job and click the **"Run"** button.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the chatbot:

1. **Fork the repository**.
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`.
3. **Commit your changes**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
4. **Run tests**: `npm run test:regression`.
5. **Push to the branch**: `git push origin feature/amazing-feature`.
6. **Open a Pull Request**.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
