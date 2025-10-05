# Vercel Cron Jobs Guidelines

## Core Documentation

For any tasks involving Vercel Cron Jobs, refer to the official documentation as your primary source.

- **Quickstart Guide**: https://vercel.com/docs/cron-jobs/quickstart (Shows how to configure cron jobs in `vercel.json`)
- **Managing Cron Jobs**: https://vercel.com/docs/cron-jobs/manage-cron-jobs (Covers duration, error handling, and local testing)
- **Usage and Pricing**: https://vercel.com/docs/cron-jobs/usage-and-pricing
- **Cron Expression Syntax**: https://vercel.com/docs/cron-jobs#cron-expressions (Reference for scheduling syntax)

## Instructions

- Cron jobs are defined in the `vercel.json` file.
- The cron expression timezone is always UTC.
- To protect cron job endpoints from abuse, we must add a secret to the path or use the `Vercel-Cron-Secret` header for authorization. This will be covered in the "Managing Cron Jobs" guide.
- Adhere strictly to the configuration options described in the above linked documentation.
