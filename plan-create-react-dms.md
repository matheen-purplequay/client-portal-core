I want you to create a new React project called DMS (Document Management System).
This app will be embedded as a custom element inside an existing Flask project (server-rendered HTML pages), NOT run standalone.

## Critical constraint: the host Flask project uses Bootstrap

The parent Flask project already bootstraps its own pages with Bootstrap CSS/JS. DMS's Tailwind CSS must NOT leak out and interfere with the host page's Bootstrap styling, and the host page's Bootstrap styles must NOT leak into DMS and override its Tailwind styling. This has to work in both directions.

The reference project already solves this — that's the main reason it uses the shadow-DOM + inline-style-injection pattern described below, instead of a plain `<div id="root">` mount with a normal `<link rel="stylesheet">`. A shadow root is a hard CSS boundary: styles injected inside it (including Tailwind's preflight/base reset, which normally resets global tags like `button`, `input`, `h1`-`h6` etc.) only apply to elements inside that shadow tree, and outside styles (Bootstrap's global resets/classes on the host page) cannot cross into it either. Replicate this faithfully — do not simplify it down to a normal top-level Tailwind `<link>` or a plain mount div, since that would break the isolation and cause Tailwind's preflight to reset Bootstrap's styles on the rest of the Flask page (or vice versa).

## What DMS does (v1 scope)

1. Users can upload files to a common server.
2. The app organizes uploaded files into a specified folder structure (folders/subfolders, not just a flat file list).
3. Users can preview each file (e.g. images inline, PDFs in a viewer, fallback to a download/open link for unsupported types).

Do not build anything beyond upload, folder organization, and preview for v1 — no versioning, sharing, permissions, search, etc. unless I ask for it later.

## Reference project — study this first

I'm giving you an existing React project at:
`<REFERENCE_PROJECT_PATH>`

I only care about ONE thing from this reference: the embedding pattern in its entry file at
`<REFERENCE_PROJECT_PATH>/src/main.tsx`

Read that file carefully before writing any code. Do not copy its business logic, components, Redux store, or feature code — only replicate the embedding/bootstrapping pattern. Specifically, note:

- It defines a custom element (Web Component) via `class MyReactWidget extends HTMLElement` and `customElements.define(tagName, MyReactWidget)`, wrapped in `if (!customElements.get(tagName))` so it's safe to load more than once.
- `connectedCallback()` wraps its logic in a `setTimeout(..., 0)` to let the host page/framework finish setting attributes before mounting.
- It reads a `user-data` HTML attribute off the custom element, JSON-parses it defensively (try/catch, logs on failure), and also reads a query param from `window.location.search` (in the reference it's `job_id`) — both get passed as props into the root React component.
- It attaches a **shadow DOM** (`this.attachShadow({ mode: 'open' })`, reused via `this.shadowRoot ||`) so the app's styles never leak into or get overridden by the host Flask page.
- Inside the shadow root it manually injects CSS as `<style>` tags — Tailwind is built and inlined via `?inline` imports (e.g. `import tailwind from './tailwind.css?inline'`) plus a separate app stylesheet — instead of relying on a normal `<link>`, because normal stylesheet links don't pierce the shadow boundary.
- It creates a mount `<div>` inside the shadow root and calls `ReactDOM.createRoot(mountPoint).render(<App {...passedData} />)`.
- At the bottom, there's a **dev preview block**: if a `#root` element exists in the page (i.e. you're running `vite dev` standalone, not embedded in the host), it programmatically creates the custom element, sets a `user-data` attribute with seed/mock data, and appends it — so the widget can be developed and previewed in isolation before being embedded.
- The Vite build config (see `<REFERENCE_PROJECT_PATH>/src/vite.config.ts`) uses `vite-plugin-css-injected-by-js` and pins a fixed output filename (e.g. `rollupOptions.output.entryFileNames`/`assetFileNames` set to something like `assets/query-widget.js` / `assets/query-widget.css`) so the host Flask app can reference a stable, predictable script/style URL rather than a hashed filename.

## What I need you to build

### 1. Project setup
- New Vite + React + TypeScript project.
- Use `@vitejs/plugin-react-swc` and `vite-plugin-css-injected-by-js`, matching the reference's build approach so all CSS ends up inlined into the JS bundle (required because we're injecting styles into a shadow root manually, not relying on `<link>` tags).
- Tailwind CSS for styling (match the reference's Tailwind v4 setup with `@tailwindcss/vite` or `@tailwindcss/postcss`, whichever it's actually using — check the reference's `package.json`, `postcss.config.cjs` / vite config, and `tailwind.config.ts` and mirror that setup).
- Configure `vite.config.ts` build output with a **fixed, predictable filename** for the JS and CSS bundles (e.g. `assets/dms-widget.js` / `assets/dms-widget.css`) instead of the default content-hashed names, so the Flask template can reference a stable URL.

### 2. Embeddable entry point (`src/main.tsx`)
Recreate the same pattern as the reference file, adapted for DMS:
- Custom element tag name: `dms-widget` (or a name you think fits better — tell me what you chose).
- Register it as a Web Component with a shadow DOM, guarded by `customElements.get(tagName)`.
- In `connectedCallback`, defer with `setTimeout(..., 0)`, then read whatever attributes the host Flask page needs to pass in — at minimum:
  - A `user-data` attribute (JSON string) for current-user/auth context, parsed defensively like the reference does.
  - Any config needed to know **where to upload/list files** — e.g. an `api-base-url` attribute and/or a `folder-path` / `root-folder` attribute — since Flask will tell the widget which backend endpoint and which folder scope to operate in. Design these as HTML attributes on the custom element, mirroring how `user-data` is read in the reference.
- Inject Tailwind + app CSS into the shadow root exactly like the reference (via `?inline` imports and `<style>` tags).
- Mount the root `<App />` component inside the shadow root, passing the parsed attributes as props.
- Include the same dev-preview fallback block (checking for a `#root` div, creating the custom element with mock/seed attributes) so the app can be developed and visually tested standalone via `vite dev`, without needing the Flask host.

### 3. Application logic (this part is NOT in the reference — design it fresh)
Build the actual DMS feature on top of that shell:
- **Upload**: a file upload UI (drag-and-drop + file picker), calls a backend API endpoint to upload files. Assume the backend endpoint URL is configurable (passed in via the custom element's attributes, as above) since the real backend will be provided by the Flask project — stub/mock it if no real API is available yet, but structure the API calls behind a small service layer so swapping in the real endpoint later is a one-line change.
- **Folder structure**: a UI for browsing/organizing files into folders (e.g. a tree or breadcrumb + list view). Files should be organized under folders when uploaded (e.g. upload target = current folder). Ask me for the specific folder-structure rules if they're not obvious from context — don't assume a deep nested taxonomy unless I confirm it.
- **Preview**: clicking a file opens a preview (images render inline, PDFs use a viewer or `<iframe>`/`<embed>`, other types fall back to a download/open-in-new-tab action).
- Keep state management simple (React state/context) unless the file/folder tree genuinely needs something like Redux — don't add Redux, Tiptap, MUI charts, or other reference-project dependencies just because the reference had them. Only pull in what DMS actually needs.

## Constraints — follow these strictly

- Do not add features beyond upload, folder organization, and preview. No auth system, no sharing/permissions, no versioning, no search — v1 only.
- Don't over-engineer: no premature abstractions, no speculative config options, no unused feature flags.
- Don't invent backend API contracts silently — if the shape of the upload/list/preview endpoints isn't specified, propose a small, sensible REST contract (e.g. `POST /upload`, `GET /folders`, `GET /files/:id`) and confirm it with me before wiring up a lot of code around it, since a real Flask backend has to match it.
- If any requirement here is ambiguous or the implementation is getting complex, stop and present me a short plan before writing code, rather than guessing.
- Do not touch or assume anything about the Flask host project's authentication or CORS setup — just design the widget to receive whatever config it needs via HTML attributes, the same way the reference receives `user-data`.
- Do not weaken the shadow-DOM style isolation for convenience (e.g. don't disable Tailwind's `preflight` as a shortcut, and don't move any stylesheet to a normal document-level `<link>`). The isolation must hold in both directions against the host page's Bootstrap styles.

## Where to build it

Create the new project in this current folder where I have opened vs code in:

Start by reading `<REFERENCE_PROJECT_PATH>/src/main.tsx` and `<REFERENCE_PROJECT_PATH>/src/vite.config.ts`, summarize the embedding pattern back to me in a few sentences to confirm you understood it, then propose your plan for the DMS project structure before generating code.

