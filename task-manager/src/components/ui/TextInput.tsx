"use client";

import React from "react";
import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextInput({ label, error, id, ...props }: TextInputProps) {
  const inputId = id ?? props.name ?? label;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        id={inputId}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        {...props}
      />

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
