import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Preencha seu nome"),
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(4, "Senha é obrigatória"),
});
