# Project overview

This folder is the **front web app** of the budget app (see
`../.claude/CLAUDE.md` for the global presentation of the project). It consumes
the API in `../back/`. This file only covers the front: there is no need to
know more about the API internals here, only its routes and payloads.

- The active profile is sent to the API in the `X-Profile-Id` header
(see `src/api/client.ts`), and the API filters data on it.

## Stack

Vite, React 19, TypeScript, Mantine (UI and forms), React Router, TanStack
Query (API calls, cache), Zod (form validation), i18next (translations in
`src/i18n/locales/`). Tests use Vitest + Testing Library (jsdom), lint uses
oxlint. Code is organised by feature in `src/features/<feature>/`
(`api.ts`, `queries.ts`, components, `__tests__/`).

Node runs locally, from this folder: `npm run dev`, `npm run build`,
`npm test`, `npm run lint`. The API URL is set in `.env.local` (`VITE_API_URL`).

# Learning context

This project is a learning project: the user is using it to learn React
(and TypeScript / the React ecosystem: TanStack Query, Mantine, React Router).
The user is not a beginner: they already know JavaScript well. Skip basic
JavaScript explanations and focus on what is specific to React and its
ecosystem.

- After implementing something, explain the React concepts it relies on
  (e.g. hooks and their rules, state and re-renders, context, query keys and
  cache invalidation, controlled forms, ...): what they are, why they fit
  here, and how the pieces connect.
- When relevant, point to the official documentation
  (https://react.dev, https://www.typescriptlang.org/docs,
  https://tanstack.com/query/latest/docs, https://mantine.dev,
  https://reactrouter.com) with a link to the specific page, so the user can
  dig deeper.

# Coding guidelines

TODO
