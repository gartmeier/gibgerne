import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organization: z
    .string()
    .min(2, "Organization name must be at least 2 characters"),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
