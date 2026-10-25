# CartCraft: Shopping List App

A responsive shopping list application built with **React, TypeScript, Redux Toolkit, React Router and json-server** (Task 5, React Lesson 5). Users register, log in, create multiple shopping lists, add items with categories, notes and images, search and sort through the URL, and share lists through a read-only link.

> The complete design, step-by-step plan, pseudocode and algorithm write-up is in [`docs/PROJECT_DOCUMENT.md`](docs/PROJECT_DOCUMENT.md).

## Features

| Area | What it does |
| --- | --- |
| Authentication | Register (email, password, name, surname, cell number) and log in. Passwords are hashed with **bcrypt** before they are stored; login verifies the typed password against the hash. |
| Authorisation | Protected routes: logged-out visitors cannot see Home, List or Profile; logged-in users cannot see Login or Register. |
| Profile | View profile, update name, surname and cell number, change email and/or password (requires the current password). |
| Shopping lists | Create, view, edit and delete lists (name, category, notes). Deleting a list deletes its items. |
| Items | Add, view, edit, delete items (name, quantity, optional notes, category, up to 3 images) and tick items off as bought. |
| Search | Search lists (Home) or items (inside a list) by name. The keyword is in the URL as `?q=`. |
| Sorting | Sort by name, category or date added, ascending or descending. The sort is in the URL as `?sort=`. |
| URL listening | Editing the URL by hand, or using back/forward, updates the page. Invalid sort values fall back to the default. |
| Sharing | Turn sharing on to get a public, **read-only** link (`/shared/:shareId`). Turn it off at any time. |
| Feedback | Toast notifications for every background process and result, loading spinners, empty and error states. |
| Responsive | Tested at 320px, 480px, 768px and 1024px with no horizontal scrolling. |

## Tech stack

- React 18 + TypeScript (strict mode), Vite
- Redux Toolkit (`createAsyncThunk` for all server calls), React Redux
- React Router v6 (nested routes, route guards, `useSearchParams`)
- json-server (REST persistence), bcryptjs (password hashing)
- Plain CSS (mobile-first, CSS variables)

## Getting started

```bash
git clone <your-repo-url>
cd shopping-list-app
npm install
npm start          # runs json-server (port 3001) and Vite (port 5173) together
```

Open <http://localhost:5173>.

Run them separately if you prefer:

```bash
npm run server     # json-server on http://localhost:3001 (data in db.json)
npm run dev        # Vite dev server
```

Other scripts: `npm run build` (type-check and production build), `npm run lint` (type-check only), `npm run preview`.

To point the app at a different API, create `.env.local` with `VITE_API_URL=http://localhost:3001`.

## Project structure

```
src/
  api/          fetch wrapper + users/lists/items REST calls
  components/
    ui/         Button, form fields, Modal, ConfirmDialog, feedback, toasts
    layout/     Navbar, AppLayout
    routing/    ProtectedRoute, PublicOnlyRoute
    lists/      ListCard, ListForm, ShareDialog
    items/      ItemCard, ItemForm, ImagePicker
    controls/   SearchSortBar
    profile/    ProfileDetailsForm, CredentialsForm
  hooks/        useListControls (URL-driven search + sort)
  pages/        Login, Register, Home, ListDetail, Profile, SharedList, NotFound
  store/        configureStore, typed hooks, slices (auth, lists, items, shared, toasts)
  utils/        validation, crypto, sorting, image compression, formatting
  constants/    categories, sort options, config
  types/        shared TypeScript types
```

## Routes

| Path | Access | Page |
| --- | --- | --- |
| `/login`, `/register` | Logged-out only | Auth forms |
| `/` | Logged-in only | My lists (`?q=` and `?sort=`) |
| `/lists/:listId` | Logged-in, owner only | Items in a list (`?q=` and `?sort=`) |
| `/profile` | Logged-in only | Profile and login details |
| `/shared/:shareId` | Everyone | Read-only shared list |

Valid sort values: `date-desc` (default), `date-asc`, `name-asc`, `name-desc`, `category-asc`, `category-desc`.
Example: `/lists/1?q=milk&sort=name-asc`.

## Data model (db.json)

- `users`: `id, email, passwordHash, name, surname, cellNumber, createdAt`
- `lists`: `id, userId, name, category, notes, shareId, isShared, createdAt, updatedAt`
- `items`: `id, listId, userId, name, quantity, notes, category, images[], purchased, createdAt`

## Security and privacy notes

- Plain-text passwords are never stored or kept in Redux; only a bcrypt hash is saved, and the hash is stripped from the user object held in the client.
- Login errors are generic ("Incorrect email or password") so account existence is not revealed.
- Only the minimum personal data needed (name, email, cell number) is collected, and users can update it at any time.
- Shared links expose only the list and its items, never user details, and sharing can be revoked.

**Limitation (honest note):** json-server is a development tool with no real server-side authentication, so route protection and ownership checks are enforced in the client. A production version needs a real backend with sessions or JWT, server-side authorisation, and hashing on the server. This matters for POPIA compliance, so do not use real customer data with this setup.

## Testing

The app was verified end to end in a real browser (register, login, CRUD, search and sort through the URL, sharing, route protection, session persistence, and no horizontal scroll at 320, 480, 768 and 1024px).

## Submission checklist

- [ ] Push frequent commits (one per feature)
- [ ] Open a **pull request** on GitHub (a repo without a PR does not count)
- [ ] Include design, plan, pseudocode and algorithm (see `docs/PROJECT_DOCUMENT.md`)
