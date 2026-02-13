import 'dotenv/config';
import { z } from 'zod';

// 1️⃣ Define schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production'], {
    error: 'NODE_ENV is required and must be "development", "test", or "production"',
  }),
  PORT: z.preprocess(val => Number(val), z.number().default(3000)),
  FRONTEND_URL: z.string({
    error: 'FRONTEND_URL is required',
  }),
  DATABASE_URL: z.string({
    error: 'DATABASE_URL is required',
  }),
  JWT_ACCESS_SECRET: z
    .string({
      error: 'JWT_ACCESS_SECRET is required',
    })
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string({
      error: 'JWT_REFRESH_SECRET is required',
    })
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
});

// 2️⃣ Parse & validate
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('\n❌ Invalid environment variables detected:\n');
  console.error(parsedEnv.error.format());
  console.error('\nPlease check your .env file or deployment environment.\n');
  process.exit(1); // Fail fast
}

// 3️⃣ Export validated & typed environment
export const env = parsedEnv.data;
