import type { Auth } from "@/types/auth";
import type { Task, TaskStatus } from "@/types/tasks";
import type { ApiError } from "@/types/api";

const BASE_URL = "";

async function handleResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ApiError;

  if (!response.ok) {
    const errorData = data as ApiError;
    throw new Error(errorData.message ?? "Request failed");
  }

  return data as T;
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// Auth
export async function apiRegister(
  payload: { name: string; email: string; password: string },
): Promise<Auth.RegisterResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<Auth.RegisterResponse>(response);
}

export async function apiLogin(
  payload: { email: string; password: string },
): Promise<Auth.LoginResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<Auth.LoginResponse>(response);
}

// Tasks
export async function apiGetTasks(): Promise<{ tasks: Task[] }> {
  const response = await fetch(`${BASE_URL}/api/tasks`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<{ tasks: Task[] }>(response);
}

export async function apiCreateTask(
  payload: { title: string; description?: string; status?: TaskStatus },
): Promise<{ task: Task }> {
  const response = await fetch(`${BASE_URL}/api/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<{ task: Task }>(response);
}

export async function apiUpdateTask(
  id: number,
  payload: { title?: string; description?: string; status?: TaskStatus },
): Promise<{ task: Task }> {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<{ task: Task }>(response);
}

export async function apiDeleteTask(
  id: number,
): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse<{ message: string }>(response);
}
