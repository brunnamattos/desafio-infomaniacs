import React from "react";
import type { Task, TaskStatus } from "@/types/tasks";
import { Button } from "@/components/ui/Button";

type TaskListProps = {
  tasks: Task[];
  filterStatus: TaskStatus | "all";
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
};

export function TaskList({
  tasks,
  filterStatus,
  onChangeStatus,
  onDelete,
}: TaskListProps) {
  const filtered =
    filterStatus === "all"
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        Nenhuma tarefa encontrada.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {filtered.map((task) => (
        <li
          key={task.id}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {task.title}
            </h3>
            {task.description ? (
              <p className="mt-1 text-xs text-slate-600">{task.description}</p>
            ) : null}
            <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
              {task.status === "pending" && "Pendente"}
              {task.status === "in_progress" && "Em progresso"}
              {task.status === "completed" && "Concluída"}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 md:mt-0 md:justify-end">
            {task.status !== "pending" && (
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1 text-xs"
                onClick={() => onChangeStatus(task.id, "pending")}
              >
                Marcar pendente
              </Button>
            )}

            {task.status !== "in_progress" && (
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1 text-xs"
                onClick={() => onChangeStatus(task.id, "in_progress")}
              >
                Em progresso
              </Button>
            )}

            {task.status !== "completed" && (
              <Button
                type="button"
                variant="primary"
                className="px-3 py-1 text-xs"
                onClick={() => onChangeStatus(task.id, "completed")}
              >
                Concluir
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1 text-xs text-red-600 hover:bg-red-50"
              onClick={() => onDelete(task.id)}
            >
              Excluir
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
