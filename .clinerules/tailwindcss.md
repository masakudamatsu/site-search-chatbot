# Tailwind CSS Guidelines

## Core Documentation

For any tasks involving Tailwind CSS, refer to the official documentation as your primary source. The project is configured with Tailwind CSS v4, and older syntax or configuration may not be applicable.

- **Next.js Installation & Setup**: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- **Core Concepts - Utility-First**: https://tailwindcss.com/docs/utility-first
- **Styling Basics**:
    - **Colors**: https://tailwindcss.com/docs/customizing-colors
    - **Spacing**: https://tailwindcss.com/docs/spacing
    - **Sizing**: https://tailwindcss.com/docs/width & https://tailwindcss.com/docs/height
- **Layout**:
    - **Flexbox**: https://tailwindcss.com/docs/flex
    - **Grid**: https://tailwindcss.com/docs/grid-template-columns
- **Component Design**:
    - **Adding Base Styles**: https://tailwindcss.com/docs/adding-base-styles
    - **Styling based on parent state (group)**: https://tailwindcss.com/docs/hover-focus-and-other-states#group-states
- **Dark Mode**: https://tailwindcss.com/docs/dark-mode
- **Tailwind Typography plugin**: https://github.com/tailwindlabs/tailwindcss-typography

## Instructions

- Adhere strictly to the configuration and utility classes described in the above linked documentation.
- Do not use `@import` statements for base, components, and utilities in `globals.css` as this is not the standard for Tailwind CSS v4 with Next.js. The single `@import "tailwindcss";` is correct.
- If you get 404 errors by visiting the above URL links, please stop and report. You'll be given an instruction on where to look at instead.
