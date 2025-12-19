"use client";

import React, { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { apiLogin } from "@/lib/api";

type LoginFormState = {
  email: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormState | "global", string>>;

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(fieldValues: LoginFormState): LoginFormErrors {
    const newErrors: LoginFormErrors = {};

    if (!fieldValues.email) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(fieldValues.email)) {
      newErrors.email = "Digite um email válido.";
    }

    if (!fieldValues.password) {
      newErrors.password = "Senha é obrigatória.";
    }

    return newErrors;
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    const fieldName = name as keyof LoginFormState;

    setValues((prev) => ({ ...prev, [fieldName]: value }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: undefined,
      global: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validate(values);
    if (validation.email || validation.password) {
      setErrors(validation);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiLogin({
        email: values.email,
        password: values.password,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao fazer login.";
      setErrors((prev) => ({ ...prev, global: message }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white p-6 shadow-md"
    >
      <h1 className="text-xl font-semibold text-slate-900">Entrar</h1>
      <p className="text-sm text-slate-600">
        Acesse sua conta para gerenciar suas tarefas.
      </p>

      <TextInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />

      <TextInput
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />

      {errors.global ? (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-600">
          {errors.global}
        </div>
      ) : null}

      <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
        Entrar
      </Button>

      <p className="mt-2 text-center text-xs text-slate-500">
        Ainda não tem conta?{" "}
        <a
          href="/register"
          className="font-medium text-indigo-600 hover:underline"
        >
          Criar conta
        </a>
      </p>
    </form>
  );
}
