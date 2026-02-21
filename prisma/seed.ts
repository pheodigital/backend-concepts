import { PrismaClient, Role, TaskStatus } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1️⃣ Users to create
  const usersData = [
    {
      email: "admin@example.com",
      password: "AdminPassword123!",
      role: Role.ADMIN,
    },
    {
      email: "user1@example.com",
      password: "User1Password123!",
      role: Role.USER,
    },
    {
      email: "user2@example.com",
      password: "User2Password123!",
      role: Role.USER,
    },
  ];

  // 2️⃣ Create or update users (idempotent)
  const createdUsers = [];
  for (const u of usersData) {
    const hashedPassword = await argon2.hash(u.password);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword }, // update password if exists
      create: {
        email: u.email,
        password: hashedPassword,
        role: u.role,
      },
    });

    createdUsers.push(user);
  }

  console.log(`✅ Created/updated ${createdUsers.length} users.`);

  // 3️⃣ Seed tasks for each user
  for (const user of createdUsers) {
    const tasksData = [
      {
        title: `Task 1 for ${user.email}`,
        description: "This is the first task",
        status: TaskStatus.OPEN,
        ownerId: user.id,
      },
      {
        title: `Task 2 for ${user.email}`,
        description: "This is the second task",
        status: TaskStatus.IN_PROGRESS,
        ownerId: user.id,
      },
      {
        title: `Task 3 for ${user.email}`,
        description: "This is the third task",
        status: TaskStatus.DONE,
        ownerId: user.id,
      },
    ];

    await prisma.task.createMany({
      data: tasksData,
      skipDuplicates: true, // avoids duplicates if re-running seed
    });
  }

  console.log("✅ All tasks seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🌱 Database connection closed.");
  });
