import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data (order matters due to foreign keys)
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // ── Users (1 OWNER + 4 MEMBERs) ──────────────────────────────
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ahmed Haridy",
        username: "ahmed_owner",
        email: "ahmed@curt.dev",
        password: hashedPassword,
        role: "OWNER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sara Hassan",
        username: "sara_h",
        email: "sara@curt.dev",
        password: hashedPassword,
        role: "MEMBER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Omar Khaled",
        username: "omar_k",
        email: "omar@curt.dev",
        password: hashedPassword,
        role: "MEMBER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Nour Ali",
        username: "nour_a",
        email: "nour@curt.dev",
        password: hashedPassword,
        role: "MEMBER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Youssef Mostafa",
        username: "youssef_m",
        email: "youssef@curt.dev",
        password: hashedPassword,
        role: "MEMBER",
      },
    }),
  ]);

  const [ahmed, sara, omar, nour, youssef] = users;
  console.log(`👤 Created ${users.length} users (1 owner, 4 members)`);

  // ── Projects (5, all owned by the OWNER) ─────────────────────
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Curt Platform",
        description: "Main task-management platform for Curt",
        ownerId: ahmed.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Mobile App",
        description: "Cross-platform mobile client for Curt",
        ownerId: ahmed.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Landing Page",
        description: "Marketing website and landing page redesign",
        ownerId: ahmed.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "API Gateway",
        description: "Centralized API gateway and rate-limiting service",
        ownerId: ahmed.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Analytics Dashboard",
        description: "Internal analytics and reporting dashboard",
        ownerId: ahmed.id,
      },
    }),
  ]);

  const [curtPlatform, mobileApp, landingPage, apiGateway, analytics] =
    projects;
  console.log(`📁 Created ${projects.length} projects`);

  // ── Project Members (6 memberships) ──────────────────────────
  const memberships = await Promise.all([
    // Curt Platform – Sara & Omar
    prisma.projectMember.create({
      data: { projectId: curtPlatform.id, userId: sara.id },
    }),
    prisma.projectMember.create({
      data: { projectId: curtPlatform.id, userId: omar.id },
    }),
    // Mobile App – Omar & Nour
    prisma.projectMember.create({
      data: { projectId: mobileApp.id, userId: omar.id },
    }),
    prisma.projectMember.create({
      data: { projectId: mobileApp.id, userId: nour.id },
    }),
    // Landing Page – Youssef
    prisma.projectMember.create({
      data: { projectId: landingPage.id, userId: youssef.id },
    }),
    // API Gateway – Sara & Youssef
    prisma.projectMember.create({
      data: { projectId: apiGateway.id, userId: sara.id },
    }),
    prisma.projectMember.create({
      data: { projectId: apiGateway.id, userId: youssef.id },
    }),
    // Analytics Dashboard – Nour
    prisma.projectMember.create({
      data: { projectId: analytics.id, userId: nour.id },
    }),
  ]);

  console.log(`🤝 Created ${memberships.length} project memberships`);

  // ── Tasks (8 tasks spread across projects) ───────────────────
  const tasks = await Promise.all([
    // Curt Platform tasks
    prisma.task.create({
      data: {
        title: "Set up authentication flow",
        description: "Implement JWT-based login, register, and token refresh",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assignedTo: sara.id,
        projectId: curtPlatform.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Design database schema",
        description: "Create Prisma schema for users, projects, and tasks",
        priority: "HIGH",
        status: "DONE",
        assignedTo: omar.id,
        projectId: curtPlatform.id,
      },
    }),
    // Mobile App tasks
    prisma.task.create({
      data: {
        title: "Build onboarding screens",
        description: "Create swipeable onboarding carousel for first-time users",
        priority: "MEDIUM",
        status: "TODO",
        assignedTo: nour.id,
        projectId: mobileApp.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Integrate push notifications",
        description: "Set up Firebase Cloud Messaging for task reminders",
        priority: "LOW",
        status: "TODO",
        assignedTo: omar.id,
        projectId: mobileApp.id,
      },
    }),
    // Landing Page task
    prisma.task.create({
      data: {
        title: "Create hero section",
        description: "Design and code responsive hero section with CTA",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        assignedTo: youssef.id,
        projectId: landingPage.id,
      },
    }),
    // API Gateway tasks
    prisma.task.create({
      data: {
        title: "Implement rate limiter middleware",
        description: "Add sliding-window rate limiter with Redis backing",
        priority: "HIGH",
        status: "TODO",
        assignedTo: sara.id,
        projectId: apiGateway.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Write API documentation",
        description: "Generate OpenAPI / Swagger docs for all endpoints",
        priority: "LOW",
        status: "TODO",
        assignedTo: youssef.id,
        projectId: apiGateway.id,
      },
    }),
    // Analytics Dashboard task
    prisma.task.create({
      data: {
        title: "Build chart components",
        description: "Create reusable bar, line, and pie chart components",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        assignedTo: nour.id,
        projectId: analytics.id,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);
  console.log("\n🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
