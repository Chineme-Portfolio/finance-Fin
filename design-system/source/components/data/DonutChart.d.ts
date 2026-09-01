import * as React from "react";
export interface DonutSegment { label?: string; value: number; color?: string }
export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  /** Small uppercase caption inside the ring. */
  label?: string;
  /** Serif figure inside the ring. */
  value?: string;
}
export declare function DonutChart(props: DonutChartProps): JSX.Element;
