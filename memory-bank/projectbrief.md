# Project Brief

## Overview

Building a web application with a NotebookLM-like feature with the sources of information restricted to all the pages of a prespecified website, rather than the entire internet.

## Purpose of this project
It is more like proof-of-concept. For this particular project, I just want to create one single webpage with the chat interface, with an external website to search. In the future, I'd like to make it as the site search part of a contents-heavy website I myself will build.

## Core Features

- The user can enter question sentences, rather than keywords, to search over a given website, just like they do on NotebookLM for selected documents
- Search results are also given in sentences with links to the webpages as citations, just like NotebookLM does.
- The user can ask follow-up questions to have an extended conversation. To maintain context for these follow-ups, the application will send the entire chat history with each new message. This straightforward approach is well-suited for the proof-of-concept, leveraging the large context window of the selected language model.
- A website manager can provide the URL of the home page as a configuration option of the application. The application then crawls the entire website (restricted to the exact same domain as the home page's) from the home page to webscrape the contents as the sources of information. In doing so, the application respects `robots.txt` to skip webpages marked as off-limits.
- The crawler can handle JavaScript-injected contents of webpages, not just static HTML.
- The application updates its information sources periodically via a scheduled cron job. To ensure efficiency and minimize cost, this update process uses a multi-step filtering strategy:
  1. __Date Check__: The system first checks the `Last-Modified` HTTP header or relevant `<meta>` tags for each webpage. If the date is unchanged, the page is skipped.
  2. __Content Checksum__: For pages with a new or missing date, the system downloads the page content and calculates a checksum (a unique digital hash). This hash is compared against the previously stored hash for that page.
  3. __Re-embedding__: Only if the content checksum has changed does the system proceed with the resource-intensive step of re-embedding the page's content and updating the vector database. This ensures that API calls for embedding are only made when the textual content of a page has verifiably changed."
- The application uses an open-source LLM model so that the user can use the application for free of charge.
- The website to search by the application is prespecified. But the codebase can be flexible enough to switch the website to search.
- The codebase is flexible enough for the application provider to easily switch (1) the website to search and (2) the open-source LLM model
- The codebase is also modular so that it can be added to an existing website for the chatbot-based site search.

## Target Users

Those who are familiar with ChatGPT and the like and want to use a similar user interface for searching over a given website.

## Technical Preferences (optional)

- Next.js for front-end and back-end
- Tailwind CSS for styling
- Playwright for webscraping both static HTML and JavaScript-injected contents
- LangChain.js for text splitting
- Replicate for embeddings and hosting LLM models (with Hugging Face Inference Endpoints as an alternative when this project is adapted for the contents-heavy website I will build)
- Supabase pgvector for storing embeddings
- GPT-OSS-20B for an open-source LLM model (as the default option)
- Vercel AI SDK for streaming LLM's response
- Playwright for E2E tests and visual regression tests
- Environment variables for setting configuration options (LLM model, the website's homepage URL to search, frequency of updating the sources of information, etc.)
- Vercel for deployment
- Vercel Cron Job for the periodic updating of information sources
