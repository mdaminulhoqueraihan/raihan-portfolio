# Md. Aminul Hoque Raihan — Portfolio

Production-focused personal portfolio for Shopify and custom website design and development, CRO, digital marketing, copywriting and commerce management.

## Current scope

- Responsive homepage
- Interactive `/work/` archive with 17 supplied storefront captures
- Interactive `/results/` evidence archive with 14 supplied Shopify and Meta dashboard captures
- Dedicated `/services/` page for Shopify, custom websites, digital marketing and connected commerce engagements
- Recruiter-focused `/experience/` page with the verified career record and education
- Dedicated `/contact/` page with secure Supabase-backed inquiry submission
- Authenticated `/admin/` content workspace with inquiry inbox and media uploads
- Mobile announcement slider with manual controls and autoplay
- Accessible interactive capabilities and experience sections
- Downloadable CV and direct contact links
- Search metadata, Person structured data, robots.txt and sitemap.xml
- Lightweight static delivery with Supabase Auth, Postgres, Storage and row-level security

## Frontend routes

- `/work/` — interactive project index with one active auto-scrolling preview
- `/work/[slug]/` — case studies with auto-scrolling website screenshots
- `/results/` — verified advertising, store performance and organic search-attribution evidence
- `/services/` — Shopify, custom website development, digital marketing, UX, CRO, copywriting and ongoing management
- `/experience/` — career chronology, role responsibilities, technical background and recruiter summary
- `/contact/` — hiring and project inquiry page with validated database submission
- `/admin/` — owner-only content, portfolio, results, media and inquiry management

## Content management

The public pages keep complete static fallback content for resilience and search visibility, then hydrate published records from Supabase. The admin manages global settings, page copy, services, experience, projects, evidence, uploaded media and contact submissions. Authentication and database authorization are enforced by Supabase Auth and row-level security; the service-role key is never shipped to the browser.

The authorized owner email is `mdaminulhoqueraihan@gmail.com`. On the first visit to `/admin/`, use “First-time account setup,” confirm the Supabase email if requested, then sign in.

## Deployment notes

The current canonical URL and sitemap use the active preview domain. Replace them with the final production domain when the Vercel project or custom domain is connected.
