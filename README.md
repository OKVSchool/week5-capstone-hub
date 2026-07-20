# VSchool Week 5 Capstone

Next.js app for documenting past, in-progress, and future coding projects


## What is being done to meet assignment requirements (✔️ = Completed)

- 1. App Router scaffold — TypeScript, app/ directory, 3+ routes - ✔️

- 2. API route (GET) — JSON endpoint your list consumes - ✔️

- 3. Server-rendered list — no useEffect on the list page - ✔️

- 4. Client filter, sort, or search — "use client" component - ✔️

- 5. Dynamic detail route — [id] page linked from list - ✔️

- 6. Full CRUD — POST, update, delete on API + matching UI - ✔️

- 7. Shared layout + loading.tsx + error.tsx on detail - ✔️

- 8. Deployed to Vercel — public URL - ✔️

- 9. Four-states fetch — separate client widget (not your main list) - ✔️

- 10. Security review — README section on XSS / raw HTML - ✔️

- 11. Consistent TypeScript types — one entity interface everywhere - ✔️

- 12. One advanced feature — Dynamic OG image (`/projects/[id]/opengraph-image.tsx`) generates a unique social preview card per project using `ImageResponse` from `next/og` - ✔️


## Stretch — not required, attempt only after all 12 pass

- Environment variable in production — used in server code only

- Server-side validation — API returns 4xx + UI shows error

- Optimistic UI — update before server confirms, rollback on fail

- Cache control — revalidate or tag invalidation

- Nested layout — route group with sidebar or sub-nav

- Auth sketch — mock signed-in gate, no real OAuth


## What is deliberately missing

- Project Ideas, References, and Settings tabs are placeholders — content arrives in a later milestone.
- CRUD data lives in an in-memory store (`src/lib/store.ts`). Added or edited projects reset whenever the app redeploys or the server goes cold. A hosted database (Postgres via Prisma) replaces this in Milestone 3.

## Security - XSS
- This app protects against XSS using the following:
    -React escapes all values rendered in JSX by default. Curly-brae expressions like {project.title} are always treated as text, never as HTML.

    - No dangerouslySetHTML is used anywhere in the codebase.
    
    - User input from the search box and add-project form never touches the DOM as raw HTML