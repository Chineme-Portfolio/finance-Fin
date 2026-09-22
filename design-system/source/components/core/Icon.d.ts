import * as React from "react";
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon name, kebab or Pascal ("arrow-right" | "ArrowRight"). */
  name: string;
  /** Pixel box. Default 18. */
  size?: number;
  /** Default 1.75 — FINBUDDY's standard stroke. */
  strokeWidth?: number;
  color?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
