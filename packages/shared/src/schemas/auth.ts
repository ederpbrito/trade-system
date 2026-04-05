import { z } from "zod";

/** Zod `.email()` rejeita `utilizador@localhost`; o seed de dev usa esse formato. */
const loginEmailSchema = z
  .string()
  .min(1, "Indique o email.")
  .refine(
    (value) =>
      z.string().email().safeParse(value).success || /^[^\s@]+@localhost$/i.test(value.trim()),
    { message: "Email inválido." },
  );

export const loginBodySchema = z.object({
  email: loginEmailSchema,
  password: z.string().min(1, "Indique a palavra-passe."),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
