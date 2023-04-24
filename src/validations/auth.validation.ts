import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    firstName: z
      .string({
        required_error: 'First name is required',
        invalid_type_error: 'First name must be a string',
      })
      .min(2, {
        message: 'First name must be at least 2 characters',
      })
      .max(15, 'First name cannot be more than 15 characters')
      .trim(),
    lastName: z
      .string({
        required_error: 'Last name is required',
        invalid_type_error: 'Last name must be a string',
      })
      .min(2, {
        message: 'Last name must be at least 2 characters',
      })
      .max(20, 'Last name cannot be more than 20 characters')
      .trim(),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email(),
    phoneNumber: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 characters' })
      .max(15, {
        message: 'Phone number cannot exceed 15 characters',
      })
      .optional(),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, {
        message: 'Password must be at least 8 characters',
      }),
  }),
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;
