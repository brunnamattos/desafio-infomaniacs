import React, { useState } from "react";
import type { FormEvent } from "react";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import type { TaskStatus } from "@/types/tasks";

type TaskFormProps = {
  onSubmit: (data: {
    title: string;
    description: string;
    status: TaskStatus;
  }) => Promise<void> | void;
};

type TaskFormState = {
  title: string;
  description: string;
  status: TaskStatus;
};

type TaskFormErrors = {
  title?: string;
};

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormState>({
    title: "",
    description: "",
    status: "pending",
  });
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ): void {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function validate(state: TaskFormState): TaskFormErrors {
    const newErrors: TaskFormErrors = {};
    if (!state.title) {
      newErrors.title = "Título é obrigatório.";
    }
    return newErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate(values);

    if (validation.title) {
      setErrors(validation);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
      setValues({ title: "", description: "", status: "pending" });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4"
    >
      <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
        <TextInput
          label="Título"
          name="title"
          value={values.title}
          onChange={handleChange}
          error={errors.title}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="status"
            className="text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="pending">Pendente</option>
            <option value="in_progress">Em progresso</option>
            <option value="completed">Concluída</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-700"
        >
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={values.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Adicionar tarefa
        </Button>
      </div>
    </form>
  );
}
