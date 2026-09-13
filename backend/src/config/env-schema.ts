import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL phải là một connection string hợp lệ'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET phải có độ dài tối thiểu 32 ký tự'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET phải có tối thiểu 32 ký tự'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  GOOGLE_CLIENT_ID: z.string().optional()
});

export type EnvConfig = z.infer<typeof envSchema>;
