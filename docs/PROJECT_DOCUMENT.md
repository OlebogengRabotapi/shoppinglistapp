# Task 5: Shopping List App, Master Project Document

One consolidated document covering the deliverables: **Design, Step-by-step planning, Pseudocode, UI implementation, Algorithms and README pointers.**

Contents
1. Problem statement and interpretation
2. Design (UX, visual system, wireframes, data model, architecture)
3. Step-by-step plan (with suggested commit sequence)
4. Pseudocode
5. UI implementation notes
6. Algorithms
7. Requirement traceability matrix
8. Security, privacy and known limitations
9. Test plan and results

---

## 1. Problem statement and interpretation

Build a ReactTS shopping list application using json-server for persistence and Redux for state, with proper navigation practice (protected routes, URL-driven state).

**Interpretation of an ambiguous requirement.** The brief says users "add a new shopping list" with name, quantity, notes, category and images. Those are item-level fields, but the brief also asks for sorting *lists* by category and says users "can add multiple shopping lists". The design therefore uses two levels:

- A **List** (e.g. "Weekly groceries") has a name, category, optional notes, and a share link.
- An **Item** (e.g. "Milk") belongs to a list and has name, quantity, optional notes, category and images.

Search and sort work at both levels, so every phrase in the brief is satisfied.

---

## 2. Design

### 2.1 Users and goals

| Persona | Goal | Key need |
| --- | --- | --- |
| Shopper on a phone in a store | Tick items off quickly | Large tap targets, checkbox per item |
| Planner on a laptop | Build several lists and organise by category | Search, sort, categories |
| Household member | See a list someone else made | Read-only share link, no account needed |

### 2.2 Visual system

