import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      (value) => !value.includes('@') || z.email().safeParse(value).success,
      'Enter a valid email address',
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
