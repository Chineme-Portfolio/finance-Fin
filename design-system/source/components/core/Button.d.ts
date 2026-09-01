import * as React from "react";
/**
 * FINBUDDY's action control. Pill by default.
 * @startingPoint section="Core" subtitle="Buttons in every variant and size" viewport="700x220"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = clay fill (one per view). pop = apricot, for celebratory/opt-in moments only. */
  variant?: "primary" | "secondary" | "ghost" | "inverse" | "pop";
  size?: "sm" | "md" | "lg";
  /** Lucide icon name rendered before the label. */
  iconLeft?: string;
  iconRight?: string;
  full?: boolean;
  /** Pill radius (default). false gives --radius-sm, used only inside dense toolbars. */
  pill?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
