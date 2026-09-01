import * as React from "react";
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  /** Set in the serif, sentence case, phrased as a plain question or statement. */
  title: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  width?: number;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
