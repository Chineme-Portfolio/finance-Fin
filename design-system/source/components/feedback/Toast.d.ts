import * as React from "react";
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "success" | "attention";
  action?: React.ReactNode;
  onClose?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;
