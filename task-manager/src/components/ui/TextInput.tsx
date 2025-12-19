"use client";

import React, { useState } from "react";
import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  withPasswordToggle?: boolean;
};

export function TextInput({
  label,
  error,
  id,
  withPasswordToggle,
  type = "text",
  ...rest
}: TextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputId = id ?? rest.name ?? label;
  const isPasswordField = type === "password" && withPasswordToggle;
  const resolvedType = isPasswordField
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

  const baseInputClasses =
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  const errorClasses = error ? "border-red-500" : "border-slate-300";

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      {isPasswordField ? (
        <div className="relative">
          <input
            id={inputId}
            type={resolvedType}
            className={`${baseInputClasses} ${errorClasses} pr-16`}
            {...rest}
          />

          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            {isPasswordVisible ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      ) : (
        <input
          id={inputId}
          type={resolvedType}
          className={`${baseInputClasses} ${errorClasses}`}
          {...rest}
        />
      )}

      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
