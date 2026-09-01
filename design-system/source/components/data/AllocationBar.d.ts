import * as React from "react";
export interface AllocationSegment { label: string; value: number; color?: string }
export interface AllocationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: AllocationSegment[];
  height?: number;
  /** Space between segments; the gap is what makes it read as FINBUDDY and not a progress bar. */
  gap?: number;
  showLegend?: boolean;
}
export declare function AllocationBar(props: AllocationBarProps): JSX.Element;