- **Colour:** teal primary (#0f766e) with a soft teal tint for highlights; red for destructive actions; green, red and blue for toasts. All text meets contrast guidelines on its background.
- **Typography:** one font stack (Inter, falling back to system UI fonts), consistent scale: page title 1.5 to 1.85rem, section titles 1.1rem, body 1rem, helper text 0.85rem.
- **Interactivity:** every clickable element has `cursor: pointer` and a hover colour change; keyboard focus shows a visible ring; disabled buttons show `not-allowed`.
- **Feedback:** toast for every operation result, spinners while loading, inline field errors, empty states with a call to action, error states with retry.

### 2.3 Page map and navigation

```
Logged out:  /login  <->  /register           /shared/:shareId (anyone)
Logged in:   /  (My lists)  ->  /lists/:id (items)
             /profile
Navbar: brand | My Lists | Profile | Hi, name | Log out   (hamburger below 768px)
```

### 2.4 Wireframes (text)

**Home (`/`)**
```
+------------------------------------------------------+
| CartCraft          My Lists  Profile  Hi, Pkay [Log out]
+------------------------------------------------------+
| My shopping lists                          [+ New list]
| 2 lists
| [ Search lists by name...      x ]  Sort by [Newest v]
| +-----------+ +-----------+ +-----------+
| |[Groceries]| |[Household]| |           |
| | Weekly    | | Braai     | |           |
| | ====-- 2/3| | -------0/0| |           |
| |Open Edit Del |Open Edit Del|           |
| +-----------+ +-----------+ +-----------+
+------------------------------------------------------+
```

**List detail (`/lists/:id`)**
```
< All lists
Weekly groceries                  [Share] [+ Add item]
[Groceries] 1/3 bought
[ Search items by name... ]  Sort by [Name (A to Z) v]
[x] Milk                         x 2
    [Dairy & Eggs]  Added 25 Oct 2026
    notes... [img][img]          [Edit] [Delete]
```

**Auth pages:** centred card, title, subtitle, form, switch link. Errors appear above the form and under each field.

**Profile:** summary card (initials avatar, name, email, cell) above two cards: Personal details and Login details.

### 2.5 Responsive strategy (mobile first)

| Breakpoint | Changes |
| --- | --- |
| 320px (base) | Single column, hamburger menu, stacked toolbar, bottom-sheet modals, full-width toasts |
| 480px | Two-column form rows, centred modals, toasts move to the corner |
| 768px | Inline navbar, 2-column list grid, toolbar on one row, 2-column profile |
| 1024px | 3-column list grid, wider padding |

### 2.6 Data model

```
users  (id, email, passwordHash, name, surname, cellNumber, createdAt)
  1 --- * lists (id, userId, name, category, notes, shareId, isShared, createdAt, updatedAt)
              1 --- * items (id, listId, userId, name, quantity, notes, category,
                             images[], purchased, createdAt)
```

json-server endpoints used: `GET/POST /users`, `GET/PATCH /users/:id`, `GET/POST /lists`, `GET/PATCH/DELETE /lists/:id`, `GET/POST /items`, `PATCH/DELETE /items/:id`, with filters such as `/lists?userId=1` and `/lists?shareId=abc&isShared=true`.

### 2.7 Architecture

```
Pages -> Components -> hooks -> Redux store -> api layer -> json-server
                          |
                  URL (?q, ?sort) is the single source of truth for search/sort
```

- **Redux slices:** `auth` (user, session restore, profile and credential updates), `lists`, `items`, `shared` (public view), `toasts`.
- **Async thunks** perform every server call, dispatch a toast on success or failure, and return `rejectWithValue` messages for forms.
- **The user object in Redux never contains the password hash.**
- **Route-level code splitting** (`React.lazy`) keeps the first load small.

---

## 3. Step-by-step plan

Suggested commit sequence (one commit per step keeps the GitHub evaluation criterion satisfied):

| # | Step | Commit message |
| --- | --- | --- |
| 1 | Create Vite React-TS project, install dependencies, add `db.json` and scripts | `chore: scaffold project with vite, redux, router, json-server` |
| 2 | Types, constants, utilities (validation, crypto, sorting, formatting) | `feat: add types and utility modules` |
| 3 | API layer for users, lists, items | `feat: add json-server api layer` |
| 4 | Redux store and slices | `feat: add redux store with auth, lists, items, toasts` |
| 5 | Reusable UI components and global CSS | `feat: add reusable ui components and design system` |
| 6 | Routing with ProtectedRoute and PublicOnlyRoute | `feat: add routing and route guards` |
| 7 | Register and Login pages with hashing | `feat: add registration and login with bcrypt` |
| 8 | Home page: list CRUD | `feat: add shopping list CRUD` |
| 9 | List detail: item CRUD with images | `feat: add item CRUD with image upload` |
| 10 | URL-driven search and sort (`useListControls`) | `feat: add url-based search and sorting` |
| 11 | Profile page | `feat: add profile and credential management` |
| 12 | Sharing and shared view | `feat: add read-only list sharing` |
| 13 | Responsive polish, accessibility, empty/error states | `style: responsive and accessibility pass` |
| 14 | README and docs, then open the pull request | `docs: add readme and project document` |

Git workflow: work on `feature/shopping-list-app`, commit after every step, push after each commit, and open a pull request into `main` when done.

---

## 4. Pseudocode

### 4.1 Registration
```
function register(form):
    errors = validate(form)            // names present, email format, SA cell, password rules, match
    if errors not empty: show field errors; stop
    email = lowercase(trim(form.email))
    if GET /users?email=email returns a user: reject "already exists"
    hash = bcrypt.hash(form.password, 10 rounds)
    user = POST /users { email, hash, name, surname, cell, createdAt }
    save user.id as session
    store user WITHOUT hash in Redux
    toast success; router redirects to home
```

### 4.2 Login
```
function login(email, password):
    user = GET /users?email=lowercase(email)
    if no user OR not bcrypt.compare(password, user.hash):
        reject "Incorrect email or password"     // same message for both
    save user.id as session
    store user WITHOUT hash in Redux
    toast welcome
```

### 4.3 Session restore (on page load)
```
auth.initialising = (saved session id exists)
if saved id: user = GET /users/id; on failure clear session
auth.initialising = false
```

### 4.4 Route guards
```
ProtectedRoute:
    if auth.initialising: show spinner
    if no user: redirect /login
    else render child route
PublicOnlyRoute:
    if auth.initialising: show spinner
    if user: redirect /
    else render child route
```

### 4.5 URL-driven search and sort
```
state searchInput (what is typed)
term = URL param q or ""
sort = resolveSort(URL param sort)          // invalid -> default

on URL change (typed by hand, back/forward): searchInput = term
on searchInput change: wait 250 ms; if trimmed != term: set URL q (replace history)
on sort change: set URL sort (omit if default)

visible = sortRecords(filterByName(records, term), sort)
```

### 4.6 List CRUD
```
load:   GET /lists?userId=me, GET /items?userId=me   // items give counts per list
create: POST /lists {name, category, notes, shareId=random, isShared=false, dates}; toast
edit:   PATCH /lists/id {changes, updatedAt}; toast
delete: items = GET /items?listId=id; DELETE each; DELETE /lists/id; toast
        reducer removes list and its items from state
```

### 4.7 Item CRUD
```
add:    validate name and 1..999 whole quantity; POST /items {..., purchased=false}
edit:   PATCH /items/id
toggle: PATCH /items/id {purchased: !purchased}   // silent, no toast
delete: DELETE /items/id
```

### 4.8 Image handling
```
function compressImage(file):
    reject if not an image
    img = load(file as data URL)
    scale = min(1, 480 / max(img.width, img.height))
    draw img on a canvas of scaled size
    return canvas.toDataURL('image/jpeg', 0.72)
```

### 4.9 Sharing
```
share on:  PATCH /lists/id {isShared: true}; show link origin + /shared/ + shareId
share off: PATCH /lists/id {isShared: false}
open link: GET /lists?shareId=x&isShared=true
           if none: "no longer shared"
           else GET /items?listId=list.id; render read-only (no controls)
```

---

## 5. UI implementation notes

- **Reusable components, customised through props:** `Button` (variant, size, loading, fullWidth), `TextField`/`SelectField`/`TextAreaField` (label, error, hint), `Modal`, `ConfirmDialog`, `SearchSortBar`, `ItemCard` (`readOnly` prop reuses the same card on the shared page), `ListForm`/`ItemForm` (`initial` prop reuses the form for create and edit).
- **React state** is used for local form values and dialogs; **Redux** for shared data; **props** pass data down and callbacks up.
- **Accessibility:** labelled inputs, `aria-invalid` and `aria-describedby` for errors, `role="alert"` and `aria-live` for feedback, modal with focus handling and Escape to close, visible focus ring, reduced-motion support.
- **Performance:** route code splitting, `useMemo` for filtering and sorting, debounced search, compressed images, lazy-loaded item images.
- **Naming:** camelCase variables, self-explanatory names, small functions, comments where behaviour is not obvious.

---

## 6. Algorithms

### 6.1 Filtering by name
Case-insensitive substring match on the trimmed keyword. Time O(n).

### 6.2 Sorting
```
compare(a, b, sort):
    name:     localeCompare(a.name, b.name, base sensitivity, numeric)
    category: localeCompare(category) then name as tie-break
    date:     time(a.createdAt) - time(b.createdAt)
    result * (+1 for asc, -1 for desc)
```
Sorting copies the array first (never mutates Redux state). Time O(n log n). `localeCompare` with numeric mode gives natural order ("Item 2" before "Item 10").

### 6.3 Sort validation
A URL value is accepted only if it matches one of six known options; otherwise the default (`date-desc`) is used, so a hand-edited URL can never break the page.

### 6.4 Password hashing
bcrypt with a per-password random salt and 10 cost rounds. The hash embeds the salt and cost, so verification is `compare(typed, storedHash)`. The same plain password produces a different hash each time.

### 6.5 Share id
12 characters from `crypto.getRandomValues`, giving an unguessable identifier.

### 6.6 Cascade delete
Deleting a list first deletes its items in parallel, then the list, avoiding orphaned items.

---

## 7. Requirement traceability

| Requirement | Where it is met |
| --- | --- |
| Login, Register, Home, Profile pages | `src/pages/*` |
| Register with email, password, name, surname, cell | `RegisterPage`, `validation.ts` |
| Credentials encrypted on sign-up, verified on login | `crypto.ts` (bcrypt), `api/users.ts` |
| Protected routing both directions | `RouteGuards.tsx`, `App.tsx` |
| View and update profile, update login credentials | `ProfilePage`, `ProfileForms.tsx`, `authSlice` |
| Add, read, update, delete lists and items | `HomePage`, `ListDetailPage`, slices |
| Name, quantity, notes, category, images | `ItemForm`, `ImagePicker` |
| Search by name, shown in URL, URL updates page | `useListControls`, `SearchSortBar` |
| Sort by name, category, date; shown in URL | `sorting.ts`, `useListControls` |
| Categories | `constants/CATEGORIES`, select fields, badges |
| Share lists | `ShareDialog`, `SharedListPage` |
| JSON server persistence | `db.json`, `api/*` |
| Redux state management | `store/*` |
| Performance | lazy routes, memoisation, debounce, image compression |
| Notifications | `toastSlice`, `ToastContainer` |
| Hover and cursor feedback | `styles.css` |
| Responsive at 320, 480, 768, 1024 | `styles.css` breakpoints |
| README | `README.md` |

---

## 8. Security, privacy and limitations

- Passwords are hashed with bcrypt and never stored in plain text or in Redux.
- Generic login errors prevent account enumeration.
- Data minimisation: only name, surname, email and cell number are collected (relevant to POPIA).
- Shared links are view-only and revocable.
- Users can only open their own lists (ownership check on the detail page).

**Limitations:** json-server has no server-side authentication, so authorisation is enforced in the client and the API is open to anyone who can reach it. Hashing in the browser is acceptable for a training project but a production system must hash on the server and use sessions or JWT. Images are stored as compressed data URLs inside `db.json`, which is fine for a demo but should move to object storage in production.

---

## 9. Test plan and results

An automated browser run (Playwright, Chromium) against a live json-server and the production build passed every check:

| Check | Result |
| --- | --- |
| Logged-out `/` redirects to `/login` | Pass |
| Register, then land on Home | Pass |
| Stored password is a bcrypt hash, plain text absent | Pass |
| Logged-in user visiting `/login` is sent Home | Pass |
| Create two lists | Pass |
| Search filters lists and writes `?q=` | Pass |
| `?sort=name-asc` applied from the URL; invalid sort tolerated | Pass |
| Add three items, sort by name and by category (desc), search items | Pass |
| Share link works while logged out, read-only (no checkboxes) | Pass |
| `/profile` protected when logged out | Pass |
| Wrong password rejected; correct login works | Pass |
| Session survives reload | Pass |
| Delete a list | Pass |
| Profile update shows success toast | Pass |
| No horizontal scroll at 320, 480, 768, 1024px | Pass |
| Browser console errors | None |

Manual checklist for your own demo: register a second user and confirm they cannot open the first user's `/lists/:id`; edit the URL query by hand and watch the page update; stop json-server and confirm the friendly error message appears.
