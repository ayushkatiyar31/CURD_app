# JSONPlaceholder Next.js CRUD

A complete Next.js App Router CRUD application using JSONPlaceholder users endpoints with Axios, TypeScript strict mode, Tailwind CSS, and full optimistic UI updates.

## Stack

- Next.js 16.2.4 App Router
- React 19.2.5
- TypeScript strict mode
- Axios with request/response interceptors
- Tailwind CSS 4
- Functional components and modern React hooks

## Folder Structure

```txt
app/
  layout.tsx
  page.tsx
  globals.css
  users/
    layout.tsx
    page.tsx
    [id]/
      page.tsx
components/
  page-shell.tsx
  toast-provider.tsx
  user-details.tsx
  users-list.tsx
  users-store-provider.tsx
hooks/
  use-users-api.ts
lib/
  axios.ts
types/
  user.ts
```

## Features

- `/users` fetches and displays users from `GET /users`.
- `/users/[id]` fetches details from `GET /users/:id`.
- Updates use optimistic UI first, then `PUT /users/:id`, with rollback on failure.
- Deletes redirect to `/users` immediately, then call `DELETE /users/:id`, with restore and error toast on failure.
- Axios interceptors log requests, attach a client header, and handle global API errors.
- Toast notifications and delete confirmation are included.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000/users`.

## Build

```bash
npm run build
```

## Vercel Deployment

1. Push this project to a GitHub, GitLab, or Bitbucket repository.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep the framework preset as **Next.js**.
4. Use the default build command: `npm run build`.
5. Use the default output settings; no backend or environment variables are required.
6. Deploy.
