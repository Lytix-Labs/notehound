"use client";

import store from "@/components/Redux/store";
import { Provider } from "react-redux";

export default function ReduxWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
