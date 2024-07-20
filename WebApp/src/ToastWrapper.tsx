"use client";

import { Toaster } from "./components/ui/toaster";

const ToastWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

export default ToastWrapper;
