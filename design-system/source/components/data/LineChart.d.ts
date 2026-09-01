import * as React from "react";
export interface LineChartProps extends React.SVGAttributes<SVGSVGElement> {
  /** Raw values; the chart scales to its own min/max. */
  points: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Soft wash under the line. Default true. */
  fill?: boolean;
  showDot?: boolean;
}
export declare function LineChart(props: LineChartProps): JSX.Element;
