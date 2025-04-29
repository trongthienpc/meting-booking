import { z } from "zod";

export const signInSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type SignInSchemaType = z.infer<typeof signInSchema>;
