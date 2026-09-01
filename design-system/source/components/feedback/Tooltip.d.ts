import * as React from "react";
export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Plain-language definition. Keep to one sentence — anything longer belongs in a Fin message. */
  content: React.ReactNode;
  side?: "top" | "bottom";
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
