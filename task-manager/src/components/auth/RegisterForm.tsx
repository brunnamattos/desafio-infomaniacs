"use client";

import React, { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { apiRegister } from "@/lib/api";
import { evaluatePassword, getEmptyPasswordValidation } from "@/lib/password";
import type {
  PasswordStrength,
  PasswordValidationResult,
} from "@/types/password";

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

  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidationResult>(() => getEmptyPasswordValidation());

  function validate(fieldValues: RegisterFormState): RegisterFormErrors {
    const newErrors: RegisterFormErrors = {};

    if (!fieldValues.name) {
      newErrors.name = "Nome é obrigatório.";
    }

    if (!fieldValues.email) {
      newErrors.email = "E-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(fieldValues.email)) {
      newErrors.email = "Digite um email válido.";
    }

    if (!fieldValues.password) {
      newErrors.password = "Senha é obrigatória.";
    } else {
      const passwordResult = evaluatePassword(fieldValues.password);
      const allChecksPassed = Object.values(passwordResult.checks).every(
        Boolean
      );

      if (passwordResult.strength !== "strong" || !allChecksPassed) {
        newErrors.password =
          "A senha precisa ser forte e atender a todos os requisitos abaixo.";
      }
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

    if (fieldName === "password") {
      const result = evaluatePassword(value);
      setPasswordValidation(result);
    }

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

      if (validation.password) {
        toast.error(validation.password);
      }

      return;
    }

    try {
      setIsSubmitting(true);

      await apiRegister({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar conta.";
      setErrors((prev) => ({ ...prev, global: message }));
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function getStrengthLabel(strength: PasswordStrength): string {
    if (strength === "strong") return "Forte";
    if (strength === "medium") return "Média";
    return "Fraca";
  }

  function getStrengthColor(strength: PasswordStrength): string {
    if (strength === "strong") return "bg-emerald-500";
    if (strength === "medium") return "bg-amber-400";
    return "bg-red-500";
  }

  const { checks, strength } = passwordValidation;

  const allPasswordChecksPassed = Object.values(checks).every(Boolean);

  const isPasswordStrongEnough =
    strength === "strong" && allPasswordChecksPassed;

  const isFormValid =
    Boolean(
      values.name &&
        values.email &&
        values.password &&
        values.confirmPassword &&
        values.password === values.confirmPassword
    ) && isPasswordStrongEnough;

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
        maxLength={50}
        error={errors.name}
      />

      <TextInput
        label="E-mail"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        autoComplete="email"
        error={errors.email}
      />

      <div className="flex flex-col gap-2">
        <TextInput
          label="Senha"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          autoComplete="new-password"
          maxLength={32}
          withPasswordToggle
          error={errors.password}
        />

        {/* Barrinhas de força */}
        {values.password ? (
          <div className="flex flex-col gap-1">
            {(() => {
              const barsColors: string[] =
                strength === "strong"
                  ? ["bg-emerald-500", "bg-emerald-500", "bg-emerald-500"] // forte: 3 verdes
                  : strength === "medium"
                  ? ["bg-amber-400", "bg-amber-400", "bg-slate-200"] // média: 2 amarelas
                  : ["bg-red-500", "bg-slate-200", "bg-slate-200"]; // fraca/default: 1 vermelha

              return (
                <div className="flex h-1.5 gap-1">
                  {barsColors.map((color, index) => (
                    <div
                      key={`password-strength-bar-${index}`}
                      className={`flex-1 rounded-full ${color}`}
                    />
                  ))}
                </div>
              );
            })()}

            <p className="text-[11px] text-slate-600">
              Força da senha:{" "}
              <span
                className={`font-bold ${
                  strength === "strong"
                    ? "text-emerald-600"
                    : strength === "medium"
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
              >
                {getStrengthLabel(strength)}
              </span>
            </p>
          </div>
        ) : null}

        {/* Lista de requisitos */}
        <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
          <li className={checks.length ? "text-emerald-600" : ""}>
            • Mínimo de 8 caracteres
          </li>
          <li className={checks.lowercase ? "text-emerald-600" : ""}>
            • Pelo menos uma letra minúscula
          </li>
          <li className={checks.uppercase ? "text-emerald-600" : ""}>
            • Pelo menos uma letra maiúscula
          </li>
          <li className={checks.number ? "text-emerald-600" : ""}>
            • Pelo menos um número
          </li>
          <li className={checks.specialChar ? "text-emerald-600" : ""}>
            • Pelo menos um caractere especial
          </li>
        </ul>
      </div>

      <TextInput
        label="Confirmar senha"
        name="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        autoComplete="new-password"
        maxLength={32}
        withPasswordToggle
        error={errors.confirmPassword}
      />

      {errors.global ? (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-600">
          {errors.global}
        </div>
      ) : null}

      <Button
        type="submit"
        className="mt-2 w-full"
        isLoading={isSubmitting}
        disabled={!isFormValid}
      >
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
