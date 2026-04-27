import { PrismaClient, TaskStatus, Priority } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "collaborator@example.com" },
    update: {},
    create: {
      email: "collaborator@example.com",
      name: "Jane Collaborator",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    },
  });

  console.log(`👤 Created users: ${user1.name}, ${user2.name}`);

  // Create sample tasks
  const tasks = [
    {
      title: "Design landing page",
      description: "Create a modern landing page with hero section, feature highlights, and call-to-action buttons.",
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      creatorId: user1.id,
      dueDate: new Date("2025-02-01"),
    },
    {
      title: "Set up authentication",
      description: "Implement Google OAuth using NextAuth.js with Prisma adapter for database sessions.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      creatorId: user1.id,
      dueDate: new Date("2025-02-05"),
    },
    {
      title: "Build task CRUD API",
      description: "Create RESTful API endpoints for creating, reading, updating, and deleting tasks.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      creatorId: user1.id,
      assigneeId: user2.id,
      assigneeEmail: user2.email,
      dueDate: new Date("2025-02-10"),
    },
    {
      title: "Add real-time notifications",
      description: "Integrate Pusher for real-time task assignment notifications and UI updates.",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      creatorId: user1.id,
      dueDate: new Date("2025-02-15"),
    },
    {
      title: "Write unit tests",
      description: "Add comprehensive tests for API routes and core business logic.",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      creatorId: user2.id,
      assigneeId: user1.id,
      assigneeEmail: user1.email,
      dueDate: new Date("2025-02-20"),
    },
    {
      title: "Deploy to Vercel",
      description: "Configure production environment, set up environment variables, and deploy the application.",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      creatorId: user2.id,
      dueDate: new Date("2025-02-25"),
    },
    {
      title: "Review PR for dashboard",
      description: "Review pull request for the dashboard statistics component and approve for merge.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      creatorId: user2.id,
      assigneeId: user1.id,
      assigneeEmail: user1.email,
    },
    {
      title: "Optimize database queries",
      description: "Add proper indexes and optimize N+1 query patterns in the task listing endpoint.",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      creatorId: user1.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`✅ Created ${tasks.length} sample tasks`);
  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
