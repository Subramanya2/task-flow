# TaskFlow: Real-time Collaborative Task Manager

TaskFlow is a premium, real-time collaborative task manager built for modern teams. It allows users to create tasks, assign them to collaborators using their email address, and see updates in real-time across devices.

## 🚀 Live Demo
[https://task-flow-seven-sage.vercel.app/](https://task-flow-seven-sage.vercel.app/)

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js 14 (App Router) + React
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Next.js API Routes (Serverless)
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5 (Auth.js) with Google OAuth
- **Real-time:** Pusher Channels
- **Deployment:** Vercel

### Architecture Overview
- **Data Flow:** The application uses Server Components for initial data fetching and Client Components for interactive UI.
- **Authentication:** Sessions are managed via JWTs using NextAuth and synced with the database using the Prisma Adapter.
- **Real-time Sync:** When a task is created, updated, or deleted, the server triggers a Pusher event on a user-specific channel. Active clients connected to that channel receive the event and optimistically update their UI.
- **"Pending Assignment" Logic:** If you assign a task to an email address that isn't registered, the system saves the email on the task. Upon the new user's first login, the system automatically checks for pending tasks tied to their email and claims them.

---

## 🏃 Setup Instructions (Under 5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL database (e.g., Neon free tier)
- Google Cloud Console account (for OAuth)
- Pusher account (free tier)

### 1. Clone the repository
```bash
git clone <repository-url>
cd task-flow-manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the `.env.example` file to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
Ensure you provide:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `AUTH_SECRET`: Generate one using `npx auth secret`.
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`: From your Google Cloud Console.
- `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_APP_ID`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_CLUSTER`: From your Pusher Dashboard.

### 4. Database Setup & Seeding
Push the schema to your database and seed it with sample data:
```bash
npx prisma db push
npm run db:seed
```

### 5. Run the Application
```bash
npm run dev
```
Visit `http://localhost:3000`.

---

## 🧪 Testing

Run the included component tests (using Vitest and React Testing Library):
```bash
npm run test
```

---

## 📈 Assumptions & Trade-offs

- **Real-time approach:** I opted for Pusher instead of native WebSockets (like Socket.io). Since Next.js API routes run in serverless environments (like Vercel), maintaining stateful WebSocket connections is not feasible without a separate persistent server. Pusher handles the socket infrastructure gracefully.
- **Task Assignment:** I assumed assignments are 1-to-1. A task has one creator and one assignee. For a more robust enterprise app, a many-to-many relationship might be preferred, but a 1-to-1 model keeps the UI clean and the logic straightforward for this assignment.
- **Priority over custom labels:** To keep the UI fast and standard, I implemented a fixed set of Priorities (Low, Medium, High, Urgent) instead of custom text labels.

## 🔮 Known Limitations & What's Next

- **Notification History:** Currently, real-time toasts appear when a task is assigned, but there is no persistent notification center drop-down. I would add a `Notification` model to the DB.
- **Task Comments:** Collaborators cannot chat on tasks. I would add a `Comment` model linked to the Task.
- **Drag-and-Drop:** Implementing a Kanban board view with `dnd-kit` would be a great addition to the list view.

---

## 🤖 AI Usage

I utilized AI (Claude 3.5 Sonnet / Gemini 3.1 Pro) during the development of this application:

- **What I used AI for:** Brainstorming the database schema, generating boilerplate for shadcn/ui components (since the CLI failed due to network issues), and scaffolding the Vitest testing setup.
- **What I reviewed and changed manually:** I heavily customized the generated UI components to ensure the design met the "Premium Feel" requirements, including hand-crafting the dark mode color palette and custom animations.
- **Example where I disagreed with AI:** The AI suggested using `setInterval` polling for real-time updates as a simpler alternative to WebSockets. I disagreed because polling places unnecessary load on the database and isn't truly real-time. Instead, I manually implemented Pusher Channels for an event-driven architecture, ensuring instantaneous updates and lower database overhead.
