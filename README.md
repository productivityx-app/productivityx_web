# ProductivityX

All-in-one productivity platform combining notes, tasks, calendar, pomodoro timer, and AI assistance into a seamless experience.

Built with React 19, TypeScript, Vite 6, Tailwind CSS v4, and shadcn/ui.

## Features

- **Notes** — Markdown editor with live preview, board/grid/list views, tags, and auto-save
- **Tasks** — Kanban board with drag-and-drop, list view, calendar view, subtasks, and bulk actions
- **Calendar** — Month, week, day, and agenda views with event management, date-range picker, and interactive date/time pickers
- **Pomodoro Timer** — Configurable focus/break sessions, stats, heatmaps, and achievements
- **AI Assistant** — Streaming chat with conversation history and context-aware suggestions
- **Unified Search** — Full-text search across notes, tasks, events, and conversations
- **i18n** — English, French, and Arabic (RTL) support
- **Dark Mode** — System-aware theme with accent color customization
- **Dashboard** — At-a-glance widgets for tasks, events, notes, and focus stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite 6 |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI + shadcn/ui |
| Date/Time Picker | Flatpickr |
| State | Zustand |
| Server State | TanStack React Query |
| Routing | React Router v7 |
| Forms | react-hook-form + Zod |
| Animation | Framer Motion |
| i18n | i18next |
| HTTP | Axios |
| Charts | Recharts |
| Drag & Drop | dnd-kit |

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with API/WebSocket proxied to the backend.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build to `dist/public` |
| `npm run serve` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

## License

Non-Commercial Source Available License. See [LICENSE](LICENSE) for details.
