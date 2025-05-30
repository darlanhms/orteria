import { z } from 'zod';

export const userSchema = z.object({
  name: z.string(),
});

export type UserRequest = z.infer<typeof userSchema>;
