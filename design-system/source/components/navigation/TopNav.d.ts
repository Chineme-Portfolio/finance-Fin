import * as React from "react";
export interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: string[];
  active?: string;
  onSelect?: (item: string) => void;
  /** Right-hand slot; defaults to a settings IconButton. */
  right?: React.ReactNode;
  tone?: "paper" | "ink";
}
export declare function TopNav(props: TopNavProps): JSX.Element;
