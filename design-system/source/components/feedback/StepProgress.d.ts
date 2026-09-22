import * as React from "react";
export interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short verb-led labels, e.g. ["Link", "Check", "Choose", "Done"]. */
  steps: string[];
  /** Zero-based index of the active step. */
  current?: number;
}
export declare function StepProgress(props: StepProgressProps): JSX.Element;
