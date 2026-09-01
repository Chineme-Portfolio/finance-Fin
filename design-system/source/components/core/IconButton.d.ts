import * as React from "react";
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name. */
  name: string;
  /** Required accessible label. */
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "tint" | "solid";
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
