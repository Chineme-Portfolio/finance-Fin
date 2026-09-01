import * as React from "react";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  /** Replaces hint and turns the field clay-red. */
  error?: string;
  /** Serif currency mark rendered inside the field, e.g. "$". */
  prefix?: string;
  suffix?: string;
  iconLeft?: string;
  size?: "sm" | "md" | "lg";
  wrapStyle?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
