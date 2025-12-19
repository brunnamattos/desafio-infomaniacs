"use client";

import React, { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { apiRegister } from "@/lib/api";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormErrors = Partial<
  Record<keyof RegisterFormState | "global", string>
>;

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(fieldValues: RegisterFormState): RegisterFormErrors {
    const newErrors: RegisterFormErrors = {};

    if (!fieldValues.name) {
      newErrors.name = "Nome é obrigatório.";
    }

    if (!fieldValues.email) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(fieldValues.email)) {
      newErrors.email = "Digite um email válido.";
    }

    if (!fieldValues.password) {
      newErrors.password = "Senha é obrigatória.";
    } else if (fieldValues.password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres.";
    }

    if (fieldValues.confirmPassword !== fieldValues.password) {
      newErrors.confirmPassword = "As senhas não coincidem.";
    }

    return newErrors;
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    const fieldName = name as keyof RegisterFormState;

    setValues((prev) => ({ ...prev, [fieldName]: value }));

    // limpa erro só do campo editado
    setErrors((prev) => ({
      ...prev,
      [fieldName]: undefined,
      global: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validate(values);
    if (
      validation.name ||
      validation.email ||
      validation.password ||
      validation.confirmPassword
    ) {
      setErrors(validation);
      return;
    }

    try {
      setIsSubmitting(true);
      await apiRegister({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar conta.";
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
      <h1 className="text-xl font-semibold text-slate-900">Criar conta</h1>
      <p className="text-sm text-slate-600">
        Crie sua conta para começar a organizar suas tarefas.
      </p>

      <TextInput
        label="Nome"
        name="name"
        value={values.name}
        onChange={handleChange}
        autoComplete="name"
        error={errors.name}
      />

      <TextInput
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        autoComplete="email"
        error={errors.email}
      />

      <TextInput
        label="Senha"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        autoComplete="new-password"
        error={errors.password}
      />

      <TextInput
        label="Confirmar senha"
        name="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      {errors.global ? (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-600">
          {errors.global}
        </div>
      ) : null}

      <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
        Criar conta
      </Button>

      <p className="mt-2 text-center text-xs text-slate-500">
        Já tem conta?{" "}
        <a
          href="/login"
          className="font-medium text-indigo-600 hover:underline"
        >
          Entrar
        </a>
      </p>
    </form>
  );
}
