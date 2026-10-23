# Posts

A small React app for reading posts, built with TypeScript, Vite, and TanStack Query.

## Run locally

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The example configuration uses JSONPlaceholder to display demo posts.
Set `VITE_API_BASE_URL` in `.env.local` to use your own API, then restart Vite.
The app requests `GET /posts` under that URL. Without this environment variable,
it requests `/api/posts` on this site's origin, which needs a backend or reverse proxy.
This repository contains only the frontend. An API on another origin must allow
requests from your frontend through CORS. Vite environment variables are public,
so don't put secrets in them.

The response must be an array of posts:

```json
[
  { "id": 1, "title": "First post", "body": "Post content" }
]
```

The list includes loading, empty, and error states with a retry button. Posts
stay visible if a background refresh fails. Requests time out after 10 seconds
and support cancellation.

## Checks

```sh
npm test
npm run lint
npm run build
```

Tests cover list states, response validation, escaped content, and failed
background refreshes. They run locally without a live API. `npm run build`
checks TypeScript and writes the production files to `dist`. Use
`npm run preview` to inspect that build locally; production hosting must also
provide the configured API.

## Project layout

- `src/features/post`: post requests, query hook, and list component.
- `src/lib`: shared API client and class name helper.
- `src/components/ui`: shared shadcn button.
- `src/index.css`: global styles and theme.
- `tests`: component and API regression checks.
