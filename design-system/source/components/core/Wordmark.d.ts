import * as React from "react";
/** The brand signature. No logo mark exists — FINBUDDY is set in Instrument Serif, uppercase, 0.18em tracking. */
export interface WordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Cap height in px. 16 in app chrome, 22-30 in marketing headers. */
  size?: number;
  tone?: "ink" | "paper" | "clay";
}
export declare function Wordmark(props: WordmarkProps): JSX.Element;
