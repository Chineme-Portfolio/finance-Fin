import * as React from "react";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "brand" | "gain" | "loss" | "attention" | "ink";
  size?: "sm" | "md";
}
export declare function Badge(props: BadgeProps): JSX.Element;
