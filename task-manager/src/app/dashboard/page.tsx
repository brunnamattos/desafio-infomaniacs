"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/Button";
import {
  apiCreateTask,
  apiDeleteTask,
  apiGetTasks,
  apiUpdateTask,
} from "@/lib/api";
import type { Task, TaskStatus } from "@/types/tasks";

type FilterStatus = TaskStatus | "all";

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    void loadTasks();
  }, [router]);

  async function loadTasks(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await apiGetTasks();
      setTasks(response.tasks);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar tarefas.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTask(data: {
    title: string;
    description: string;
    status: TaskStatus;
  }): Promise<void> {
    try {
      const response = await apiCreateTask({
        title: data.title,
        description: data.description,
        status: data.status,
      });

      setTasks((prev) => [response.task, ...prev]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar tarefa.";
      setErrorMessage(message);
    }
  }

  async function handleChangeStatus(
    id: number,
    status: TaskStatus
  ): Promise<void> {
    try {
      const response = await apiUpdateTask(id, { status });
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? response.task : task))
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar tarefa.";
      setErrorMessage(message);
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      await apiDeleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir tarefa.";
      setErrorMessage(message);
    }
  }

  function handleLogout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Task Manager</h1>
          <p className="text-xs text-slate-500">
            Organize e acompanhe suas tarefas diárias.
          </p>
        </div>

        <Button variant="ghost" onClick={handleLogout}>
          Sair
        </Button>
      </header>

      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
        <TaskForm onSubmit={handleCreateTask} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Minhas tarefas
          </h2>

          <div className="flex gap-2 text-xs">
            {(["all", "pending", "in_progress", "completed"] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status as FilterStatus)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {status === "all" && "Todas"}
                  {status === "pending" && "Pendentes"}
                  {status === "in_progress" && "Em progresso"}
                  {status === "completed" && "Concluídas"}
                </button>
              )
            )}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-600">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Carregando tarefas...
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            filterStatus={filterStatus}
            onChangeStatus={handleChangeStatus}
            onDelete={handleDelete}
          />
        )}
      </section>
    </main>
  );
}
