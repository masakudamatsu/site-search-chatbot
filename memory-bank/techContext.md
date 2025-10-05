# Tech Context

## Frameworks & Libraries
- **Application Framework:** Next.js (for both frontend and backend)
- **Styling:** Tailwind CSS
- **Web Scraping:** Playwright
- **AI/LLM Orchestration:** LangChain.js (for text splitting)
- **Frontend AI Integration:** Vercel AI SDK

## Services & Platforms
- **LLM Hosting:** Replicate (for `gpt-oss-20b`)
- **Embedding Generation:** Replicate
- **Vector Database:** Supabase pgvector
- **Deployment:** Vercel
- **Scheduled Jobs:** Vercel Cron Jobs

## Development & Testing
- **E2E & Visual Regression Testing:** Playwright
- **Configuration:** Environment variables will be used to manage settings like the target website URL, LLM model, and cron job frequency.

## Development Methodology
- **Test-Driven Development (TDD):** The project will follow a TDD approach. For each new feature, a failing test (primarily using Playwright for end-to-end testing) will be written first. The implementation code will then be developed to make the test pass, followed by an optional refactoring step.
