// src/config/env.ts
import "dotenv/config";
import { z } from "zod";

const isTest = process.env.NODE_ENV === "test";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.preprocess(
    (val) => (val === undefined ? 3000 : Number(val)),
    z.number().int().positive(),
  ),

  FRONTEND_URL: isTest
    ? z.string().default("http://localhost:3000")
    : z.string({ error: "FRONTEND_URL is required" }),

  DATABASE_URL: z.string({ error: "DATABASE_URL is required" }),

  JWT_ACCESS_SECRET: isTest
    ? z.string().default("test-access-secret-32-characters-long!!!")
    : z
        .string({ error: "JWT_ACCESS_SECRET is required" })
        .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: isTest
    ? z.string().default("test-refresh-secret-32-characters-long!!")
    : z
        .string({ error: "JWT_REFRESH_SECRET is required" })
        .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

// Parse & validate
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("\n❌ Invalid environment variables detected:\n");
  console.error(parsedEnv.error.format());
  console.error("\nPlease check your .env file or deployment environment.\n");

  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }

  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
