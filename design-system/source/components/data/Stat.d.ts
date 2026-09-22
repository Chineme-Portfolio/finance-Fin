import * as React from "react";
/**
 * A labelled money figure set in the serif with tabular numerals.
 * @startingPoint section="Data" subtitle="Money figures with deltas" viewport="700x180"
 */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  /** Number counts up when animate is set; a string renders verbatim. */
  value: number | string;
  prefix?: string;
  suffix?: string;
  /** Number renders as a signed percentage; string renders verbatim. */
  delta?: number | string;
  deltaLabel?: string;
  size?: "s" | "m" | "l" | "xl";
  /** Counts from zero on mount (respects prefers-reduced-motion). */
  animate?: boolean;
  align?: "left" | "center";
}
export declare function Stat(props: StatProps): JSX.Element;
