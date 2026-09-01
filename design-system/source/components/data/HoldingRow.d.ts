import * as React from "react";
export interface HoldingRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Plain-language explanation of what the holding is. */
  sub?: string;
  /** Pre-formatted currency string, e.g. "$5,215". */
  value: string;
  percent?: number;
  /** Signed percentage; pine when up, clay when down. */
  delta?: number;
  /** Dot colour — pass a --chart-N token to match the allocation bar. */
  color?: string;
}
export declare function HoldingRow(props: HoldingRowProps): JSX.Element;
