"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: "0.875rem",
        },
      }}
    />
  );
}
