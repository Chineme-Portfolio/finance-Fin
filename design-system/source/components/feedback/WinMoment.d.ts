import * as React from "react";
/**
 * The celebration surface: ink panel, apricot glyph, serif figure. Reserved for money actually secured.
 * @startingPoint section="Feedback" subtitle="Milestone celebration panel" viewport="700x300"
 */
export interface WinMomentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase eyebrow, e.g. "Claimed". */
  headline?: string;
  /** The amount, pre-formatted. */
  value?: string;
  action?: React.ReactNode;
}
export declare function WinMoment(props: WinMomentProps): JSX.Element;
